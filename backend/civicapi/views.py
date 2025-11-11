import requests
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from .trie import Trie
from django.views.decorators.csrf import csrf_exempt
from .utils import log_query
from utils.bloom_filter import BloomFilter
from .models import Candidate
from datetime import datetime

# Create your views here.

bloom = BloomFilter(items_count=100000, fp_prob=0.01)

# Global Trie for candidate name autocomplete
candidate_trie = Trie()

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

def search_view(request):
    """
    Handle search queries and log them to file.
    """
    query = request.GET.get('q', '').strip()
    
    if query:
        # Log the query to file
        log_query(query)
    
    return JsonResponse({
        'query': query,
        'message': 'Query logged successfully'
    })
def get_voter_info(request):
    # Get address from query params
    address = request.GET.get("address", "").strip()
    
    if not address:
        return JsonResponse({"error": "Address is required"}, status=400)
    
    url = "https://www.googleapis.com/civicinfo/v2/voterinfo"
    params = {
        "key": settings.GOOGLE_CIVIC_API_KEY,
        "address": address,
    }
    
    # ElectionId - if provided by frontend, use it; otherwise Google uses default
    if "electionId" in request.GET:
        params["electionId"] = request.GET["electionId"]
    
    response = requests.get(url, params=params)
    return JsonResponse(response.json())


def search_candidates(request):
    """
    Search for candidates by name in the local database.
    Falls back to civicAPI if not found locally.
    """
    query = request.GET.get("query", "").strip()
    
    if not query:
        return JsonResponse({"error": "Query is required"}, status=400)
    
    # First, search the local database
    candidates_db = Candidate.objects.filter(
        name__icontains=query
    )[:50]
    
    if candidates_db.exists():
        # Return results from database
        results = []
        for candidate in candidates_db:
            results.append({
                "name": candidate.name,
                "party": candidate.party,
                "office": candidate.office,
                "election": candidate.election_name,
                "electionDate": candidate.election_date.isoformat() if candidate.election_date else None,
                "state": candidate.state,
                "district": candidate.district,
                "votes": candidate.votes,
                "percent": candidate.vote_percent,
                "candidateUrl": candidate.candidate_url,
                "source": "database"
            })
        
        return JsonResponse({
            "candidates": results,
            "query": query,
            "count": len(results),
            "source": "database"
        })
    
    # If not in database, fetch from civicAPI and optionally save
    return fetch_and_save_candidates(query, request)


def store_race_candidates(race):
    """Persist candidates from a single race and return formatted data."""
    election_name = race.get("election_name") or "Unknown Election"
    election_date_str = race.get("election_date", "")
    election_date = None
    if election_date_str:
        try:
            election_date = datetime.fromisoformat(
                election_date_str.replace('Z', '+00:00')
            ).date()
        except Exception:
            election_date = None

    race_type = race.get("type") or "Unknown Race"
    race_id = race.get("id")

    candidate_infos = []
    saved_count = 0

    for candidate_data in race.get("candidates", []) or []:
        candidate_infos.append({
            "name": candidate_data.get("name"),
            "party": candidate_data.get("party"),
            "office": race_type,
            "election": election_name,
            "electionDate": election_date.isoformat() if election_date else None,
            "votes": candidate_data.get("votes"),
            "percent": candidate_data.get("percent"),
            "state": race.get("province"),
            "district": race.get("district"),
            "source": "civicapi",
        })

        try:
            Candidate.objects.update_or_create(
                name=candidate_data.get("name"),
                race_id=race_id,
                defaults={
                    "party": candidate_data.get("party") or "",
                    "office": race_type,
                    "election_name": election_name or "",
                    "election_type": race.get("election_type") or "",
                    "election_date": election_date,
                    "country": race.get("country") or "US",
                    "state": race.get("province") or "",
                    "district": race.get("district") or "",
                    "votes": candidate_data.get("votes"),
                    "vote_percent": candidate_data.get("percent"),
                    "source": "civicapi",
                },
            )
            saved_count += 1

            if candidate_data.get("name"):
                candidate_trie.insert(candidate_data["name"])
        except Exception as exc:
            print(f"Error saving candidate: {exc}")

    return candidate_infos, saved_count


