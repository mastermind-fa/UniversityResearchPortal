from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime

from app.db.session import get_db
from app.models.student_research import StudentResearch
from app.models.projects import Project
from app.models.students import Student

router = APIRouter(prefix="/student-research", tags=["student-research"])

# Pydantic model for JSON requests
class StudentResearchCreate(BaseModel):
    student_id: int
    project_id: int
    start_date: str
    role: str
    end_date: Optional[str] = None


@router.get("/", response_model=List[dict])
def get_student_research(
    student_id: int = None,
    project_id: int = None,
    db: Session = Depends(get_db)
):
    """Get student research participation with optional filters"""
    query = db.query(StudentResearch)
    
    if student_id:
        query = query.filter(StudentResearch.student_id == student_id)
    if project_id:
        query = query.filter(StudentResearch.project_id == project_id)
    
    participations = query.all()
    
    result = []
    for participation in participations:
        # Get project and student details
        project = db.query(Project).filter(Project.project_id == participation.project_id).first()
        student = db.query(Student).filter(Student.student_id == participation.student_id).first()
        
        if project and student:
            result.append({
                "student_id": participation.student_id,
                "student_name": f"{student.first_name} {student.last_name}",
                "project_id": participation.project_id,
                "project_title": project.project_title,
                "start_date": participation.start_date,
                "end_date": participation.end_date,
                "role": participation.role
            })
    
    return result


@router.post("/")
def add_student_research(
    student_id: int,
    project_id: int,
    start_date: str,
    role: str,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """Add a student to a research project"""
    # Check if project exists
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if student exists
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if participation already exists
    existing = db.query(StudentResearch).filter(
        StudentResearch.student_id == student_id,
        StudentResearch.project_id == project_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already participating in this project")
    
    # Parse dates
    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_date_obj = None
    if end_date:
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()

    # Create new participation
    participation = StudentResearch(
        student_id=student_id,
        project_id=project_id,
        start_date=start_date_obj,
        end_date=end_date_obj,
        role=role
    )
    
    db.add(participation)
    db.commit()
    db.refresh(participation)
    
    return {"message": "Student added to research project successfully", "participation": participation}


@router.post("/json")
def add_student_research_json(
    research: StudentResearchCreate,
    db: Session = Depends(get_db)
):
    """Add a student to a research project using JSON body"""
    # Check if project exists
    project = db.query(Project).filter(Project.project_id == research.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if student exists
    student = db.query(Student).filter(Student.student_id == research.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if participation already exists
    existing = db.query(StudentResearch).filter(
        StudentResearch.student_id == research.student_id,
        StudentResearch.project_id == research.project_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Student already participating in this project")
    
    # Parse dates
    start_date_obj = datetime.strptime(research.start_date, "%Y-%m-%d").date()
    end_date_obj = None
    if research.end_date:
        end_date_obj = datetime.strptime(research.end_date, "%Y-%m-%d").date()
    
    # Create new participation
    participation = StudentResearch(
        student_id=research.student_id,
        project_id=research.project_id,
        start_date=start_date_obj,
        end_date=end_date_obj,
        role=research.role
    )
    
    db.add(participation)
    db.commit()
    db.refresh(participation)
    
    return {"message": "Student added to research project successfully", "participation": participation}


@router.delete("/{student_id}/{project_id}")
def remove_student_research(
    student_id: int,
    project_id: int,
    db: Session = Depends(get_db)
):
    """Remove a student from a research project"""
    participation = db.query(StudentResearch).filter(
        StudentResearch.student_id == student_id,
        StudentResearch.project_id == project_id
    ).first()
    
    if not participation:
        raise HTTPException(status_code=404, detail="Student research participation not found")
    
    db.delete(participation)
    db.commit()
    
    return {"message": "Student removed from research project successfully"}
