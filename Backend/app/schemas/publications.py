from typing import List, Optional
from datetime import date
from pydantic import BaseModel


class PublicationAuthor(BaseModel):
    faculty_id: int
    author_order: int
    is_corresponding: bool = False

    class Config:
        from_attributes = True


from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


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


# Publication Author schemas
class PublicationAuthorBase(BaseModel):
    author_id: int
    publication_id: int
    is_corresponding: str = Field("N", pattern="^[YN]$")


class PublicationAuthorCreate(PublicationAuthorBase):
    pass


class PublicationAuthor(PublicationAuthorBase):
    class Config:
        from_attributes = True


class PublicationCreate(PublicationBase):
    authors: Optional[List[PublicationAuthor]] = []


class PublicationUpdate(PublicationBase):
    authors: Optional[List[PublicationAuthor]] = None


class PublicationInDB(PublicationBase):
    publication_id: int

    class Config:
        from_attributes = True


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
