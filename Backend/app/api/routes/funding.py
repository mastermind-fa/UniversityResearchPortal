from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.funding import FundingSource, ProjectFunding
from app.models.projects import Project
from app.schemas.funding import (
    FundingSourceCreate, 
    FundingSourceUpdate, 
    FundingSourceInDB,
    FundingSourceWithProjects,
    ProjectFundingCreate,
    ProjectFundingUpdate,
    ProjectFundingWithDetails,
    PaginatedProjectFunding
)

router = APIRouter(tags=["funding"]) 

# Funding Sources endpoints
@router.get("/funding-sources", response_model=List[FundingSourceInDB])
def get_funding_sources(
    search: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all funding sources with optional filtering"""
    query = db.query(FundingSource)
    
    # Apply filters
    if search:
        query = query.filter(FundingSource.source_name.ilike(f"%{search}%"))
    
    if type:
        query = query.filter(FundingSource.source_type == type)
    
    funding_sources = query.order_by(FundingSource.source_name).all()
    return funding_sources

@router.get("/funding-sources/summary")
def get_funding_summary(db: Session = Depends(get_db)):
    """Get funding summary statistics for dashboard"""
    # Total funding across all projects
    total_funding = db.query(func.sum(ProjectFunding.amount)).scalar() or 0
    
    # Total funding by funding source type
    funding_by_type = db.query(
        FundingSource.source_type,
        func.sum(ProjectFunding.amount).label("total_amount")
    ).join(ProjectFunding, FundingSource.funding_id == ProjectFunding.funding_id)\
     .group_by(FundingSource.source_type)\
     .all()
    
    funding_by_type_dict = {item.source_type: item.total_amount for item in funding_by_type}
    
    # Total funding by year
    funding_by_year = db.query(
        func.extract('year', ProjectFunding.start_date).label('year'),
        func.sum(ProjectFunding.amount).label("total_amount")
    ).group_by(func.extract('year', ProjectFunding.start_date))\
     .order_by(func.extract('year', ProjectFunding.start_date))\
     .all()
    
    funding_by_year_dict = {int(item.year): item.total_amount for item in funding_by_year if item.year is not None}
    
    # Top funding sources
    top_sources = db.query(
        FundingSource.source_name,
        func.sum(ProjectFunding.amount).label("total_amount")
    ).join(ProjectFunding, FundingSource.funding_id == ProjectFunding.funding_id)\
     .group_by(FundingSource.funding_id, FundingSource.source_name)\
     .order_by(func.sum(ProjectFunding.amount).desc())\
     .limit(5)\
     .all()
    
    top_sources_list = [{"source_name": item.source_name, "total_amount": item.total_amount} for item in top_sources]
    
    return {
        "total_funding": total_funding,
        "funding_by_type": funding_by_type_dict,
        "funding_by_year": funding_by_year_dict,
        "top_funding_sources": top_sources_list
    }

@router.get("/funding-sources/{funding_id}", response_model=FundingSourceWithProjects)
def get_funding_source(funding_id: int, db: Session = Depends(get_db)):
    """Get a specific funding source by ID with funded projects"""
    funding_source = db.query(FundingSource).filter(FundingSource.funding_id == funding_id).first()
    
    if not funding_source:
        raise HTTPException(status_code=404, detail=f"Funding source with ID {funding_id} not found")
    
    # Get funded projects
    funded_projects = db.query(
        ProjectFunding.amount,
        ProjectFunding.start_date,
        ProjectFunding.end_date,
        ProjectFunding.grant_number,
        Project.project_id,
        Project.project_title
    ).join(
        Project, ProjectFunding.project_id == Project.project_id
    ).filter(
        ProjectFunding.funding_id == funding_id
    ).all()
    
    projects = []
    total_funding = 0
    for pf in funded_projects:
        projects.append({
            "project_id": pf.project_id,
            "project_title": pf.project_title,
            "amount": pf.amount,
            "start_date": pf.start_date,
            "end_date": pf.end_date,
            "grant_number": pf.grant_number
        })
        total_funding += pf.amount or 0
    
    # Construct funding source data
    funding_data = {
        "funding_id": funding_source.funding_id,
        "source_name": funding_source.source_name,
        "source_type": funding_source.source_type,
        "contact_info": funding_source.contact_info,
        "projects": projects,
        "total_funding": total_funding
    }
    
    return funding_data

@router.post("/funding-sources", response_model=FundingSourceInDB)
def create_funding_source(funding_source: FundingSourceCreate, db: Session = Depends(get_db)):
    """Create a new funding source"""
    db_funding_source = FundingSource(
        source_name=funding_source.source_name,
        source_type=funding_source.source_type,
        contact_info=funding_source.contact_info
    )
    
    db.add(db_funding_source)
    db.commit()
    db.refresh(db_funding_source)
    
    return db_funding_source

@router.put("/funding-sources/{funding_id}", response_model=FundingSourceInDB)
def update_funding_source(funding_id: int, funding_source: FundingSourceUpdate, db: Session = Depends(get_db)):
    """Update a funding source"""
    db_funding_source = db.query(FundingSource).filter(FundingSource.funding_id == funding_id).first()
    
    if not db_funding_source:
        raise HTTPException(status_code=404, detail=f"Funding source with ID {funding_id} not found")
    
    # Update funding source fields
    db_funding_source.source_name = funding_source.source_name
    db_funding_source.source_type = funding_source.source_type
    db_funding_source.contact_info = funding_source.contact_info
    
    db.commit()
    db.refresh(db_funding_source)
    
    return db_funding_source

@router.delete("/funding-sources/{funding_id}")
def delete_funding_source(funding_id: int, db: Session = Depends(get_db)):
    """Delete a funding source"""
    db_funding_source = db.query(FundingSource).filter(FundingSource.funding_id == funding_id).first()
    
    if not db_funding_source:
        raise HTTPException(status_code=404, detail=f"Funding source with ID {funding_id} not found")
    
    # Check if funding source has allocations
    allocations = db.query(ProjectFunding).filter(ProjectFunding.funding_id == funding_id).first()
    if allocations:
        raise HTTPException(status_code=400, detail="Cannot delete funding source with existing project allocations")
    
    db.delete(db_funding_source)
    db.commit()
    
    return {"message": "Funding source deleted successfully"}

# Project Funding endpoints
@router.get("/project-funding", response_model=PaginatedProjectFunding)
def get_project_funding(
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get all project funding allocations with optional filtering and pagination"""
    query = db.query(
        ProjectFunding.project_id,
        ProjectFunding.funding_id,
        ProjectFunding.amount,
        ProjectFunding.start_date,
        ProjectFunding.end_date,
        ProjectFunding.grant_number,
        Project.project_title,
        FundingSource.source_name,
        FundingSource.source_type
    ).join(
        Project, ProjectFunding.project_id == Project.project_id
    ).join(
        FundingSource, ProjectFunding.funding_id == FundingSource.funding_id
    )
    
    # Apply filters
    if search:
        query = query.filter(
            (Project.project_title.ilike(f"%{search}%")) | 
            (FundingSource.source_name.ilike(f"%{search}%"))
        )
    
    if type:
        query = query.filter(FundingSource.source_type == type)
    
    # Count total items
    total = query.count()
    
    # Pagination
    total_pages = (total + limit - 1) // limit
    offset = (page - 1) * limit
    
    # Apply pagination and get results
    allocations = query.order_by(ProjectFunding.start_date.desc()).offset(offset).limit(limit).all()
    
    # Format results
    results = []
    for allocation in allocations:
        results.append({
            "project_id": allocation.project_id,
            "funding_id": allocation.funding_id,
            "amount": allocation.amount,
            "start_date": allocation.start_date,
            "end_date": allocation.end_date,
            "grant_number": allocation.grant_number,
            "project_title": allocation.project_title,
            "source_name": allocation.source_name,
            "source_type": allocation.source_type
        })
    
    return {
        "total": total,
        "total_pages": total_pages,
        "current_page": page,
        "items": results
    }

@router.post("/project-funding", response_model=ProjectFundingWithDetails)
def create_project_funding(funding: ProjectFundingCreate, db: Session = Depends(get_db)):
    """Create a new project funding allocation"""
    # Verify project exists
    project = db.query(Project).filter(Project.project_id == funding.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project with ID {funding.project_id} not found")
    
    # Verify funding source exists
    funding_source = db.query(FundingSource).filter(FundingSource.funding_id == funding.funding_id).first()
    if not funding_source:
        raise HTTPException(status_code=404, detail=f"Funding source with ID {funding.funding_id} not found")
    
    # Check for existing allocation
    existing = db.query(ProjectFunding).filter(
        ProjectFunding.project_id == funding.project_id,
        ProjectFunding.funding_id == funding.funding_id,
        ProjectFunding.start_date == funding.start_date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Funding allocation already exists for this project and funding source with the same start date")
    
    db_funding = ProjectFunding(
        project_id=funding.project_id,
        funding_id=funding.funding_id,
        amount=funding.amount,
        start_date=funding.start_date,
        end_date=funding.end_date,
        grant_number=funding.grant_number
    )
    
    db.add(db_funding)
    db.commit()
    db.refresh(db_funding)
    
    # Return with details
    return {
        "project_id": db_funding.project_id,
        "funding_id": db_funding.funding_id,
        "amount": db_funding.amount,
        "start_date": db_funding.start_date,
        "end_date": db_funding.end_date,
        "grant_number": db_funding.grant_number,
        "project_title": project.project_title,
        "source_name": funding_source.source_name,
        "source_type": funding_source.source_type
    }

@router.delete("/project-funding/{project_id}/{funding_id}")
def delete_project_funding(project_id: int, funding_id: int, db: Session = Depends(get_db)):
    """Delete a project funding allocation"""
    db_funding = db.query(ProjectFunding).filter(
        ProjectFunding.project_id == project_id,
        ProjectFunding.funding_id == funding_id
    ).first()
    
    if not db_funding:
        raise HTTPException(status_code=404, detail="Funding allocation not found")
    
    db.delete(db_funding)
    db.commit()
    
    return {"message": "Funding allocation deleted successfully"}
