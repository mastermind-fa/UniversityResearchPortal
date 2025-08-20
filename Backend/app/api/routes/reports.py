from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.departments import Department
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.projects import Project

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/faculty")
def get_faculty_reports(
    dept_id: int = None,
    position: str = None,
    db: Session = Depends(get_db)
):
    """Generate faculty reports with optional filters"""
    query = db.query(Faculty)
    
    if dept_id:
        query = query.filter(Faculty.dept_id == dept_id)
    if position:
        query = query.filter(Faculty.position == position)
    
    # Eager load department and student (advisee) relationships
    query = query.options(
        joinedload(Faculty.department),
        joinedload(Faculty.advisees)
    )
    
    faculty_list = query.all()
    
    result = []
    for faculty in faculty_list:
        # Count advisees
        advisee_count = len(faculty.advisees)
        
        faculty_data = {
            "faculty_id": faculty.faculty_id,
            "name": f"{faculty.first_name} {faculty.last_name}",
            "email": faculty.email,
            "position": faculty.position,
            "department": faculty.department.dept_name if faculty.department else None,
            "hire_date": faculty.hire_date,
            "research_interests": faculty.research_interests,
            "advisee_count": advisee_count
        }
        result.append(faculty_data)
    
    # Summary statistics
    summary = {
        "total_faculty": len(result),
        "position_distribution": {}
    }
    
    # Calculate position distribution
    for f in result:
        pos = f["position"]
        if pos in summary["position_distribution"]:
            summary["position_distribution"][pos] += 1
        else:
            summary["position_distribution"][pos] = 1
    
    return {
        "summary": summary,
        "faculty": result
    }


@router.get("/projects")
def get_project_reports(
    dept_id: int = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Generate project reports with optional filters"""
    query = db.query(Project)
    
    if dept_id:
        query = query.filter(Project.dept_id == dept_id)
    if status:
        query = query.filter(Project.status == status)
    
    # Get projects
    projects = query.all()
    
    result = []
    for project in projects:
        project_data = {
            "project_id": project.project_id,
            "title": project.project_title,
            "description": project.description,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "status": project.status,
            "budget": project.budget
        }
        result.append(project_data)
    
    # Summary statistics
    total_budget = sum(p.budget or 0 for p in projects)
    active_count = sum(1 for p in projects if p.status == 'Active')
    
    summary = {
        "total_projects": len(projects),
        "active_projects": active_count,
        "completed_projects": len(projects) - active_count,
        "total_budget": total_budget,
        "avg_budget": total_budget / len(projects) if projects else 0
    }
    
    return {
        "summary": summary,
        "projects": result
    }


@router.get("/publications")
def get_publication_reports(db: Session = Depends(get_db)):
    """
    This is a placeholder for publications report.
    In a real implementation, you would have a publications model and generate reports from it.
    """
    # In a real implementation, you would fetch publications data from a database
    # Since we don't have a publications model in this example, we'll return a placeholder
    
    return {
        "message": "Publications reporting API",
        "note": "This is a placeholder. In a real implementation, this endpoint would return publication statistics and data."
    }
