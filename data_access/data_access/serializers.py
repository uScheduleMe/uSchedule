# Django
from typing import DefaultDict

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import fields
from django.db.models.fields.related import RelatedField
from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer
# Local
from .models import (
    Accreditation,
    AccreditationUnit,
    Activity,
    ActivityAccreditationAssignment,
    Calendar,
    CalendarComponents,
    CalendarShare,
    Course,
    Email,
    SSOProvider,
    Schedule,
    Timetable,
    Timestamp,
    Subject,
    User,
    AvailableTerms,
)
from .validators import MinCountValidator, NotEditableValidator
from .schemas import (
    validate,
    timetable_components_schema,
)

# Logging
import logging
logger = logging.getLogger('uschedule.da')


class FilterEmptyObjectsListSerializer(serializers.ListSerializer):
    """
    This class behaves just like a `ListSerializer` but filters out any empty objects

    You will likely want to use this class as the `list_serializer_class` property
    of another serializer's `Meta` class. Moreover for this class to do anything useful
    that class has to have an overriten `to_representation` function to return `None` in
    some cases.
    """
    def to_representation(self, data):
        return [
            item
            for item in super().to_representation(data)
            if item != {}
        ]

class RecordListSerializer(serializers.ListSerializer):
    """
    This class can be used in place of a `ListSerializer` to convert the list to a map

    This class will use an `id` property from each object and use it to create a
    record (map) mapping the id to the actual object.
    """
    def to_representation(self, data):
        return {
            str(item['id']): item
            for item in super().to_representation(data)
        }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise ValidationError("Value in map isn't an object")
        for key, value in data.items():
            if key != str(value.get('id')):
                raise ValidationError("Key doesn't match id in object")
        return super().to_internal_value(list(data.values()))


class TimetableSerializer(serializers.ModelSerializer):

    def __flatten_components(self, components: dict) -> dict:
        """For non-lecture components, drop all but the first slot.

        Since the schedule generator expects the old data format,
        which did not allow non-lecture (LEC) components to have
        multiple slots, we drop all but the first slot.

        Args:
            components: A `dict` of the components of a course,
                where any component type may have any number
                of slots.

        Returns:
            A `dict` of the components of a course, where multiple
                lecture component slots have been split
                into different components, and all other components
                have been reduced to their first slot.
        """
        out_components = {}
        for ctype, in_components in components.items():
            for cid, slots in in_components.items():
                if ctype == "LEC":
                    for slot in slots:
                        out_components[slot["id"]] = slot
                else:
                    slots[0]["id"] = "{}-{}".format(cid, ctype)
                    out_components[slots[0]["id"]] = slots[0]
        return out_components

    def to_representation(self, obj):
        """Flatten components to have only one slot.

        Lecture components which typeically have more than one slot
            are split into multiple components, and other component
            types are reduced to only their first slot.

        Raises:
            Exception: If the course's components cannot 
                be flattened for any reason, the schedule
                generator will not be able to handle the
                data format, so an exception is raised.
        """
        representation = super().to_representation(obj)
        logger.info("Flattening components to lossy format")
        try:
            for section in representation["sections"].values():
                section["components"] = self.__flatten_components(
                    section["components"]
                )
            # Ignore timetable stubs
            return representation if len(representation["sections"]) > 0 else {}
        except Exception as e:
            logger.error("Could not flatten components")
            logger.debug("Could not flatten components", exc_info=True)
            raise e

    class Meta:
        model = Timetable
        list_serializer_class = FilterEmptyObjectsListSerializer
        fields = (
            "id",
            "school",
            "year",
            "term",
            "subject_code",
            "course_code",
            "course_name",
            "sections",
        )

class TimetableSummarySerializer(serializers.ModelSerializer):
    term = serializers.JSONField(source='term_obj')

    def to_representation(self, obj):
        return super().to_representation(obj) if len(obj.sections) > 0 else {}

    class Meta:
        model = Timetable
        list_serializer_class = FilterEmptyObjectsListSerializer
        fields = (
            "id",
            "school",
            "subject_code",
            "course_code",
            "course_name",
            "term",
        )

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = (
            "subject",
            "subject_code",
            "link",
        )

class TimestampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timestamp
        fields = (
            "reason",
            "timestamp",
        )

class TimestampDeserializer(serializers.ModelSerializer):
    class Meta:
        model = Timestamp
        fields = (
            "reason",
        )

class SSOProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = SSOProvider
        fields = (
            "provider",
            "provider_uid",
        )

class EmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Email
        fields = (
            "email_address",
        )

class UserSerializer(WritableNestedModelSerializer):
    providers = SSOProviderSerializer(many=True)
    emails = EmailSerializer(many=True)
    class Meta:
        model = User
        fields = (
            "uuid",
            "providers",
            "emails",
            "given_name",
            "family_name",
            "disp_name",
        )
        validators = (
            MinCountValidator(1, "emails"),
            NotEditableValidator("emails"),
            NotEditableValidator("providers"),
        )

