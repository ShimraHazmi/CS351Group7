import requests
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def hello(request):
    return JsonResponse({"message": "Backend is working!"})

def get_elections(request):
    # This function will interact with the Google Civic Information API
    url = "https://www.googleapis.com/civicinfo/v2/elections"
    # Set up the query parameters
    params = {
        "key": settings.GOOGLE_CIVIC_API_KEY,
    }
    # Make the request to the API
    response = requests.get(url, params=params)
    return JsonResponse(response.json())
