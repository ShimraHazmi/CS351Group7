import requests
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from .trie import Trie
from django.views.decorators.csrf import csrf_exempt
from .utils import log_query
from utils.bloom_filter import BloomFilter
from .models import Candidate, User, ElectionRace
from datetime import datetime

# Create your views here.

bloom = BloomFilter(items_count=100000, fp_prob=0.01)

# Global Trie for candidate name autocomplete
candidate_trie = Trie()


def _parse_iso_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None


def _get_or_cache_races(country, province, election_date_str):
    date_obj = _parse_iso_date(election_date_str)
    if not date_obj:
        return []

    country = (country or "US").upper()
    normalized_province = (province or "").upper()

    filters = {
        "country": country,
        "election_date": date_obj,
    }
    if normalized_province:
        filters["province"] = normalized_province

    cached_qs = ElectionRace.objects.filter(**filters)

    if cached_qs.exists():
        return [race.to_dict() for race in cached_qs]

    race_params = {
        "startDate": date_obj.isoformat(),
        "endDate": date_obj.isoformat(),
        "country": country,
        "limit": 100,
    }
    if normalized_province:
        race_params["province"] = normalized_province

    try:
        response = requests.get(
            "https://civicapi.org/api/v2/race/search",
            params=race_params,
            timeout=10,
        )
        response.raise_for_status()
        races = response.json().get("races", [])
    except requests.RequestException:
        races = []

    results = []
    for race_data in races:
        race_id = race_data.get("id")
        if race_id is None:
            continue
        election_date = _parse_iso_date(race_data.get("election_date")) or date_obj
        normalized_prov = (race_data.get("province") or normalized_province or "").upper()
        district = race_data.get("district") or ""

        obj, _ = ElectionRace.objects.update_or_create(
            race_id=race_id,
            defaults={
                "name": race_data.get("election_name") or race_data.get("name") or "Unknown Race",
                "race_type": race_data.get("type") or "",
                "election_type": race_data.get("election_type") or "",
                "election_date": election_date,
                "country": country,
                "province": normalized_prov,
                "district": district,
                "candidates": race_data.get("candidates") or [],
                "raw_data": race_data,
            },
        )
        results.append(obj.to_dict())

    return results

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


def get_election_dates(request):
    """Fetch election dates and augment each with race details for that date."""
    params = {}

    year = request.GET.get("year")
    country = request.GET.get("country")
    province = request.GET.get("province")

    if year:
        params["year"] = year
    if country:
        params["country"] = country
    if province:
        params["province"] = province

    if "year" not in params:
        params["year"] = str(datetime.utcnow().year)
    if "country" not in params:
        params["country"] = "US"

    params["country"] = (params["country"] or "US").upper()
    if province:
        province = province.upper()
        params["province"] = province

    try:
        response = requests.get(
            "https://civicapi.org/api/v2/getElectionDates",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        months = data.get("months", []) or []
        if months:
            unique_dates = []
            seen_dates = set()
            for month in months:
                for date_entry in month.get("dates", []) or []:
                    election_date = date_entry.get("date")
                    if election_date and election_date not in seen_dates:
                        seen_dates.add(election_date)
                        unique_dates.append(election_date)

            race_details_cache = {}
            for election_date in unique_dates:
                race_details_cache[election_date] = _get_or_cache_races(
                    params["country"],
                    province,
                    election_date,
                )

            for month in months:
                for date_entry in month.get("dates", []) or []:
                    election_date = date_entry.get("date")
                    if election_date:
                        date_entry["raceDetails"] = race_details_cache.get(election_date, [])

        return JsonResponse(data)

    except requests.RequestException as exc:
        return JsonResponse(
            {"error": f"Failed to fetch election dates: {exc}"},
            status=502,
        )
    except ValueError:
        return JsonResponse(
            {"error": "Invalid response from civicAPI"},
            status=502,
        )


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

# API to fetch the current user 
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
    
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
import json
from .models import ContactMessage  # Adjust import as needed

@csrf_exempt
@require_http_methods(["POST"])
def submit_contact_form(request):
    try:
        data = json.loads(request.body)

        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()

        if not all([first_name, last_name, email, subject, message]):
            return JsonResponse({
                'success': False,
                'error': 'All fields are required'
            }, status=400)

        contact = ContactMessage.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            subject=subject,
            message=message
        )

        return JsonResponse({
            'success': True,
            'message': 'Your message has been sent successfully!',
            'submission_id': contact.pk
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)

    except Exception:
        return JsonResponse({
            'success': False,
            'error': 'Server error'
        }, status=500)

