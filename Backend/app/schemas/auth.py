from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

class UserBase(BaseModel):
    email: EmailStr
    user_type: str

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    # Additional fields based on user type
    phone: Optional[str] = None
    hire_date: Optional[str] = None  # Keep as string for input, will be converted
    position: Optional[str] = None
    research_interests: Optional[str] = None
    enrollment_date: Optional[str] = None  # Keep as string for input, will be converted
    program_type: Optional[str] = None
    advisor_id: Optional[int] = None
    dept_id: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: int
    email: str
    user_type: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Profile information
    first_name: str
    last_name: str
    phone: Optional[str] = None
    hire_date: Optional[date] = None
    position: Optional[str] = None
    research_interests: Optional[str] = None
    enrollment_date: Optional[date] = None
    program_type: Optional[str] = None
    advisor_id: Optional[int] = None
    dept_id: Optional[int] = None
    dept_name: Optional[str] = None
    advisor_name: Optional[str] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    research_interests: Optional[str] = None
    position: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None
    user_id: Optional[int] = None
