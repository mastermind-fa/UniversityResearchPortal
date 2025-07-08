from typing import Optional
from pydantic import BaseModel, Field


class DepartmentBase(BaseModel):
    dept_name: str = Field(..., min_length=1, max_length=100)
    dept_head: Optional[str] = None
    research_focus: Optional[str] = None
    established_year: Optional[int] = Field(None, ge=1900)
    budget: Optional[float] = Field(None, ge=0)


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(DepartmentBase):
    dept_name: Optional[str] = Field(None, min_length=1, max_length=100)


class DepartmentInDB(DepartmentBase):
    dept_id: int

    class Config:
        from_attributes = True


class Department(DepartmentInDB):
    pass