def fetch_and_save_candidates(query, request):
    """
    Fetch candidates from civicAPI and optionally save to database.
    """
    url = "https://civicapi.org/api/v2/race/search"
    params = {
        "query": query,
        "country": "US",
        "limit": 50,
    }

    if "state" in request.GET:
        params["province"] = request.GET["state"]

    try:
        response = requests.get(url, params=params)
        if response.status_code != 200:
            return JsonResponse({
                "candidates": [],
                "error": f"API returned status code {response.status_code}",
                "query": query,
            })

        data = response.json()

        all_candidates = []
        saved_count = 0

        for race in data.get("races", []):
            candidate_infos, saved = store_race_candidates(race)
            all_candidates.extend(candidate_infos)
            saved_count += saved

        query_lower = query.lower()
        matching_candidates = [
            candidate for candidate in all_candidates
            if candidate.get("name") and query_lower in candidate["name"].lower()
        ]

        return JsonResponse({
            "candidates": matching_candidates,
            "query": query,
            "count": len(matching_candidates),
            "totalRaces": data.get("count", 0),
            "savedToDb": saved_count,
            "source": "civicapi",
        })

    except Exception as e:
        return JsonResponse({
            "candidates": [],
            "error": str(e),
            "query": query,
        })


def search_races(request):
    """Search civicAPI for election races by type or keyword."""
    query = request.GET.get("query", "").strip()

    if not query:
        return JsonResponse({"error": "Query is required"}, status=400)

    params = {
        "query": query,
        "country": "US",
        "limit": 25,
    }

    state = request.GET.get("state", "").strip()
    if state:
        params["province"] = state

    try:
        response = requests.get(
            "https://civicapi.org/api/v2/race/search",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        races = []
        stored_candidates = 0
        for race in data.get("races", []):
            candidates = race.get("candidates", []) or []
            infos, saved = store_race_candidates(race)
            stored_candidates += saved
            races.append({
                "id": race.get("id"),
                "name": race.get("name"),
                "election": {
                    "name": race.get("election_name"),
                    "date": race.get("election_date"),
                    "type": race.get("election_type"),
                },
                "state": race.get("province"),
                "district": race.get("district"),
                "country": race.get("country"),
                "candidates_count": len(infos) if infos else len(candidates) if candidates else race.get("candidates_count"),
                "candidates": infos,
                "raw": race,
            })

        return JsonResponse({
            "query": query,
            "count": data.get("count", len(races)),
            "races": races,
            "candidatesStored": stored_candidates,
        })

    except requests.RequestException as exc:
        return JsonResponse(
            {"error": f"Failed to fetch races: {exc}"},
            status=502,
        )
    except ValueError:
        return JsonResponse(
            {"error": "Invalid response from civicAPI"},
            status=502,
        )


def refresh_candidate_trie():
    """
    Rebuild the Trie with all candidate names from the database.
    Call this on server startup or when needed.
    """
    global candidate_trie
    candidate_trie.clear()
    
    candidates = Candidate.objects.all()
    for candidate in candidates:
        if candidate.name:
            candidate_trie.insert(candidate.name)
    
    return candidate_trie.wordCount()


def candidate_autocomplete(request):
    """
    Autocomplete endpoint for candidate names using Trie.
    Returns suggestions based on prefix.
    """
    prefix = request.GET.get("prefix", "").strip()
    
    if not prefix:
        return JsonResponse({"suggestions": []})
    
    # If Trie is empty, populate it from database
    if candidate_trie.wordCount() == 0:
        refresh_candidate_trie()
    
    # Get autocomplete suggestions
    suggestions = candidate_trie.autocomplete(prefix)
    
    # Limit to top 10 suggestions
    suggestions = suggestions[:10]

    display_suggestions = []
    seen = set()
    for word in suggestions:
        if word in seen:
            continue
        seen.add(word)

        original = Candidate.objects.filter(name__iexact=word).values_list("name", flat=True).first()
        display_suggestions.append(original or word.title())

    return JsonResponse({
        "prefix": prefix,
        "suggestions": display_suggestions,
        "count": len(display_suggestions)
    })

# API to fetch the current user (session-based)
def me(request):
    uid = request.session.get("user_id")
    if not request.session.get("session_active") or not uid:
        return JsonResponse({"ok": False}, status=401)

    try:
        u = User.objects.get(id=uid)
    except User.DoesNotExist:
        # Session says logged in but user row is gone → clear and report not logged in
        request.session.flush()
        return JsonResponse({"ok": False}, status=401)

    return JsonResponse({
        "ok": True,
        "user": {
            "email": u.email,
             "first_name": u.first_name,
            "last_name": u.last_name,
            "picture": u.picture,
        },
    })
    