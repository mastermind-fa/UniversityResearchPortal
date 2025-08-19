from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    project_title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: date
    end_date: Optional[date] = None
    status: Optional[str] = "Active"
    budget: Optional[float] = Field(None, ge=0)
    principal_investigator_id: int
    dept_id: int


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    principal_investigator_id: Optional[int] = None
    dept_id: Optional[int] = None

class ProjectInDB(ProjectBase):
    project_id: int

    class Config:
        from_attributes = True


class Project(ProjectInDB):
    pass


# Collaborator schemas
class ProjectCollaboratorBase(BaseModel):
    project_id: int
    faculty_id: int
    role: str
    involvement_percentage: Optional[float] = Field(None, ge=0, le=100)


class ProjectCollaboratorCreate(ProjectCollaboratorBase):
    pass


class ProjectCollaborator(ProjectCollaboratorBase):
    class Config:
        from_attributes = True


# Student Research schemas
class StudentResearchBase(BaseModel):
    student_id: int
    project_id: int
    start_date: date
    end_date: Optional[date] = None
    role: str


class StudentResearchCreate(StudentResearchBase):
    pass


class StudentResearch(StudentResearchBase):
    class Config:
        from_attributes = True
