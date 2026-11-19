from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password with minimum 8 characters")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

class SocialAuthRequest(BaseModel):
    provider: str = Field(..., pattern="^(google|microsoft)$", description="OAuth provider")
    email: EmailStr = Field(..., description="Email address from provider")
    name: str = Field(..., min_length=1, description="Display name from provider")
    provider_id: Optional[str] = Field(None, description="Unique account ID from provider")
    avatar_url: Optional[str] = Field(None, description="Profile picture URL")

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    provider: str
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    status: str = "success"
    message: str
    token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    status: str = "success"
    message: str

class FeedbackCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of person providing feedback")
    email: EmailStr = Field(..., description="Email address")
    rating: Optional[str] = Field("5", description="Rating from 1 to 5")
    topic: Optional[str] = Field("General Feedback", description="Category or topic of feedback")
    message: str = Field(..., min_length=3, max_length=2000, description="Feedback message")

class FeedbackResponse(BaseModel):
    id: int
    name: str
    email: str
    rating: str
    topic: str
    message: str
    created_at: Optional[str] = None

