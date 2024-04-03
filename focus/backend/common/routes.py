from .views import CalendarViewSet, ScheduleViewSet



routes = [
    {"regex": r"calendar", "viewset": CalendarViewSet, "basename": "Calendar"},
    {"regex": r"schedule", "viewset": ScheduleViewSet, "basename": "Schedule"},
    # {"regex": r"login", "viewset": LoginViewSet, "basename": "Login"}

]
