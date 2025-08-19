from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.departments import Department
from app.schemas.departments import DepartmentCreate, DepartmentUpdate, Department as DepartmentSchema

router = APIRouter(prefix="/departments", tags=["departments"])


@router.post("/", response_model=DepartmentSchema, status_code=201)
def create_department(department: DepartmentCreate, db: Session = Depends(get_db)):
    """Create a new department"""
    db_department = Department(**department.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


@router.get("/", response_model=List[DepartmentSchema])
def read_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    dept_name: Optional[str] = None,
    established_year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all departments with optional filters"""
    query = db.query(Department)
    
    if dept_name:
        query = query.filter(Department.dept_name.ilike(f"%{dept_name}%"))
    if established_year:
        query = query.filter(Department.established_year == established_year)
    
    departments = query.offset(skip).limit(limit).all()
    return departments


@router.get("/{dept_id}", response_model=DepartmentSchema)
def read_department(dept_id: int, db: Session = Depends(get_db)):
    """Get a specific department by ID"""
    db_department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_department


@router.put("/{dept_id}", response_model=DepartmentSchema)
def update_department(dept_id: int, department: DepartmentUpdate, db: Session = Depends(get_db)):
    """Update a department"""
    db_department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    update_data = department.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_department, key, value)
    
    db.commit()
    db.refresh(db_department)
    return db_department


@router.delete("/{dept_id}", response_model=DepartmentSchema)
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    """Delete a department"""
    db_department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(db_department)
    db.commit()
    return db_department
