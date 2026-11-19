import urllib.parse
from typing import Optional, Dict, Any
import httpx
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from config import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID,
    MICROSOFT_REDIRECT_URI,
    FRONTEND_URL,
)
from models import User
from auth import create_access_token

def get_google_auth_url(state: str = "login") -> str:
    """Generate real Google OAuth authorization URL or return local mock route."""
    if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
            "state": state,
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    # Fallback to backend interactive mock consent screen
    return f"/api/auth/oauth/mock?provider=google&state={state}"

def get_microsoft_auth_url(state: str = "login") -> str:
    """Generate real Microsoft OAuth authorization URL or return local mock route."""
    if MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET:
        params = {
            "client_id": MICROSOFT_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": MICROSOFT_REDIRECT_URI,
            "response_mode": "query",
            "scope": "openid profile email User.Read",
            "prompt": "select_account",
            "state": state,
        }
        return f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?{urllib.parse.urlencode(params)}"
    # Fallback to backend interactive mock consent screen
    return f"/api/auth/oauth/mock?provider=microsoft&state={state}"

async def exchange_google_code(code: str) -> Optional[Dict[str, Any]]:
    """Exchange authorization code for Google user profile."""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            return None
        tokens = token_res.json()
        access_token = tokens.get("access_token")
        if not access_token:
            return None
        
        user_info_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_res.status_code != 200:
            return None
        info = user_info_res.json()
        return {
            "provider": "google",
            "provider_id": info.get("id"),
            "email": info.get("email"),
            "name": info.get("name") or info.get("email").split("@")[0],
            "avatar_url": info.get("picture"),
        }

