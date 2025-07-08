from typing import Optional
from datetime import date
from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., max_length=100)
    enrollment_date: date
    program_type: str = Field(..., max_length=20)
    dept_id: int
    advisor_id: Optional[int] = None
    graduation_date: Optional[date] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = Field(None, max_length=100)
    enrollment_date: Optional[date] = None
    program_type: Optional[str] = Field(None, max_length=20)
    dept_id: Optional[int] = None
    advisor_id: Optional[int] = None
    graduation_date: Optional[date] = None


class StudentInDB(StudentBase):
    student_id: int

    class Config:
        from_attributes = True


class Student(StudentInDB):
    pass
