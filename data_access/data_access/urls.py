from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from .views import (
	AccreditationSummaryViewSet,
	AccreditationUnitViewSet,
	AccreditationViewSet,
	ActivitySummaryViewSet,
	ActivityViewSet,
	CalendarShareViewSet,
	CourseViewSet,
	TimetableSummaryViewSet,
	heartbeatView,
	TimetableViewSet,
	TimestampViewSet,
	UserViewSet,
	ScheduleViewSet,
	ScheduleDownloadView,
	AvailableTermsViewSet,
	AvailableTermsBackendViewSet,
)

router = DefaultRouter()
router.register(r'timetables/summaries', TimetableSummaryViewSet)
router.register(r'timetables', TimetableViewSet)
router.register(r'timestamps', TimestampViewSet)
router.register(r'users', UserViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'available-terms', AvailableTermsViewSet)
router.register(r'backend-available-terms', AvailableTermsBackendViewSet)
router.register(r'calendar-shares', CalendarShareViewSet)
router.register(r'activities/summaries', ActivitySummaryViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'accreditations/summaries', AccreditationSummaryViewSet)
router.register(r'accreditations', AccreditationViewSet)
router.register(r'accreditation-units', AccreditationUnitViewSet)

urlpatterns = [
	re_path(r'^heartbeat/?$', heartbeatView),
	re_path(r'^schedule/?$', ScheduleDownloadView),
	re_path(r'^schedules/download/?$', ScheduleDownloadView),
	path('', include(router.urls)), # This has to be last otherwise overlapping patterns cause issues
]
