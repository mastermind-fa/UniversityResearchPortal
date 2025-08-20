from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.departments import Department
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.projects import Project
from app.models.publications import Publication
from app.models.funding import ProjectFunding

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Get overall statistics for dashboard"""
    try:
        print("🔄 Starting dashboard statistics calculation...")
        
        # Count departments
        dept_count = db.query(func.count(Department.dept_id)).scalar()
        print(f"📊 Departments count: {dept_count}")
        
        # Count faculty
        faculty_count = db.query(func.count(Faculty.faculty_id)).scalar()
        print(f"📊 Faculty count: {faculty_count}")
        
        # Count students by program type
        student_counts = db.query(
            Student.program_type,
            func.count(Student.student_id)
        ).group_by(Student.program_type).all()
        student_by_program = {program: count for program, count in student_counts}
        total_students = sum(student_by_program.values())
        print(f"📊 Students count: {total_students}")
        
        # Count active projects
        active_projects = db.query(func.count(Project.project_id)).filter(Project.status == 'Active').scalar()
        print(f"📊 Active projects count: {active_projects}")
        
        # Total project budget
        total_project_budget = db.query(func.sum(Project.budget)).scalar() or 0
        print(f"💰 Project budget total: ${total_project_budget:,.2f}")
        
        # Total funding from funding sources (more accurate)
        total_funding = db.query(func.sum(ProjectFunding.amount)).scalar() or 0
        print(f"💰 Funding sources total: ${total_funding:,.2f}")
        
        # Use the higher of the two values for total funding
        total_budget = max(total_project_budget, total_funding)
        print(f"💰 Total budget: ${total_budget:,.2f}")
        
        # Count total publications
        total_publications = db.query(func.count(Publication.publication_id)).scalar()
        print(f"📚 Publications count: {total_publications}")
        
        # Department with most faculty
        dept_faculty_counts = db.query(
            Department.dept_name,
            func.count(Faculty.faculty_id).label("faculty_count")
        ).join(Faculty, Faculty.dept_id == Department.dept_id)\
         .group_by(Department.dept_id)\
         .order_by(desc("faculty_count"))\
         .first()
        
        top_dept = {"name": dept_faculty_counts[0], "faculty_count": dept_faculty_counts[1]} if dept_faculty_counts else None
        print(f"🏆 Top department: {top_dept}")
        
        result = {
            "departments_count": dept_count,
            "faculty_count": faculty_count,
            "student_count": total_students,
            "students_by_program": student_by_program,
            "active_projects": active_projects,
            "total_project_budget": total_project_budget,
            "total_funding": total_funding,
            "total_budget": total_budget,
            "total_publications": total_publications,
            "department_with_most_faculty": top_dept
        }
        
        print("✅ Dashboard statistics calculated successfully")
        return result
        
    except Exception as e:
        print(f"❌ Error in dashboard statistics: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error calculating dashboard statistics: {str(e)}")


@router.get("/publications-by-department")
def get_publications_by_department(db: Session = Depends(get_db)):
    """Get publications count by department"""
    try:
        print("🔄 Getting publications by department...")
        
        # Get publications with their project departments
        publications_by_dept = db.query(
            Department.dept_name,
            func.count(Publication.publication_id).label("publication_count")
        ).outerjoin(
            Project, Publication.project_id == Project.project_id
        ).outerjoin(
            Department, Project.dept_id == Department.dept_id
        ).group_by(
            Department.dept_name
        ).all()
        
        # Also get publications without projects (count them as "General")
        publications_without_project = db.query(
            func.count(Publication.publication_id)
        ).filter(
            Publication.project_id.is_(None)
        ).scalar() or 0
        
        result = {}
        
        # Add department publications
        for dept_name, count in publications_by_dept:
            if dept_name:  # Only add if department name exists
                result[dept_name] = count
        
        # Add publications without projects
        if publications_without_project > 0:
            result["General"] = publications_without_project
        
        print(f"✅ Publications by department: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Error getting publications by department: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting publications by department: {str(e)}")


@router.get("/funding-trends")
def get_funding_trends(db: Session = Depends(get_db)):
    """Get funding trends by year for dashboard chart"""
    try:
        print("🔄 Getting funding trends...")
        
        # Get funding by year from projects
        funding_by_year = db.query(
            func.extract('year', Project.start_date).label('year'),
            func.sum(Project.budget).label("total_budget")
        ).filter(
            Project.budget.isnot(None),
            Project.start_date.isnot(None)
        ).group_by(
            func.extract('year', Project.start_date)
        ).order_by(
            func.extract('year', Project.start_date)
        ).all()
        
        # Also get funding by year from funding sources
        funding_sources_by_year = db.query(
            func.extract('year', ProjectFunding.start_date).label('year'),
            func.sum(ProjectFunding.amount).label("total_amount")
        ).filter(
            ProjectFunding.amount.isnot(None),
            ProjectFunding.start_date.isnot(None)
        ).group_by(
            func.extract('year', ProjectFunding.start_date)
        ).order_by(
            func.extract('year', ProjectFunding.start_date)
        ).all()
        
        # Combine both sources
        combined_funding = {}
        
        # Add project budgets
        for year, budget in funding_by_year:
            if year is not None:
                year_int = int(year)
                combined_funding[year_int] = combined_funding.get(year_int, 0) + (budget or 0)
        
        # Add funding source amounts
        for year, amount in funding_sources_by_year:
            if year is not None:
                year_int = int(year)
                combined_funding[year_int] = combined_funding.get(year_int, 0) + (amount or 0)
        
        # Sort by year
        sorted_funding = dict(sorted(combined_funding.items()))
        
        print(f"✅ Funding trends: {sorted_funding}")
        return sorted_funding
        
    except Exception as e:
        print(f"❌ Error getting funding trends: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error getting funding trends: {str(e)}")


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
        .filter(Project.dept_id == dept_id, Project.status == 'Active')\
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