class ScheduleSerializer(serializers.ModelSerializer):
    in_calendar = serializers.BooleanField(source='calendar.is_primary')
    timetable_components = serializers.JSONField(write_only=True)
    term = serializers.JSONField(source='term_obj')

    def validate(self, data):
        if self.partial and ('timetable_components' in data):
            raise ValidationError('Partial updates of timetable components are not currently supported.')
        if not self.partial:
            ids = data['timetable_components'].keys()
            if len({
                    (data['term_obj']['season'], data['term_obj']['year'])
                }.union({
                    (tt.term, tt.year)
                    for tt in Timetable.objects.filter(id__in=ids)
                })) != 1:
                raise ValidationError('All courses terms in a schedule must match the year/season in the `term` property')
        return data

    def validate_timetable_components(self, value):
        validate(instance=value, schema=timetable_components_schema)
        for id, course in value.items():
            if str(course['id']) != id:
                raise ValidationError('`timetable_components` map key does not match `course_id`')
        tt_ids = set(value.keys())
        if Timetable.objects.filter(id__in=tt_ids).count() != len(tt_ids):
            raise ValidationError('`timetable_components` contains a timetable id that does not exist')
        return value

    def create(self, validated_data: dict) -> Schedule:
        tt_comps = validated_data.pop('timetable_components')
        # We can get the term/year from the first because we validated they were the same already
        term = validated_data['term_obj']

        calendar = self._prepare_calendar(
            validated_data.pop('calendar')['is_primary'],
            term
        )

        # Create new calender components
        insert_comps = []
        for tt in tt_comps.values():
            for section, comps in tt['sections'].items():
                for comp in comps:
                    insert_comps.append(CalendarComponents(
                        calendar=calendar,
                        timetable_id=tt['id'],
                        section_id=section,
                        component_id=comp,
                    ))
        CalendarComponents.objects.bulk_create(insert_comps)

        # Add newly generated data to the schedule data
        validated_data['term'] = term['season']
        validated_data['year'] = term['year']
        validated_data['calendar'] = calendar
        return super().create(validated_data)

    def update(self, instance: Schedule, validated_data: dict) -> Schedule:
        if 'calendar' in validated_data:
            in_calendar = validated_data.pop('calendar')['is_primary']
            if in_calendar != instance.calendar.is_primary:
                calendar = self._prepare_calendar(in_calendar, instance.term_obj)
                instance.migrate_to_calendar(calendar)
        if 'name' in validated_data:
            instance.name = validated_data['name']
            instance.save()
        return instance

    def to_representation(self, instance):
        res = super().to_representation(instance)

        # First we create a mapping to have the right general structure
        mapping = DefaultDict(lambda: {
            'tt': None,
            'sections': DefaultDict(list),
        })
        for comp in instance.calendar.components.filter(timetable__term=instance.term):
            mapping[comp.timetable.id]['tt'] = comp.timetable
            mapping[comp.timetable.id]['sections'][comp.section_id].append(comp.component_id)

        # Then convert the mapping into the right data format
        res['timetable_components'] = {
            str(value['tt'].id): {
                'id': value['tt'].id,
                'school': value['tt'].school,
                'term': value['tt'].term,
                'year': value['tt'].year,
                'subject_code': value['tt'].subject_code,
                'course_code': value['tt'].course_code,
                'sections': value['sections'],
            }
            for value in mapping.values()
        }
        return res

    def _prepare_calendar(self, is_primary: bool, term: dict) -> Calendar:
        """
        Prepare a calendar to accept some term components for a given term.

        If the primary calendar is requested migrate any existing course
        components to a new draft calendar otherwise return a new calendar.
        """
        user_id = User.objects.get(uuid=self.context['request'].jwt.sub).id
        if is_primary:
            calendar = Calendar.objects.get_or_create(user_id=user_id, is_primary=True)[0]
            new_cal = Calendar.objects.create(user_id=user_id)
            # Migrate existing schedule to new calendar
            try:
                Schedule.objects.get(
                    calendar=calendar,
                    term=term['season'],
                    year=term['year'],
                ).migrate_to_calendar(new_cal)
            except Schedule.DoesNotExist:
                pass
        else:
            calendar = Calendar.objects.create(user_id=user_id)
        return calendar

    class Meta:
        model = Schedule
        fields = (
            "id",
            "name",
            "term",
            "in_calendar",
            "timetable_components",
        )

class CalendarShareSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    email = serializers.CharField(write_only=True)

    def validate_email(self, data):
        matched_users = User.objects.filter(emails__email_address=data)
        if len(matched_users) == 0:
            raise ValidationError("User with this email address does not exist")
        if str(matched_users[0].uuid) == self.context['request'].jwt.sub:
            raise ValidationError("User cannot share with self")
        if len(CalendarShare.objects.filter(
            user=matched_users[0],
            calendar__user__uuid=self.context['request'].jwt.sub
        )) > 0:
            raise ValidationError("User already has access")
        return data

    def create(self, validated_data):
        validated_data['user'] = User.objects.get(emails__email_address=validated_data.pop('email'))
        return super().create(validated_data)

    class Meta:
        model = CalendarShare
        fields = (
            "user",
            "email",
        )

class ScheduleDownloadSerializer(serializers.ModelSerializer):

    def to_representation(self, obj):
        """
        Pick a section and component based on serialization context
        and return it flattened into a the course json object.
        """
        representation = super().to_representation(obj)
        output = {}
        tt_id = "{school} {term} {year}, {subject_code}{course_code}".format(
            **representation
        )

        # Get all the toplevel info
        logger.info('Flattening toplevel info from {}'.format(tt_id))
        for key, value in representation.items():
            if key != 'sections':
                output[key] = value

        # Get the section info out of the representation
        logger.debug('Flattening section info from {}{}'.format(tt_id, self.context['section_id']))
        section = representation['sections'][self.context['section_id']]
        for key, value in section.items():
            if key != 'components':
                if key == 'label':
                    key = 'section_label'
                if key == 'id':
                    key = 'section_id'
                output[key] = value

        logger.debug('Flattening component info from {}{} {}'.format(
            tt_id,
            self.context['section_id'],
            self.context['component_id']
        ))
        # Get the component info out of the representation
        comp_id = self.context['component_id'].split('-')   # Splitting keys is less than ideal but for now it'll work
        comp_sec_id = comp_id[0]
        comp_type = comp_id[1]
        comp_num = int(comp_id[2]) if len(comp_id) > 2 else 0

        comp_group = representation['sections'][self.context['section_id']]['components'][comp_type]
        component = comp_group[comp_sec_id][comp_num]
        for key, value in component.items():
            output[key] = value

        return output

    class Meta:
        model = Timetable
        fields = (
            "school",
            "year",
            "term",
            "course_code",
            "subject_code",
            "course_name",
            "sections",
        )


class AvailableTermsSerializer(serializers.ModelSerializer):
    def get_unsaved_instance(self):
        return self.Meta.model(**self.validated_data)

    class Meta:
        model = AvailableTerms
        validators = [] # disable validation for unique_together contraint, this is handled in the viewset
        fields = (
            "year",
            "term",
        )

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            "id",
            "school",
            "subject_code",
            "course_code",
            "course_name",
            "description",
        )

class AccreditationUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccreditationUnit
        fields = (
            "id",
            "name",
        )

class ActivityAccreditationAssignmentSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(source='aus', queryset=AccreditationUnit.objects.all())
    name = serializers.CharField(source='aus.name', read_only=True)
    class Meta:
        model = ActivityAccreditationAssignment
        list_serializer_class = RecordListSerializer
        fields = (
            "id",
            "quantity",
            "name",
        )

class ActivitySerializer(serializers.ModelSerializer):
    supplied_aus = ActivityAccreditationAssignmentSerializer(many=True)
    name = serializers.CharField(source='course.display_name', read_only=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['course'] = CourseSerializer(instance.course).data
        return {
            **data,
            "type": "course",
        }

    def create(self, validated_data):
        aaas = validated_data.pop('supplied_aus')
        instance = super().create(validated_data)
        ActivityAccreditationAssignment.objects.bulk_create([
            ActivityAccreditationAssignment(aus=aaa['aus'], quantity=aaa['quantity'], activity=instance)
            for aaa in aaas
        ])
        return instance

    def update(self, instance, validated_data):
        aaas = validated_data.pop('supplied_aus', None)
        super().update(instance, validated_data)
        if aaas is not None:
            ActivityAccreditationAssignment.objects.filter(activity=instance).delete()
            ActivityAccreditationAssignment.objects.bulk_create([
                ActivityAccreditationAssignment(aus=aaa['aus'], quantity=aaa['quantity'], activity=instance)
                for aaa in aaas
            ])
        return instance

    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
            "course",
            "supplied_aus",
        )

class ActivitySummarySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='course.display_name', read_only=True)
    rank = serializers.FloatField(read_only=True)

    def to_representation(self, validated_data):
        return {
            **super().to_representation(validated_data),
            "type": "course",
        }

    class Meta:
        model = Activity
        fields = (
            "id",
            "name",
            "rank",
        )

class AccreditationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accreditation
        fields = (
            'id',
            'name',
            'description',
            'required_aus',
        )

class AccreditationSummarySerializer(serializers.ModelSerializer):
    rank = serializers.FloatField(read_only=True)

    class Meta:
        model = Accreditation
        fields = (
            'id',
            'name',
            'rank',
        )
