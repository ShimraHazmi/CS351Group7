import requests
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from utils.bloom_filter import BloomFilter

# Create your views here.

# Expecting ~100k lookups, 1% false positive rate
bloom = BloomFilter(items_count=100000, fp_prob=0.01)

def has_voter_info(election_id, address):
    key = f"{election_id}:{address.strip().lower()}"
    return bloom.contains(key)

def add_voter_info(election_id, address):
    key = f"{election_id}:{address.strip().lower()}"
    bloom.add(key)

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

def get_voter_info(request):
    url = "https://www.googleapis.com/civicinfo/v2/voterinfo"
    params = {
        "key": settings.GOOGLE_CIVIC_API_KEY,
        "address": "1600 Pennsylvania Ave NW, Washington, DC 20500",
        "electionId": 2000,
    }
    # if "electionId" in request.GET:
    #     params["electionId"] = request.GET["electionId"]
    response = requests.get(url, params=params)
    return JsonResponse(response.json())

