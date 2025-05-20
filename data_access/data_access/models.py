# Django
from data_access.auth.permission_helpers import has_jwt, has_scopes
from django.db import models
# Python
import time
import uuid

class Terms(models.TextChoices):
    FALL = "fall"
    WINTER = "winter"
    SUMMER = "summer"

class UppercaseCharField(models.CharField):
    def __init__(self, *args, **kwargs):
        super(UppercaseCharField, self).__init__(*args, **kwargs)

    def get_prep_value(self, value):
        return str(value).upper()

class Timetable(models.Model):
    sections = models.JSONField(null=False)
    school = models.CharField(max_length=20, null=False)
    year = models.IntegerField()
    term = models.CharField(max_length=6, choices=Terms.choices, null=False, blank=False)
    subject_code = UppercaseCharField(max_length=5, null=False)
    course_code = models.CharField(max_length=10, null=False)
    course_name = models.CharField(max_length=255, blank=True, null=False)
    date_created = models.IntegerField(default=-1)
    date_updated = models.IntegerField(default=-1)

    @property
    def season(self):
        return self.term

    @property
    def term_obj(self):
        return {
            'season': self.term,
            'year': self.year,
        }

    def save(self, *args, **kwargs):
        """Extends default behaviour by adding Unix timestamps
        when created and updated.
        """
        current_unix_time = int(time.time())
        if not self.date_created or self.date_created < 0:
            self.date_created = current_unix_time
        self.date_updated = current_unix_time
        return super().save(*args, **kwargs)

    class Meta:
        unique_together = [
            "school", "year", "term",
            "subject_code", "course_code",
        ]

class Timestamp(models.Model):
    reason = models.CharField(max_length=255, null=False)
    timestamp = models.IntegerField()

    def save(self, *args, **kwargs):
        """Extends default behaviour by adding Unix timestamps
        when updated.
        """
        self.timestamp = int(time.time())
        return super().save(*args, **kwargs)

    class Meta:
        unique_together = ["reason"]

class Subject(models.Model):
    # Max length should be 48, but varies, so give a buffer
    subject = models.CharField(max_length=72, null=False)
    # Length for uOttawa is 3, Carleton is 4; give a buffer
    subject_code = UppercaseCharField(max_length=5)
    # Max length should be 44, but varies, so give a buffer
    link = models.CharField(max_length=66)

class User(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    given_name = models.CharField(max_length=255, null=False)
    family_name = models.CharField(max_length=255, null=False)
    disp_name = models.CharField(max_length=255, null=True)

    @staticmethod
    @has_jwt
    def has_read_permission(request):
        return True

    @staticmethod
    @has_jwt
    def has_list_permission(request):
        '''
        Allow any user to list the view is reponsible for filtering
        the queryset for permissions
        '''
        return True

    @has_jwt
    def has_object_read_permission(self, request):
        '''
        Allow services and the user to get their own user
        '''
        if has_scopes(request, 'service'):
            return True
        if has_scopes(request, 'profile'):
            return request.jwt.sub == str(self.uuid)
        return False

    @staticmethod
    @has_jwt
    def has_write_permission(request):
        '''
        Only give write to users who have a JWT.
        '''
        return True

    @staticmethod
    @has_jwt(scopes='service', client_id='auth')
    def has_create_permission(request):
        '''
        Only allow the auth service to create a user.
        '''
        return True

    @has_jwt(scopes='profile')
    def has_object_update_permission(self, request):
        '''
        Allow the user to be modified only by the user
        '''
        return request.jwt.sub == str(self.uuid)

    @has_jwt(scopes='profile')
    def has_object_destroy_permission(self, request):
        '''
        Allow only the user to destroy themselves
        '''
        return request.jwt.sub == str(self.uuid)

class Email(models.Model):
    user = models.ForeignKey(User.__name__, related_name="emails", on_delete=models.CASCADE, null=False)
    email_address = models.EmailField(null=False, unique=True)

class SSOProvider(models.Model):
    user = models.ForeignKey(User.__name__, related_name="providers", on_delete=models.CASCADE, null=False)
    provider = models.CharField(max_length=128, null=False)
    provider_uid = models.CharField(max_length=255, null=False)

    class Meta:
        unique_together = ["provider", "provider_uid"]

class Calendar(models.Model):
    user = models.ForeignKey(User.__name__, related_name="calendars", on_delete=models.CASCADE, null=False)
    is_primary = models.BooleanField(null=False, default=False)
    notifications_enabled = models.BooleanField(null=False, default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "is_primary"),
                name="single_primary_calendar_per_user",
                condition=models.Q(is_primary=True)),
        ]

class CalendarComponents(models.Model):
    calendar = models.ForeignKey(Calendar.__name__, related_name="components", on_delete=models.CASCADE, null=False)
    timetable = models.ForeignKey(Timetable.__name__, related_name="calendar_components", on_delete=models.CASCADE, null=False)
    section_id = models.CharField(max_length=10, null=False)
    component_id = models.CharField(max_length=10, null=False)

