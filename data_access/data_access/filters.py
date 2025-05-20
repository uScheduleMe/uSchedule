from django.db.models.query_utils import Q
import django_filters.rest_framework as filters
from .models import (
    Schedule,
    Timetable,
    User,
)
import re
from rest_framework.exceptions import APIException
from rest_framework import status

class QueryParamValidationException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid query params were provided'
    default_code = 'error'

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    pass

class UserFilterSet(filters.FilterSet):
    school = filters.CharFilter(field_name="schedules__schedule_comps__course_data__school")
    subject_code = filters.CharFilter(field_name="schedules__schedule_comps__course_data__subject_code")
    course_code = filters.CharFilter(field_name="schedules__schedule_comps__course_data__course_code")
    year = filters.CharFilter(field_name="schedules__schedule_comps__course_data__year")
    term = filters.CharFilter(field_name="schedules__schedule_comps__course_data__term")
    section = filters.CharFilter(field_name="schedules__schedule_comps__course_data__section")
    email = CharInFilter(field_name="emails__email_address", lookup_expr='in')
    provider = filters.CharFilter(field_name="providers__provider")
    provider_uid = filters.CharFilter(field_name="providers__provider_uid")

    class Meta:
        model = User
        fields = (
            "school",
            "subject_code",
            "course_code",
            "year",
            "term",
            "section",
            "email",
            "provider",
            "provider_uid",
        )

class ScheduleFilterSet(filters.FilterSet):
    user_uuid = filters.UUIDFilter(field_name="calendar__user__uuid")
    in_calendar = filters.BooleanFilter(field_name="calendar__is_primary")
    class Meta:
        model = Schedule
        fields = (
            "user_uuid",
            "in_calendar",
        )

class TimetableSummaryFilterSet(filters.FilterSet):
    term_id = filters.CharFilter(method="filter_term_id")
    season = filters.CharFilter(field_name="term", lookup_expr="iexact")
    subject_code = filters.CharFilter(lookup_expr="iexact")

    def filter_term_id(self, queryset, name, value):
        if not re.match(r'^[0-9]+-(?:winter|fall|summer)(?:,[0-9]+-(?:winter|fall|summer))*$', value):
            raise QueryParamValidationException()
        q = Q()
        for term in value.split(','):
            year, season = term.split('-', 1)
            q = q | Q(year=year, term=season)
        return queryset.filter(q)


    class Meta:
        model = Timetable
        fields = (
            "school",
            "year",
            "term",
            "season",
            "subject_code",
            "course_code",
            "term_id",
        )
