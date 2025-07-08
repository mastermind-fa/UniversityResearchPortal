from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, EmailStr


class FacultyBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., max_length=100)  # Using str instead of EmailStr for simplicity
    phone: Optional[str] = Field(None, max_length=15)
    hire_date: date
    position: Optional[str] = Field(None, max_length=50)
    dept_id: int
    salary: Optional[float] = Field(None, gt=0)
    research_interests: Optional[str] = Field(None, max_length=1000)


class FacultyCreate(FacultyBase):
    pass


class FacultyUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    hire_date: Optional[date] = None
    position: Optional[str] = Field(None, max_length=50)
    dept_id: Optional[int] = None
    salary: Optional[float] = Field(None, gt=0)
    research_interests: Optional[str] = Field(None, max_length=1000)


class FacultyInDB(FacultyBase):
    faculty_id: int

    class Config:
        from_attributes = True


class Faculty(FacultyInDB):
    pass
