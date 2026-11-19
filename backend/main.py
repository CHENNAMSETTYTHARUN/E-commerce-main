import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from config import (
    FRONTEND_DIR,
    FRONTEND_URL,
    GOOGLE_CLIENT_ID,
    MICROSOFT_CLIENT_ID,
)
from database import engine, Base, get_db
from models import User, Feedback
from schemas import (
    UserSignup,
    UserLogin,
    SocialAuthRequest,
    AuthResponse,
    UserResponse,
    MessageResponse,
    FeedbackCreate,
    FeedbackResponse,
)
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    blacklist_token,
    security,
)
from oauth import (
    get_google_auth_url,
    get_microsoft_auth_url,
    exchange_google_code,
    exchange_microsoft_code,
    get_or_create_social_user,
    render_mock_oauth_screen,
)

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stackly E-Commerce Auth API",
    description="Backend API for User Signup, Login, Logout, and Google / Microsoft OAuth authentication.",
    version="1.0.0",
)

# Enable CORS for all origins so frontend works seamlessly via HTTP or file:// protocol
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "stackly-backend"}


# -------------------------------------------------------------
# Standard Email & Password Authentication Endpoints
# -------------------------------------------------------------

@app.post("/api/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    """Register a new user account with email and password."""
    email = data.email.strip().lower()
    
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in.",
        )
    
    # Hash password and create user
    hashed = hash_password(data.password)
    user = User(
        name=data.name.strip(),
        email=email,
        hashed_password=hashed,
        provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate JWT token
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    return AuthResponse(
        message="Account created successfully!",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            provider=user.provider,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )

@app.post("/api/auth/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate an existing user with email and password."""
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="We couldn't match that email and password. Check your details or create an account.",
        )
    
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account was registered using {user.provider.capitalize()}. Please sign in with {user.provider.capitalize()}.",
        )
    
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again or use password reset.",
        )
    
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    return AuthResponse(
        message="Signed in successfully!",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            provider=user.provider,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )

@app.post("/api/auth/logout", response_model=MessageResponse)
def logout(
    request: Request,
    auth_header = Depends(security),
    db: Session = Depends(get_db),
):
    """Log out user and blacklist their current access token."""
    if auth_header and auth_header.credentials:
        blacklist_token(db, auth_header.credentials)
    return MessageResponse(message="Logged out successfully.")

@app.get("/api/auth/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Fetch current authenticated user profile."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        provider=current_user.provider,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )

# -------------------------------------------------------------
# Google & Microsoft OAuth Social Authentication Endpoints
# -------------------------------------------------------------

@app.post("/api/auth/oauth/social", response_model=AuthResponse)
def social_auth(data: SocialAuthRequest, db: Session = Depends(get_db)):
    """Direct endpoint to sign up or sign in using Google or Microsoft profile."""
    profile = {
        "provider": data.provider.lower(),
        "email": data.email.strip().lower(),
        "name": data.name.strip(),
        "provider_id": data.provider_id,
        "avatar_url": data.avatar_url,
    }
    user = get_or_create_social_user(db, profile)
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    return AuthResponse(
        message=f"Signed in with {data.provider.capitalize()} successfully!",
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            provider=user.provider,
            avatar_url=user.avatar_url,
            created_at=user.created_at.isoformat() if user.created_at else None,
        ),
    )

@app.get("/api/auth/oauth/{provider}")
def oauth_initiate(provider: str, state: str = Query("login")):
    """Redirect to Google or Microsoft OAuth provider authorization URL."""
    p = provider.lower()
    if p == "google":
        url = get_google_auth_url(state=state)
        return RedirectResponse(url=url)
    elif p == "microsoft":
        url = get_microsoft_auth_url(state=state)
        return RedirectResponse(url=url)
    raise HTTPException(status_code=400, detail="Unsupported OAuth provider. Use 'google' or 'microsoft'.")

@app.get("/api/auth/oauth/mock")
def oauth_mock_screen(provider: str = Query("google"), state: str = Query("login")):
    """Display the interactive mock OAuth screen for local testing."""
    return render_mock_oauth_screen(provider=provider, state=state)

@app.get("/api/auth/oauth/mock/complete")
def oauth_mock_complete(
    provider: str = Query(...),
    name: str = Query(...),
    email: str = Query(...),
    state: str = Query("login"),
    db: Session = Depends(get_db),
):
    """Complete simulated OAuth flow, register/login user, and redirect to frontend."""
    profile = {
        "provider": provider.lower(),
        "email": email.strip().lower(),
        "name": name.strip(),
        "provider_id": f"mock_{provider}_{hash(email) % 1000000}",
    }
    user = get_or_create_social_user(db, profile)
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    # Redirect to frontend index.html with authentication params in query
    redirect_target = f"{FRONTEND_URL}/index.html?token={token}&name={urllib_quote(user.name)}&email={urllib_quote(user.email)}&provider={user.provider}"
    return RedirectResponse(url=redirect_target)

def urllib_quote(s: str) -> str:
    import urllib.parse
    return urllib.parse.quote(s or "")

@app.get("/api/auth/oauth/google/callback")
async def google_callback(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Callback for real Google OAuth 2.0 flow."""
    if error or not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/signin.html?error=Google authentication was canceled.")
    
    profile = await exchange_google_code(code)
    if not profile:
        return RedirectResponse(url=f"{FRONTEND_URL}/signin.html?error=Failed to retrieve Google account info.")
    
    user = get_or_create_social_user(db, profile)
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    redirect_target = f"{FRONTEND_URL}/index.html?token={token}&name={urllib_quote(user.name)}&email={urllib_quote(user.email)}&provider={user.provider}"
    return RedirectResponse(url=redirect_target)

@app.get("/api/auth/oauth/microsoft/callback")
async def microsoft_callback(code: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    """Callback for real Microsoft OAuth 2.0 flow."""
    if error or not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/signin.html?error=Microsoft authentication was canceled.")
    
    profile = await exchange_microsoft_code(code)
    if not profile:
        return RedirectResponse(url=f"{FRONTEND_URL}/signin.html?error=Failed to retrieve Microsoft account info.")
    
    user = get_or_create_social_user(db, profile)
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "name": user.name})
    
    redirect_target = f"{FRONTEND_URL}/index.html?token={token}&name={urllib_quote(user.name)}&email={urllib_quote(user.email)}&provider={user.provider}"
    return RedirectResponse(url=redirect_target)

# -------------------------------------------------------------
# Customer Feedback & Contact Endpoints
# -------------------------------------------------------------

@app.post("/api/feedback", status_code=status.HTTP_201_CREATED)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    """Save customer feedback to SQLite database."""
    feedback = Feedback(
        name=data.name.strip(),
        email=data.email.strip().lower(),
        rating=data.rating or "5",
        topic=data.topic or "General Feedback",
        message=data.message.strip(),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {
        "status": "success",
        "message": "Thank you! Your feedback has been received and saved successfully.",
        "feedback": feedback.to_dict(),
    }

@app.get("/api/feedback")
def list_feedback(db: Session = Depends(get_db)):
    """Retrieve all submitted feedback records."""
    items = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    return {
        "status": "success",
        "count": len(items),
        "feedback": [item.to_dict() for item in items]
    }

# -------------------------------------------------------------
# Static Files & Frontend Serving
# -------------------------------------------------------------

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
