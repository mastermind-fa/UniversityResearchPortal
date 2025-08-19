from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.collaborators import ProjectCollaborator
from app.models.projects import Project
from app.models.faculty import Faculty

router = APIRouter(prefix="/project-collaborators", tags=["collaborators"])

# Pydantic model for JSON requests
class CollaboratorCreate(BaseModel):
    project_id: int
    faculty_id: int
    role: str
    involvement_percentage: float = None


@router.get("/", response_model=List[dict])
def get_project_collaborators(
    project_id: int = None,
    faculty_id: int = None,
    db: Session = Depends(get_db)
):
    """Get project collaborators with optional filters"""
    query = db.query(ProjectCollaborator)
    
    if project_id:
        query = query.filter(ProjectCollaborator.project_id == project_id)
    if faculty_id:
        query = query.filter(ProjectCollaborator.faculty_id == faculty_id)
    
    collaborators = query.all()
    
    result = []
    for collab in collaborators:
        # Get project and faculty details
        project = db.query(Project).filter(Project.project_id == collab.project_id).first()
        faculty = db.query(Faculty).filter(Faculty.faculty_id == collab.faculty_id).first()
        
        if project and faculty:
            result.append({
                "project_id": collab.project_id,
                "project_title": project.project_title,
                "faculty_id": collab.faculty_id,
                "faculty_name": f"{faculty.first_name} {faculty.last_name}",
                "role": collab.role,
                "involvement_percentage": collab.involvement_percentage
            })
    
    return result


@router.post("/")
def add_project_collaborator(
    project_id: int,
    faculty_id: int,
    role: str,
    involvement_percentage: float = None,
    db: Session = Depends(get_db)
):
    """Add a faculty member as collaborator to a project"""
    # Check if project exists
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if faculty exists
    faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    # Check if collaboration already exists
    existing = db.query(ProjectCollaborator).filter(
        ProjectCollaborator.project_id == project_id,
        ProjectCollaborator.faculty_id == faculty_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Collaboration already exists")
    
    # Create new collaboration
    collaboration = ProjectCollaborator(
        project_id=project_id,
        faculty_id=faculty_id,
        role=role,
        involvement_percentage=involvement_percentage
    )
    
    db.add(collaboration)
    db.commit()
    db.refresh(collaboration)
    
    return {"message": "Collaborator added successfully", "collaboration": collaboration}


@router.post("/json")
def add_project_collaborator_json(
    collaborator: CollaboratorCreate,
    db: Session = Depends(get_db)
):
    """Add a faculty member as collaborator to a project using JSON body"""
    # Check if project exists
    project = db.query(Project).filter(Project.project_id == collaborator.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if faculty exists
    faculty = db.query(Faculty).filter(Faculty.faculty_id == collaborator.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    # Check if collaboration already exists
    existing = db.query(ProjectCollaborator).filter(
        ProjectCollaborator.project_id == collaborator.project_id,
        ProjectCollaborator.faculty_id == collaborator.faculty_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Collaboration already exists")
    
    # Create new collaboration
    collaboration = ProjectCollaborator(
        project_id=collaborator.project_id,
        faculty_id=collaborator.faculty_id,
        role=collaborator.role,
        involvement_percentage=collaborator.involvement_percentage
    )
    
    db.add(collaboration)
    db.commit()
    db.refresh(collaboration)
    
    return {"message": "Collaborator added successfully", "collaboration": collaboration}


@router.delete("/{project_id}/{faculty_id}")
def remove_project_collaborator(
    project_id: int,
    faculty_id: int,
    db: Session = Depends(get_db)
):
    """Remove a faculty member as collaborator from a project"""
    collaboration = db.query(ProjectCollaborator).filter(
        ProjectCollaborator.project_id == project_id,
        ProjectCollaborator.faculty_id == faculty_id
    ).first()
    
    if not collaboration:
        raise HTTPException(status_code=404, detail="Collaboration not found")
    
    db.delete(collaboration)
    db.commit()
    
    return {"message": "Collaborator removed successfully"}
