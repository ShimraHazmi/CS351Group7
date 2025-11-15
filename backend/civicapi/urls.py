from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello),
    path("elections/", views.get_elections),
    path("voterinfo/", views.get_voter_info),
    path("search-races/", views.search_races),
    path("search-candidates/", views.search_candidates),
    path("autocomplete-candidates/", views.candidate_autocomplete),
    path('contact/', views.submit_contact_form),
]