async def exchange_microsoft_code(code: str) -> Optional[Dict[str, Any]]:
    """Exchange authorization code for Microsoft user profile."""
    token_url = f"https://login.microsoftonline.com/{MICROSOFT_TENANT_ID}/oauth2/v2.0/token"
    data = {
        "client_id": MICROSOFT_CLIENT_ID,
        "client_secret": MICROSOFT_CLIENT_SECRET,
        "code": code,
        "redirect_uri": MICROSOFT_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            return None
        tokens = token_res.json()
        access_token = tokens.get("access_token")
        if not access_token:
            return None
        
        graph_res = await client.get(
            "https://graph.microsoftonline.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if graph_res.status_code != 200:
            return None
        info = graph_res.json()
        email = info.get("mail") or info.get("userPrincipalName")
        return {
            "provider": "microsoft",
            "provider_id": info.get("id"),
            "email": email,
            "name": info.get("displayName") or (email.split("@")[0] if email else "Microsoft User"),
            "avatar_url": None,
        }

def get_or_create_social_user(db: Session, profile: Dict[str, Any]) -> User:
    """Find existing user by email or create a new OAuth user in database."""
    email = profile["email"].strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=profile.get("name") or email.split("@")[0],
            email=email,
            provider=profile.get("provider", "social"),
            provider_id=profile.get("provider_id"),
            avatar_url=profile.get("avatar_url"),
            hashed_password=None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update provider info if needed
        if profile.get("provider_id") and not user.provider_id:
            user.provider_id = profile.get("provider_id")
        if profile.get("avatar_url") and not user.avatar_url:
            user.avatar_url = profile.get("avatar_url")
        db.commit()
        db.refresh(user)
    return user

def render_mock_oauth_screen(provider: str, state: str = "login") -> HTMLResponse:
    """
    Renders an interactive, authentic-looking Google or Microsoft OAuth consent screen.
    Allows testing OAuth without requiring live Google Cloud or Azure AD registered credentials.
    """
    is_google = provider.lower() == "google"
    title = "Sign in with Google" if is_google else "Sign in to Microsoft"
    subtitle = "to continue to <b>Stackly</b>"
    brand_color = "#1a73e8" if is_google else "#00a4ef"
    
    logo_svg = """
    <svg width="48" height="48" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
    """ if is_google else """
    <svg width="48" height="48" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
    """

    default_name = "User"
    default_email = "user@gmail.com" if is_google else "user@outlook.com"
    alt_name = "Alex Johnson"
    alt_email = "alex@gmail.com" if is_google else "alex@outlook.com"

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }}
    body {{ background: #f0f2f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }}
    .card {{ background: #fff; width: 100%; max-width: 440px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e1e4e8; padding: 36px 32px; text-align: center; }}
    .logo {{ display: flex; justify-content: center; margin-bottom: 16px; }}
    h1 {{ font-size: 22px; color: #202124; font-weight: 500; margin-bottom: 6px; }}
    p.sub {{ font-size: 14px; color: #5f6368; margin-bottom: 26px; }}
    .banner {{ background: #e8f0fe; color: #1967d2; border-radius: 6px; padding: 10px 14px; font-size: 12px; margin-bottom: 22px; text-align: left; line-height: 1.4; }}
    .account-list {{ display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }}
    .account-item {{ display: flex; align-items: center; gap: 14px; padding: 12px 14px; border: 1px solid #dadce0; border-radius: 8px; background: #fff; cursor: pointer; text-align: left; transition: all 0.15s ease; }}
    .account-item:hover {{ background: #f8f9fa; border-color: {brand_color}; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }}
    .avatar {{ width: 40px; height: 40px; border-radius: 50%; background: {brand_color}; color: #fff; font-weight: 600; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }}
    .info {{ flex: 1; min-width: 0; }}
    .name {{ font-weight: 600; font-size: 14px; color: #202124; }}
    .email {{ font-size: 12px; color: #5f6368; }}
    .divider {{ display: flex; align-items: center; margin: 18px 0; color: #80868b; font-size: 12px; }}
    .divider::before, .divider::after {{ content: ""; flex: 1; height: 1px; background: #dadce0; }}
    .divider span {{ padding: 0 10px; }}
    .custom-form {{ text-align: left; }}
    .custom-form label {{ display: block; font-size: 12px; font-weight: 600; color: #3c4043; margin-bottom: 4px; }}
    .custom-form input {{ width: 100%; height: 38px; padding: 0 10px; border: 1px solid #dadce0; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }}
    .btn-submit {{ width: 100%; height: 40px; background: {brand_color}; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.15s; }}
    .btn-submit:hover {{ opacity: 0.9; }}
    .cancel-link {{ display: inline-block; margin-top: 18px; font-size: 13px; color: #5f6368; text-decoration: none; }}
    .cancel-link:hover {{ text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">{logo_svg}</div>
    <h1>{title}</h1>
    <p class="sub">{subtitle}</p>

    <div class="banner">
      ⚡ <b>Ready-to-use OAuth Flow:</b> Choose an account below or type any email to test Google / Microsoft single sign-on instantly.
    </div>

    <div class="account-list">
      <div class="account-item" onclick="selectAccount('{default_name}', '{default_email}')">
        <div class="avatar">{default_name[0]}</div>
        <div class="info">
          <div class="name">{default_name}</div>
          <div class="email">{default_email}</div>
        </div>
      </div>
    </div>

    <div class="divider"><span>Or use another account</span></div>

    <form class="custom-form" onsubmit="handleCustomSubmit(event)">
      <label for="custom-name">Display Name</label>
      <input type="text" id="custom-name" placeholder="Enter your name" required>
      <label for="custom-email">Email Address</label>
      <input type="email" id="custom-email" placeholder="Enter your email address" required>
      <button class="btn-submit" type="submit">Continue with { 'Google' if is_google else 'Microsoft' }</button>
    </form>

    <a class="cancel-link" href="{FRONTEND_URL}/signin.html">Cancel and return to Stackly</a>
  </div>

  <script>
    function selectAccount(name, email) {{
      submitAuth(name, email);
    }}

    function handleCustomSubmit(e) {{
      e.preventDefault();
      var name = document.getElementById("custom-name").value.trim();
      var email = document.getElementById("custom-email").value.trim();
      if (!name || !email) return;
      submitAuth(name, email);
    }}

    function submitAuth(name, email) {{
      var params = new URLSearchParams({{
        provider: '{provider}',
        name: name,
        email: email,
        state: '{state}'
      }});
      window.location.href = '/api/auth/oauth/mock/complete?' + params.toString();
    }}
  </script>
</body>
</html>
    """
    return HTMLResponse(content=html)
