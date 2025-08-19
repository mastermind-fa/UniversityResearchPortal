from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.projects import Project
from app.models.faculty import Faculty
from app.models.students import Student
from app.schemas.projects import ProjectCreate, ProjectUpdate, Project as ProjectSchema

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectSchema, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new research project"""
    # Create project object directly from the schema
    project_data = project.model_dump()
    db_project = Project(**project_data)
    
    # Add project to session
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project


@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    title: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all projects with optional filters"""
    query = db.query(Project)
    
    if title:
        query = query.filter(Project.title.ilike(f"%{title}%"))
    if is_active is not None:
        query = query.filter(Project.is_active == is_active)
    
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/active", response_model=List[ProjectSchema])
def read_active_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all active projects"""
    projects = db.query(Project).filter(Project.is_active == True).offset(skip).limit(limit).all()
    return projects


@router.get("/by-department/{dept_id}", response_model=List[ProjectSchema])
def read_projects_by_department(
    dept_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get projects by department"""
    projects = db.query(Project).filter(Project.dept_id == dept_id).offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    db_project = db.query(Project).filter(Project.project_id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project"""
    db_project = db.query(Project).filter(Project.project_id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update basic fields
    update_data = project.model_dump(exclude={"faculty_ids", "student_ids"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    # Update faculty members if provided
    if project.faculty_ids is not None:
        db_project.faculty_members = []
        if project.faculty_ids:
            faculty_members = db.query(Faculty).filter(Faculty.faculty_id.in_(project.faculty_ids)).all()
            db_project.faculty_members.extend(faculty_members)
    
    # Update students if provided
    if project.student_ids is not None:
        db_project.students = []
        if project.student_ids:
            students = db.query(Student).filter(Student.student_id.in_(project.student_ids)).all()
            db_project.students.extend(students)
    
    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", response_model=ProjectSchema)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    db_project = db.query(Project).filter(Project.project_id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return db_project
