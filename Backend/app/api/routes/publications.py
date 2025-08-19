from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, extract
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.db.session import get_db
from app.models.publications import Publication
from app.models.faculty import Faculty
from app.models.projects import Project
from app.models.publication_authors import PublicationAuthor
from app.schemas.publications import (
    PublicationCreate, 
    PublicationUpdate, 
    PublicationWithAuthors,
    PublicationInDB,
    PaginatedPublications
)

router = APIRouter(prefix="/publications", tags=["publications"])

# Pydantic model for publication authors
class PublicationAuthorCreate(BaseModel):
    publication_id: int
    faculty_id: int
    author_order: int
    is_corresponding: str = "N"

@router.get("", response_model=PaginatedPublications)
def get_publications(
    search: Optional[str] = None,
    type: Optional[str] = None,
    year: Optional[int] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get all publications with optional filtering and pagination"""
    query = db.query(Publication)
    
    # Apply filters
    if search:
        query = query.filter(
            (Publication.title.ilike(f"%{search}%")) | 
            (Publication.journal_name.ilike(f"%{search}%"))
        )
    
    if type:
        query = query.filter(Publication.publication_type == type)
    
    if year:
        query = query.filter(extract('year', Publication.publication_date) == year)
    
    # Count total items
    total = query.count()
    
    # Pagination
    total_pages = (total + limit - 1) // limit
    offset = (page - 1) * limit
    
    # Apply pagination and get results
    publications = query.order_by(Publication.publication_date.desc()).offset(offset).limit(limit).all()
    
    # Fetch additional data
    results = []
    for pub in publications:
        # Get author data using the new PublicationAuthor model
        authors_query = db.query(
            Faculty.faculty_id,
            Faculty.first_name,
            Faculty.last_name,
            PublicationAuthor.author_order,
            PublicationAuthor.is_corresponding
        ).join(
            PublicationAuthor, Faculty.faculty_id == PublicationAuthor.faculty_id
        ).filter(
            PublicationAuthor.publication_id == pub.publication_id
        ).order_by(
            PublicationAuthor.author_order
        )
        
        authors = []
        for author in authors_query.all():
            authors.append({
                "faculty_id": author.faculty_id,
                "name": f"{author.first_name} {author.last_name}",
                "author_order": author.author_order,
                "is_corresponding": author.is_corresponding
            })
        
        # Get project title if available
        project_title = None
        if pub.project_id:
            project = db.query(Project.project_title).filter(Project.project_id == pub.project_id).first()
            if project:
                project_title = project.project_title
        
        # Construct publication data
        pub_data = {
            "publication_id": pub.publication_id,
            "title": pub.title,
            "publication_type": pub.publication_type,
            "journal_name": pub.journal_name,
            "publication_date": pub.publication_date,
            "doi": pub.doi,
            "citation_count": pub.citation_count,
            "project_id": pub.project_id,
            "project_title": project_title,
            "authors": authors
        }
        
        results.append(pub_data)
    
    return PaginatedPublications(
        items=results,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{publication_id}", response_model=PublicationWithAuthors)
def get_publication(publication_id: int, db: Session = Depends(get_db)):
    """Get a specific publication by ID with author details"""
    publication = db.query(Publication).filter(Publication.publication_id == publication_id).first()
    
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Get authors
    authors_query = db.query(
        Faculty.faculty_id,
        Faculty.first_name,
        Faculty.last_name,
        PublicationAuthor.author_order,
        PublicationAuthor.is_corresponding
    ).join(
        PublicationAuthor, Faculty.faculty_id == PublicationAuthor.faculty_id
    ).filter(
        PublicationAuthor.publication_id == publication_id
    ).order_by(
        PublicationAuthor.author_order
    )
    
    authors = []
    for author in authors_query.all():
        authors.append({
            "faculty_id": author.faculty_id,
            "name": f"{author.first_name} {author.last_name}",
            "author_order": author.author_order,
            "is_corresponding": author.is_corresponding
        })
    
    # Get project title if available
    project_title = None
    if publication.project_id:
        project = db.query(Project.project_title).filter(Project.project_id == publication.project_id).first()
        if project:
            project_title = project.project_title
    
    return PublicationWithAuthors(
        publication_id=publication.publication_id,
        title=publication.title,
        publication_type=publication.publication_type,
        journal_name=publication.journal_name,
        publication_date=publication.publication_date,
        doi=publication.doi,
        citation_count=publication.citation_count,
        project_id=publication.project_id,
        project_title=project_title,
        authors=authors
    )


@router.post("", response_model=PublicationInDB)
def create_publication(publication: PublicationCreate, db: Session = Depends(get_db)):
    """Create a new publication"""
    db_publication = Publication(**publication.model_dump(exclude={"authors"}))
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    return db_publication


@router.put("/{publication_id}", response_model=PublicationInDB)
def update_publication(publication_id: int, publication: PublicationUpdate, db: Session = Depends(get_db)):
    """Update a publication"""
    db_publication = db.query(Publication).filter(Publication.publication_id == publication_id).first()
    
    if not db_publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    update_data = publication.model_dump(exclude_unset=True, exclude={"authors"})
    for key, value in update_data.items():
        setattr(db_publication, key, value)
    
    db.commit()
    db.refresh(db_publication)
    return db_publication


@router.delete("/{publication_id}")
def delete_publication(publication_id: int, db: Session = Depends(get_db)):
    """Delete a publication"""
    publication = db.query(Publication).filter(Publication.publication_id == publication_id).first()
    
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    db.delete(publication)
    db.commit()
    
    return {"message": "Publication deleted successfully"}


@router.get("/stats/overview")
def get_publication_stats(db: Session = Depends(get_db)):
    """Get publication statistics overview"""
    total_publications = db.query(func.count(Publication.publication_id)).scalar()
    total_citations = db.query(func.sum(Publication.citation_count)).scalar() or 0
    
    # Publications by type
    type_stats = db.query(
        Publication.publication_type,
        func.count(Publication.publication_id)
    ).group_by(Publication.publication_type).all()
    
    # Publications by year
    year_stats = db.query(
        extract('year', Publication.publication_date).label('year'),
        func.count(Publication.publication_id)
    ).group_by(extract('year', Publication.publication_date)).order_by(extract('year', Publication.publication_date)).all()
    
    return {
        "total_publications": total_publications,
        "total_citations": total_citations,
        "by_type": {stat[0]: stat[1] for stat in type_stats},
        "by_year": {int(stat[0]): stat[1] for stat in year_stats if stat[0] is not None}
    }


@router.post("/authors")
def add_publication_author(
    author: PublicationAuthorCreate,
    db: Session = Depends(get_db)
):
    """Add an author to a publication"""
    # Check if publication exists
    publication = db.query(Publication).filter(Publication.publication_id == author.publication_id).first()
    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Check if faculty exists
    faculty = db.query(Faculty).filter(Faculty.faculty_id == author.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    # Check if author already exists for this publication
    existing = db.query(PublicationAuthor).filter(
        PublicationAuthor.publication_id == author.publication_id,
        PublicationAuthor.faculty_id == author.faculty_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Author already exists for this publication")
    
    # Create new publication author
    pub_author = PublicationAuthor(
        publication_id=author.publication_id,
        faculty_id=author.faculty_id,
        author_order=author.author_order,
        is_corresponding=author.is_corresponding
    )
    
    db.add(pub_author)
    db.commit()
    db.refresh(pub_author)
    
    return {"message": "Publication author added successfully", "author": pub_author}
