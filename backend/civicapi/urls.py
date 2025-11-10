from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello),
    path("elections/", views.get_elections),
    path("voterInfo/", views.get_voter_info),
]