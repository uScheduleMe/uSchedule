# Django
from django.db.models.expressions import Case, Value, When
from django.db.models.query_utils import Q
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from rest_framework import (
    viewsets,
    mixins,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from dry_rest_permissions.generics import DRYPermissions
# Python
from copy import deepcopy
import os
import time
from typing import TypeVar
from collections import OrderedDict
#@TODO Replace with QuerySet of Timetable type
T = TypeVar("T")
# Local
from .models import (
    Accreditation,
    AccreditationUnit,
    Activity,
    Calendar,
    CalendarShare,
    Course,
    Schedule,
    Timetable,
    Timestamp,
    User,
    AvailableTerms,
)
from .serializers import (
    AccreditationSerializer,
    AccreditationSummarySerializer,
    AccreditationUnitSerializer,
    ActivitySerializer,
    ActivitySummarySerializer,
    CalendarShareSerializer,
    CourseSerializer,
    TimetableSerializer,
    TimestampSerializer,
    TimestampDeserializer,
    TimetableSummarySerializer,
    UserSerializer,
    ScheduleSerializer,
    ScheduleDownloadSerializer,
    AvailableTermsSerializer,
)
from .filters import (
    QueryParamValidationException,
    ScheduleFilterSet,
    TimetableSummaryFilterSet,
    UserFilterSet,
)
from .pagination import TruncatePaginator
from .views_helpers import (
    is_subject_course_code,
    search_to_str,
    http_responder,
)
from .auth.permission_helpers import has_scopes
from .regex_patterns import (
    full_course_code_pattern,
    term_code_pattern,
)
from updater.timetables import TimetableUpdater

# Logging
import logging
logger = logging.getLogger('uschedule.da')


################################################################################
#   TIMETABLE HELPER FUNCTIONS
################################################################################


def get_timetables(search: dict) -> T:
    """
    Returns:
        A Django QuerySet object (sequence) containing
            Timetable objects
    """
    logger.debug("Getting timetables for {}".format(
        search_to_str(search)
    ))
    timetables = Timetable.objects.filter(**search)
    return timetables

def update_timetables(search: dict) -> bool:
    """Update courses matching `search`.
    """
    school = search["school"]
    year = search["year"]
    term = search["term"]
    search_list = [
        "{subject_code}{course_code}".format(**search)
    ]
    search_str = search_to_str(search)
    logger.info("Update attempt for: {}".format(
        search_str
    ))
    #@TODO Currently assuming `search["school"] == "uottawa"`
    # Handle different schools?
    try:
        TimetableUpdater().update_timetables(
            year=year,
            term=term,
            search_list=search_list,
        )
    except Exception as e:
        logger.error("Update failed for: {}".format(
            search_str
        ))
        logger.debug("Update failed for: {}".format(
            search_str
        ), exc_info=True)
        return False
    logger.info("Update succeeded for: {}".format(
        search_str
    ))
    return True

def put_timetable_stub(search: dict) -> None:
    """
    Adds a stub in the DB matching the `search` dict provided.
    """
    logger.info("Putting stub: {}".format(search_to_str(search)))
    tts = Timetable.objects.filter(**search)
    if len(tts) == 1:
        tts[0].sections = {}
        tts[0].save()
        return
    # @NOTE The `update` part of this method
    # does not seem to be working properly:
    # if there is an existing record,
    # it does not update, but tries to create
    # a new record, violating the uniqueness constraint.
    # The custom update above circumvents this.
    Timetable.objects.update_or_create(
        sections={},
        **search,
    )

def get_fullscrape_timestamp(
    year: int,
    term: str,
    school: str,
    **kwargs
) -> int:
    """
    Get the timestamp of the most recent full scrape
    matching the arguments.

    Args:
        kwargs: Ignored.

    Returns:
        The Unix timestamp desired.
        If it cannot be found or disambiguated,
        return the current time minus 24 hours.
    """
    fullscrape_reason = "{}-fullscrape".format(
        ":".join(str(x).strip() for x in (year, term, school))
    )
    logger.debug("Getting timestamp for {}".format(fullscrape_reason))
    fullscrape = Timestamp.objects.filter(
        reason=fullscrape_reason,
    )
    if len(fullscrape) != 1:
        logger.warning(
            "Timestamp data of length {}, not 1 for {}".format(
                len(fullscrape), fullscrape_reason
        ))
        return int(time.time()) - 24*60*60
    else:
        # max out at a 2 day old timestamp, just in case double checks fail
        return max(fullscrape[0].timestamp, int(time.time()) - 2*24*60*60)

def timetable_is_recent(tt: T) -> bool:
    """Checks to see if the provided timetable is newer
    than the most recent full scrape.
    """
    logger.debug("Is timetable recent? {}".format(
        tt.date_updated
    ))
    return tt.date_updated >= get_fullscrape_timestamp(
        tt.year, tt.term, tt.school,
    )


################################################################################
#   VIEWS
################################################################################

@api_view(['GET'])
def heartbeatView(request, version):
    return Response({})

class TimetableViewSet(viewsets.ModelViewSet):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    filter_backends = (DjangoFilterBackend, )
    filterset_fields = ("school", "year", "term", "subject_code", "course_code")

    def put(self, request, *args, **kwargs):
        """Create or update timetable records.

        We use put for update and create here, if the object doesn't exist we
        create, if it does then we just update the one we have.

        Returns:
            A map of the new and old objects.
            If the old object did not exist, `None` is returned in its place.
        """
        put_id = "{school} {term} {year}, {subject_code}{course_code}".format(
            **request.data
        )
        logger.info("Putting: {}".format(put_id))
        old = Timetable.objects.filter(
            school = request.data["school"],
            year = request.data["year"],
            subject_code = request.data["subject_code"],
            course_code = request.data["course_code"],
            term = request.data["term"]
        )

        # There is no old object
        if len(old) == 0:
            logger.info("New timetable: {}".format(put_id))
            res = self.create(request, *args, **kwargs)
            # Since there is no old object we return None
            return Response({"new":res.data, "old":None})

        # It's ok to select the 0th here because the filters will always
        # yield a unique tuple
        tmp = old[0]

        # We need to return new and old so we save a copy for returning
        old = deepcopy(tmp)
        new = tmp

        # Update all fields from the request
        for key, value in request.data.items():
            setattr(new, key, value)
        new.save()

        old = TimetableSerializer(old)
        new = TimetableSerializer(new)

        logger.info("Updated timetable: {}".format(put_id))
        return Response({"new":new.data, "old":old.data})

    def list(self, request, *args, **kwargs):
        """Handles GET requests.

        Overridden such that, if the caller is looking for a
        specific course that is not found in the DB,
        call the updater on this course and then check again.
        This is because batch scrapes tend to miss courses.

        Furthermore, for courses which are specifically
        queried but not found, stubs are placed in the DB
        to indicate that the course is not offered.

        Returns:
            Course timetables.
        """
        # If the query isn't for a specific course,
        # let the parent method handle it.
        search = request.query_params.dict()
        if (os.getenv("DOUBLE_CHECK", "").strip().lower() == "false"
          or any(x not in search for x in self.filterset_fields)
          or not is_subject_course_code(
            "{subject_code}{course_code}".format(**search)
          )
          or AvailableTerms.objects.filter(term=search['term'], year=search['year']).count() < 1
        ):
            res = super().list(request, *args, **kwargs)
            if not (any(x not in search for x in self.filterset_fields)
                or not is_subject_course_code(
                    "{subject_code}{course_code}".format(**search)
            )) and res.data == []:
                res.status_code = 404
            return res
        # Clean the dict
        search = {
            x:y for x, y in search.items()
            if x in self.filterset_fields
        }
        search['subject_code'] = search['subject_code'].upper()
        logger.info("Searching for individual course {}".format(
            search_to_str(search)
        ))
        logger.debug("Query: {}".format(search))
        return self.__list(search)

    @http_responder(TimetableSerializer)
    def __list(self, search):
        """See `TimetableViewSet.list`.
        """
        search_str = search_to_str(search)
        logger.info("Searching for {}".format(search_str))
        # Search for matching timetables
        timetables = get_timetables(search)
        # If none found, call the updater
        if len(timetables) == 0:
            logger.info("{} not found, double checking".format(search_str))
            # If updater is unsuccessful, return
            if not update_timetables(search):
                return
            logger.info("Double check success, search again for {}".format(
                search_str
            ))
            # If updater is successful,
            # search again for matching timetables
            timetables = get_timetables(search)
            # If still no timetables are found
            # add a stub to indicate not offered
            if len(timetables) == 0:
                logger.info("{} not found, putting stub".format(
                    search_str
                ))
                put_timetable_stub(search)
                return
            #@TODO Maybe remove this?
            # Let the code below handle it?
            else:
                logger.info("{} found, returning".format(search_str))
                return timetables

        # If timetables are found, ensure they are recent
        if timetable_is_recent(timetables[0]):
            logger.info("{} found, is recent".format(search_str))
            return timetables
        logger.info("{} found, not recent, updating".format(search_str))
        # If they are not recent, call the updater
        if not update_timetables(search):
            return

        # If the updater is successful,
        # search again for matching timetables
        logger.info("Update success, search again for {}".format(
            search_str
        ))
        timetables = get_timetables(search)
        if len(timetables) == 0: # This should never happen
            logger.error("{} not found".format(
                search_str
            ))
            return
        # Check to see if the timetables are now recent
        if timetable_is_recent(timetables[0]):
            logger.info("{} found, is recent".format(search_str))
            return timetables
        # If the timetables are still not recent,
        # the course has likely been removed,
        # so put a stub
        logger.info("{} found, not recent, putting stub".format(search_str))
        put_timetable_stub(search)
        return


class TimetableSummaryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSummarySerializer
    filter_backends = (DjangoFilterBackend, )
    filterset_class = TimetableSummaryFilterSet
    pagination_class = TruncatePaginator

    def get_queryset(self):
        query_str = self.request.query_params.get("search")
        if query_str == None:
            return super().get_queryset()

        course = full_course_code_pattern.search(query_str)

        if (course != None):
            return super().get_queryset().filter(
                subject_code__iexact = course.group("subject_code"),
                course_code = course.group("course_code"),
            ).order_by(
                'subject_code',
                'course_code',
                'year',
                Case(
                    When( term='winter', then=Value(0) ),
                    When( term='summer', then=Value(1) ),
                    When( term='fall', then=Value(2) ),
                ),
            )

        vector = SearchVector('course_name')
        query = SearchQuery(query_str)

        return super().get_queryset().annotate(
            rank=SearchRank(vector, query)
        ).filter(
            rank__gt=0
        ).order_by(
            '-rank',
            'year',
            Case(
                When( term='winter', then=Value(0) ),
                When( term='summer', then=Value(1) ),
                When( term='fall', then=Value(2) ),
            ),
        )


#@TODO Change to a function that only does PUT?
class TimestampViewSet(viewsets.ModelViewSet):
    queryset = Timestamp.objects.all()
    filter_backends = (DjangoFilterBackend, )
    filterset_fields = ("reason", )

    def get_serializer_class(self):
        if self.action in {None, "create", "update", "partial_update"}:
            return TimestampDeserializer
        else:
            return TimestampSerializer

    #@TODO Abstract this away with the Timetable `put` method
    # Or replace with `update_or_create`?
    def put(self, request, *args, **kwargs):
        """Create or update timestamp records.

        We use put for update and create here, if the object doesn't exist we
        create, if it does then we just update the one we have.
        """
        old = Timestamp.objects.filter(
            reason=request.data["reason"],
        )
        if len(old) == 0:
            res = self.create(request, *args, **kwargs)
            return Response({"new": res.data, "old": None})
        new = old[0]
        old = deepcopy(new)
        for key, value in request.data.items():
            setattr(new, key, value)
        new.save()
        old = TimestampSerializer(old)
        new = TimestampSerializer(new)
        return Response({"new": new.data, "old": old.data})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilterSet
    filter_backends = (DjangoFilterBackend, )
    permission_classes = (DRYPermissions, )
    http_method_names = ['get', 'post', 'patch', 'delete']
    lookup_field = 'uuid'

    def get_queryset(self):
        '''
        Filter the queryset for only users the user can view.

        If the request is not from a service We filter out any user
        that is not either the requesting user or a user that has shared
        a calendar with the requesting user.

        We need to filter the `component` outside the filter backend because
        if the component is 'LEC' we need to ignore that filter.
        '''
        queryset = super().get_queryset()
        if not has_scopes(self.request, 'service'):
            queryset = queryset.filter(
                Q(uuid=self.request.jwt.sub) |
                Q(calendars__shares__user__uuid=self.request.jwt.sub) |
                Q(calendar_shares__calendar__user__uuid=self.request.jwt.sub)
            ).distinct()
        if self.request.query_params.get('shared_with_me'):
            queryset = queryset.filter(calendars__shares__user__uuid=self.request.jwt.sub)
        if self.request.query_params.get('shared_by_me'):
            queryset = queryset.filter(calendar_shares__calendar__user__uuid=self.request.jwt.sub)

        # TODO: uncomment and fix this when we add schedule notifications
        # if self.request.query_params.get("component", 'LEC') != 'LEC':
        #     logger.info("get_queryset: component is not LEC")
        #     queryset = queryset.filter(schedules__schedule_comps__course_data__component = self.request.query_params.get("components"))
        # else:
        #     logger.info("get_queryset: component is LEC, ignoring filter")

        return queryset

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    filterset_class = ScheduleFilterSet
    filter_backends = (DjangoFilterBackend, )
    permission_classes = (DRYPermissions, )
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        """
        Filter the queryset by only the signed in user.

        This will need to be updated when users can view schedules
        from friends.
        """
        return super().get_queryset().filter(
            Q(calendar__user__uuid=self.request.jwt.sub) |
            Q(calendar__shares__user__uuid=self.request.jwt.sub)
        ).distinct()


@api_view(['POST'])
def ScheduleDownloadView(request, version):
    """Get the required information to build a schedule.

    The componenets to include are specified in the request body.
    Returns a component structure with all parent information flattened into it.
    """

    def build_failed_comp(course, section_id, component_id):
        tt_id = search_to_str(course)
        logger.warning("Failed components found: {} : {}, {}".format(
            tt_id, section_id, component_id
        ))
        return {
            **{key: val for key, val in course.items() if key != 'sections'},
            "section": section_id,
            "component": component_id,
        }
    output = []
    meta = {
        'messages': [],
        'failed_comps': [],
    }
    status_code = 200
    data = request.data

    logger.info("Posting data on version {}".format(version))
    for course in data:
        tt_id = search_to_str(course)
        try:
            if "id" in course:
                course_obj = Timetable.objects.get(pk=course["id"])
            else:
                # This will always be unique if not we have data integrity problems
                course_obj = Timetable.objects.filter(
                    school = course["school"],
                    year = course["year"],
                    term = course["term"],
                    subject_code = course["subject_code"],
                    course_code = course["course_code"]
                )[0]
        except Exception:
            logger.warning("Requested course not found: {}".format(tt_id))
            for section_id, components in course['sections'].items():
                for component_id in components:
                    meta['failed_comps'].append(
                        build_failed_comp(course, section_id, component_id)
                    )
            continue

        for section_id, components in course['sections'].items():
            for component_id in components:
                try:
                    output.append(
                        ScheduleDownloadSerializer(course_obj,
                        context = {
                            'section_id': section_id,
                            'component_id': component_id
                        }).data
                    )
                except KeyError:
                    meta['failed_comps'].append(
                        build_failed_comp(course, section_id, component_id)
                    )
    if len(meta["failed_comps"]) > 0:
        status_code = 206
        meta['messages'].append({
            "type": "warning",
            "title": "Component(s) not Found",
            "message": "One or more components were not found in the database",
        })
    if len(output) == 0:
        status_code = 404
    res = {'data':output, 'meta': meta}
    return Response(res, status=status_code)

class CalendarShareViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = CalendarShare.objects.all()
    serializer_class = CalendarShareSerializer
    permission_classes = (DRYPermissions, )
    lookup_field = 'user__uuid'

    def get_queryset(self):
        '''
        Filter down to only the calendar shares from the current user
        '''
        return super().get_queryset().filter(calendar__user__uuid=self.request.jwt.sub)

    def perform_create(self, serializer):
        serializer.save(
            calendar=Calendar.objects.get_or_create(
                user=User.objects.get(uuid=self.request.jwt.sub),
                is_primary=True,
            )[0],
        )

class AvailableTermsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTerms.objects.all()
    serializer_class = AvailableTermsSerializer

    # @method_decorator(cache_page(60*60*24))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def list(self, request, *args, **kwargs):
        res = super().list(request, *args, **kwargs)
        extra_terms = os.getenv('EXTRA_TERMS', '').strip().lower()
        if len(extra_terms) > 0:
            term_matches = (term_code_pattern.match(term.strip()) for term in extra_terms.split(','))
            term_dicts = [
                # Convert to ordered dict for consistency
                OrderedDict({
                    'year': int(match.group('year')),
                    'term': match.group('season'),
                })
                for match in term_matches
                if match != None
            ]
            res.data = res.data + term_dicts
        return res

class AvailableTermsBackendViewSet(viewsets.ModelViewSet):
    queryset = AvailableTerms.objects.all()
    serializer_class = AvailableTermsSerializer

    def put(self, request, *args, **kwargs):
        """Replace all Available Terms with the list provided
        """
        def validate_and_return_instance(term):
            ser = self.get_serializer(data=term)
            ser.is_valid(raise_exception=True)
            return ser.get_unsaved_instance()

        new_terms = [
            validate_and_return_instance(term)
            for term in request.data
        ]

        # Refresh the queryset
        queryset = self.get_queryset()

        for term in queryset:
            if term not in new_terms:
                logger.info("Deleting Available Term {}-{}".format(term.year, term.term))
                term.delete()
        for term in new_terms:
            if term not in queryset:
                logger.info("Adding Available Term {}-{}".format(term.year, term.term))
                term.save()
        # Return the list after updates
        old = self.get_serializer(queryset, many=True)
        new = self.get_serializer(self.get_queryset(), many=True)
        return Response({"new":new.data, "old":old.data})

class AccreditationUnitViewSet(viewsets.ModelViewSet):
    queryset = AccreditationUnit.objects.all()
    serializer_class = AccreditationUnitSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer


class ActivitySummaryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Activity.objects.all()
    serializer_class = ActivitySummarySerializer
    pagination_class = TruncatePaginator

    def get_queryset(self):
        query_str = self.request.query_params.get("search")
        if query_str == None:
            return super().get_queryset()
        query = SearchQuery(query_str)
        vector = \
            SearchVector('course__course_name', weight='A') + \
            SearchVector('course__description', weight='B')

        return super().get_queryset().annotate(
            rank=SearchRank(vector, query)
        ).filter(
            rank__gt=0
        ).order_by(
            '-rank'
        )


class AccreditationViewSet(viewsets.ModelViewSet):
    queryset = Accreditation.objects.all()
    serializer_class = AccreditationSerializer


class AccreditationSummaryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Accreditation.objects.all()
    serializer_class = AccreditationSummarySerializer
    pagination_class = TruncatePaginator

    def get_queryset(self):
        query_str = self.request.query_params.get("search")
        if query_str == None:
            return super().get_queryset()

        query = SearchQuery(query_str)
        vector = \
            SearchVector('name', weight='A') + \
            SearchVector('description', weight='B')

        return super().get_queryset().annotate(
            rank=SearchRank(vector, query)
        ).filter(
            rank__gt=0
        ).order_by(
            '-rank'
        )
