from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.students import Student
from app.models.faculty import Faculty
from app.schemas.students import StudentCreate, StudentUpdate, Student as StudentSchema

router = APIRouter(prefix="/students", tags=["students"])


@router.post("/", response_model=StudentSchema)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.get("/", response_model=List[StudentSchema])
def read_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    dept_id: Optional[int] = None,
    program_type: Optional[str] = None,
    advisor_id: Optional[int] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all students with optional filters"""
    query = db.query(Student)
    
    if dept_id:
        query = query.filter(Student.dept_id == dept_id)
    if program_type:
        query = query.filter(Student.program_type == program_type)
    if advisor_id:
        query = query.filter(Student.advisor_id == advisor_id)
    if name:
        query = query.filter((Student.first_name.ilike(f"%{name}%")) | 
                            (Student.last_name.ilike(f"%{name}%")))
    
    students = query.offset(skip).limit(limit).all()
    return students

@router.get("/by-advisor/{advisor_id}", response_model=List[StudentSchema])
def get_students_by_advisor(
    advisor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get students by advisor ID"""
    # Check if advisor exists
    advisor = db.query(Faculty).filter(Faculty.faculty_id == advisor_id).first()
    if not advisor:
        raise HTTPException(status_code=404, detail="Faculty advisor not found")
        
    students = db.query(Student).filter(Student.advisor_id == advisor_id).offset(skip).limit(limit).all()
    return students


@router.get("/{student_id}", response_model=StudentSchema)
def read_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student by ID"""
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return db_student


@router.put("/{student_id}", response_model=StudentSchema)
def update_student(student_id: int, student: StudentUpdate, db: Session = Depends(get_db)):
    """Update a student"""
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student


@router.delete("/{student_id}", response_model=StudentSchema)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Delete a student"""
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return db_student
