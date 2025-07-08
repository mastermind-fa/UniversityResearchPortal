from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.departments import Department
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.projects import Project

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Get overall statistics for dashboard"""
    # Count departments
    dept_count = db.query(func.count(Department.dept_id)).scalar()
    
    # Count faculty
    faculty_count = db.query(func.count(Faculty.faculty_id)).scalar()
    
    # Count students by program type
    student_counts = db.query(
        Student.program_type,
        func.count(Student.student_id)
    ).group_by(Student.program_type).all()
    student_by_program = {program: count for program, count in student_counts}
    total_students = sum(student_by_program.values())
    
    # Count active projects
    active_projects = db.query(func.count(Project.project_id)).filter(Project.is_active == True).scalar()
    
    # Total project budget
    total_budget = db.query(func.sum(Project.budget)).scalar() or 0
    
    # Department with most faculty
    dept_faculty_counts = db.query(
        Department.dept_name,
        func.count(Faculty.faculty_id).label("faculty_count")
    ).join(Faculty, Faculty.dept_id == Department.dept_id)\
     .group_by(Department.dept_id)\
     .order_by(desc("faculty_count"))\
     .first()
    
    top_dept = {"name": dept_faculty_counts[0], "faculty_count": dept_faculty_counts[1]} if dept_faculty_counts else None
    
    return {
        "departments_count": dept_count,
        "faculty_count": faculty_count,
        "student_count": total_students,
        "students_by_program": student_by_program,
        "active_projects": active_projects,
        "total_project_budget": total_budget,
        "department_with_most_faculty": top_dept
    }


@router.get("/department/{dept_id}")
def get_department_analytics(dept_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific department"""
    # Check if department exists
    department = db.query(Department).filter(Department.dept_id == dept_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Faculty count in department
    faculty_count = db.query(func.count(Faculty.faculty_id))\
        .filter(Faculty.dept_id == dept_id)\
        .scalar()
    
    # Faculty positions distribution
    faculty_positions = db.query(
        Faculty.position,
        func.count(Faculty.faculty_id).label("count")
    ).filter(Faculty.dept_id == dept_id)\
     .group_by(Faculty.position)\
     .all()
    positions_dist = {position: count for position, count in faculty_positions}
    
    # Student count in department
    student_count = db.query(func.count(Student.student_id))\
        .filter(Student.dept_id == dept_id)\
        .scalar()
    
    # Student program type distribution
    student_programs = db.query(
        Student.program_type,
        func.count(Student.student_id).label("count")
    ).filter(Student.dept_id == dept_id)\
     .group_by(Student.program_type)\
     .all()
    programs_dist = {program: count for program, count in student_programs}
    
    # Project count for department
    project_count = db.query(func.count(Project.project_id))\
        .filter(Project.dept_id == dept_id)\
        .scalar()
    
    # Active projects count
    active_project_count = db.query(func.count(Project.project_id))\
        .filter(Project.dept_id == dept_id, Project.is_active == True)\
        .scalar()
    
    # Total project budget
    total_budget = db.query(func.sum(Project.budget))\
        .filter(Project.dept_id == dept_id)\
        .scalar() or 0
    
    return {
        "department_name": department.dept_name,
        "faculty_count": faculty_count,
        "faculty_positions_distribution": positions_dist,
        "student_count": student_count,
        "student_program_distribution": programs_dist,
        "project_count": project_count,
        "active_projects": active_project_count,
        "total_project_budget": total_budget,
        "research_focus": department.research_focus,
        "established_year": department.established_year,
        "budget": department.budget
    }
