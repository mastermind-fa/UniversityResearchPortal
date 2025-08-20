from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field


class PublicationAuthor(BaseModel):
    faculty_id: int
    name: Optional[str] = None
    author_order: int
    is_corresponding: str = Field("N", pattern="^[YN]$")

    class Config:
        from_attributes = True


class PublicationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    publication_type: str
    journal_name: Optional[str] = Field(None, max_length=200)
    publication_date: date
    doi: Optional[str] = Field(None, max_length=100)
    citation_count: Optional[int] = Field(0, ge=0)
    project_id: Optional[int] = None


class PublicationCreate(PublicationBase):
    pass


class PublicationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    publication_type: Optional[str] = None
    journal_name: Optional[str] = Field(None, max_length=200)
    publication_date: Optional[date] = None
    doi: Optional[str] = Field(None, max_length=100)
    citation_count: Optional[int] = Field(None, ge=0)
    project_id: Optional[int] = None


class PublicationInDB(PublicationBase):
    publication_id: int

    class Config:
        from_attributes = True


class Publication(PublicationInDB):
    pass


class PublicationWithAuthors(PublicationInDB):
    authors: List[PublicationAuthor] = []
    project_title: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedPublications(BaseModel):
    total: int
    total_pages: int
    page: int
    limit: int
    items: List[PublicationWithAuthors]