class Schedule(models.Model):
    name = models.CharField(max_length=128, null=False, blank=True)
    calendar = models.ForeignKey(Calendar, related_name="schedules", on_delete=models.CASCADE, null=False)
    term = models.CharField(max_length=6, choices=Terms.choices, null=False, blank=False, editable=False)
    year = models.IntegerField(null=False, editable=False)

    class Meta:
        unique_together = ["calendar", "term"]

    @property
    def term_obj(self):
        return {
            'season': self.term,
            'year': self.year,
        }

    @term_obj.setter
    def term_obj(self, value):
        self.term = value['season']
        self.year = value['year']

    def migrate_to_calendar(self, calendar: Calendar) -> None:
        """
        Migrate this schedule and it's components to a new calendar
        """
        CalendarComponents.objects.filter(
            calendar=self.calendar,
            timetable__term=self.term,
            timetable__year=self.year,
        ).update(calendar=calendar)
        self.calendar=calendar
        self.save()

    @staticmethod
    @has_jwt
    def has_read_permission(request):
        return True

    @staticmethod
    @has_jwt
    def has_list_permission(request):
        """
        Allow anyone with a JWT to list schedules.

        The queryset needs to be filtered down in the view to
        restrict access at the query level.
        """
        return True

    @has_jwt(scopes='profile')
    def has_object_read_permission(self, request):
        '''
        Allow only the user to get their own schedules
        '''
        return request.jwt.sub == str(self.calendar.user.uuid)

    @staticmethod
    @has_jwt(scopes='profile')
    def has_write_permission(request):
        '''
        Only give write to users who have a JWT.
        '''
        return True

    @staticmethod
    @has_jwt(scopes='profile')
    def has_create_permission(request):
        '''
        Any user with a profile can create a schedule
        '''
        return True

    @has_jwt(scopes='profile')
    def has_object_write_permission(self, request):
        '''
        Allow only the user to write to they're own schedule
        '''
        return request.jwt.sub == str(self.calendar.user.uuid)

    @has_jwt(scopes='profile')
    def has_object_destroy_permission(self, request):
        '''
        Allow only the user to destroy themselves
        '''
        return request.jwt.sub == str(self.calendar.user.uuid)

class CalendarShare(models.Model):
    user = models.ForeignKey(User.__name__, related_name="calendar_shares", on_delete=models.CASCADE, null=False, editable=False)
    calendar = models.ForeignKey(Calendar.__name__, related_name="shares", on_delete=models.CASCADE, null=False, editable=False)

    @staticmethod
    @has_jwt(scopes='profile')
    def has_create_permission(request):
        return True

    @staticmethod
    @has_jwt(scopes='profile')
    def has_write_permission(request):
        return True

    @has_jwt(scopes='profile')
    def has_object_destroy_permission(self, request):
        return request.jwt.sub == str(self.calendar.user.uuid)

    class Meta:
        unique_together = ["user", "calendar"]


class AvailableTerms(models.Model):
    year = models.IntegerField()
    term = models.CharField(max_length=6, choices=Terms.choices, null=False, blank=False)

    def __attrs(self):
        '''Get the hash and equality attributes as a tuple
        '''
        return (self.year, self.term)

    def __eq__(self, other):
        '''Override the equality behavior from being public key based to value based
        '''
        return self.__attrs == other.__attrs

    def __hash__(self):
        '''Override the equality behavior from being public key based to value based
        '''
        return hash(self.__attrs)

    class Meta:
        unique_together = ["year", "term"]

class Course(models.Model):
    school = models.CharField(max_length=20, null=False)
    subject_code = UppercaseCharField(max_length=5, blank=False, null=False)
    course_code = models.CharField(max_length=10, blank=False, null=False)
    course_name = models.CharField(max_length=255, blank=True, null=False)
    description = models.TextField(blank=True, null=False)
    date_created = models.IntegerField(default=-1)
    date_updated = models.IntegerField(default=-1)

    @property
    def display_name(self):
        return '{} {}: {}'.format(
            self.subject_code,
            self.course_code,
            self.course_name,
        )

    def save(self, *args, **kwargs):
        """Extends default behaviour by adding Unix timestamps
        when created and updated.
        """
        current_unix_time = int(time.time())
        if not self.date_created or self.date_created < 0:
            self.date_created = current_unix_time
        self.date_updated = current_unix_time
        return super().save(*args, **kwargs)

    class Meta:
        unique_together = [
            "school", "subject_code", "course_code",
        ]

class AccreditationUnit(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)

class Activity(models.Model):
    course = models.OneToOneField(Course, related_name="activity", on_delete=models.CASCADE, null=False)

class ActivityAccreditationAssignment(models.Model):
    quantity = models.PositiveIntegerField()
    aus = models.ForeignKey(AccreditationUnit, related_name="activity_assignments", on_delete=models.CASCADE)
    activity = models.ForeignKey(Activity, related_name="supplied_aus", on_delete=models.CASCADE)

class Accreditation(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(blank=True, null=False)
    required_aus = models.JSONField(null=False)
