from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: date
    end_date: Optional[date] = None
    is_active: Optional[bool] = True
    budget: Optional[float] = Field(None, ge=0)
    funding_source: Optional[str] = Field(None, max_length=200)
    dept_id: int


class ProjectCreate(ProjectBase):
    faculty_ids: Optional[List[int]] = []
    student_ids: Optional[List[int]] = []


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    budget: Optional[float] = Field(None, ge=0)
    funding_source: Optional[str] = Field(None, max_length=200)
    dept_id: Optional[int] = None
    faculty_ids: Optional[List[int]] = None
    student_ids: Optional[List[int]] = None


class ProjectInDB(ProjectBase):
    project_id: int

    class Config:
        from_attributes = True


class FacultyBrief(BaseModel):
    faculty_id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class StudentBrief(BaseModel):
    student_id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True


class Project(ProjectInDB):
    faculty_members: List[FacultyBrief] = []
    students: List[StudentBrief] = []
