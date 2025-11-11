import secrets, logging
from urllib.parse import urlencode, urlparse
from django.http import HttpResponseBadRequest, JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect
from decouple import config
from civicapi.models import User
from workos import WorkOSClient
from django.core.exceptions import PermissionDenied

log = logging.getLogger(__name__)

workos_client = WorkOSClient(
    api_key=config("WORKOS_API_KEY"),
    client_id = config("WORKOS_CLIENT_ID")
)

REDIRECT_URI = config("WORKOS_REDIRECT_URI")

def _is_url(u: str) -> bool:
    try:
        p = urlparse(u)
        return p.scheme in ("http","https") and bool(p.netloc)
    except Exception:
        return False
    
def login(request):
    next_url = request.GET.get("redirect") or "http://localhost:3000"
    if not _is_url(next_url):
        next_url = "http://localhost:3000"
    state = secrets.token_urlsafe(24)
    request.session["oauth_state"] = state
    request.session["post_login_redirect"] = next_url

    url = workos_client.sso.get_authorization_url(
        provider='GoogleOAuth',
        redirect_uri=REDIRECT_URI,
        state=state
    )
    return redirect(url)

def callback(request):
    next_url = request.session.pop("post_login_redirect", "/")
    err = request.GET.get("error")
    if err:
        # user canceled or error from IdP
        request.session.flush()
        desc = request.GET.get("error_description", err)
        
        return HttpResponseRedirect(f"http://localhost:3000/?error={err}")
    
    if request.GET.get("error"):
        err = request.GET["error"]
        log.warning("SSO error: %s", request.GET.get("error_description", err))
        return HttpResponseRedirect(f"{next_url}?error={err}")

    # validate CSRF state
    if request.GET.get("state") != request.session.pop("oauth_state", None):
        return HttpResponseBadRequest("Invalid state")
    
    code = request.GET.get("code")
    if not code:
        return HttpResponseBadRequest("Missing code")
    
    try: 
        profile_and_token = workos_client.sso.get_profile_and_token(code)
        profile = profile_and_token.profile
        
        first_name = getattr(profile, "first_name", None)
        last_name = getattr(profile, "last_name", None)
        request.session["session_active"] = True
        request.session["user_email"] = profile.email
        request.session["user_name"] = f"{first_name} {last_name}"
        request.session["raw_profile"] = profile.model_dump()

        return redirect(f"{next_url}?session=true")
    except Exception as e:
        print("SSO failed", e)
        return redirect(f"{next_url}?error=SSOFailed")

def logout(request):
    request.session.flush()
    return redirect("/")