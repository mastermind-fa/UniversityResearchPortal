from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.faculty import Faculty
from app.schemas.faculty import FacultyCreate, FacultyUpdate, Faculty as FacultySchema

router = APIRouter(prefix="/faculty", tags=["faculty"])


@router.post("/", response_model=FacultySchema)
def create_faculty(faculty: FacultyCreate, db: Session = Depends(get_db)):
    """Create a new faculty member"""
    db_faculty = Faculty(**faculty.model_dump())
    db.add(db_faculty)
    db.commit()
    db.refresh(db_faculty)
    return db_faculty


@router.get("/", response_model=List[FacultySchema])
def read_faculty_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    dept_id: Optional[int] = None,
    position: Optional[str] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all faculty members with optional filters"""
    query = db.query(Faculty)
    
    if dept_id:
        query = query.filter(Faculty.dept_id == dept_id)
    if position:
        query = query.filter(Faculty.position == position)
    if name:
        query = query.filter((Faculty.first_name.ilike(f"%{name}%")) | 
                            (Faculty.last_name.ilike(f"%{name}%")))
    
    faculty_members = query.offset(skip).limit(limit).all()
    return faculty_members

@router.get("/search", response_model=List[FacultySchema])
def search_faculty(
    name: Optional[str] = None,
    dept_id: Optional[int] = None,
    position: Optional[str] = None,
    research_interests: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search faculty with advanced filters"""
    query = db.query(Faculty)
    
    if name:
        query = query.filter((Faculty.first_name.ilike(f"%{name}%")) | 
                             (Faculty.last_name.ilike(f"%{name}%")))
    if dept_id:
        query = query.filter(Faculty.dept_id == dept_id)
    if position:
        query = query.filter(Faculty.position == position)
    if research_interests:
        query = query.filter(Faculty.research_interests.ilike(f"%{research_interests}%"))
    
    faculty_members = query.offset(skip).limit(limit).all()
    return faculty_members


@router.get("/{faculty_id}", response_model=FacultySchema)
def read_faculty(faculty_id: int, db: Session = Depends(get_db)):
    """Get a specific faculty member by ID"""
    db_faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    return db_faculty


@router.put("/{faculty_id}", response_model=FacultySchema)
def update_faculty(faculty_id: int, faculty: FacultyUpdate, db: Session = Depends(get_db)):
    """Update a faculty member"""
    db_faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    
    update_data = faculty.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_faculty, key, value)
    
    db.commit()
    db.refresh(db_faculty)
    return db_faculty


@router.delete("/{faculty_id}", response_model=FacultySchema)
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    """Delete a faculty member"""
    db_faculty = db.query(Faculty).filter(Faculty.faculty_id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    
    db.delete(db_faculty)
    db.commit()
    return db_faculty
