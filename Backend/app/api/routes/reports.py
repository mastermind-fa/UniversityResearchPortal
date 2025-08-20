from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc, extract
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.departments import Department
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.projects import Project
from app.models.publications import Publication
from app.models.publication_authors import PublicationAuthor

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
def get_publication_reports(
    dept_id: int | None = None,
    year: int | None = None,
    publication_type: str | None = Query(None, alias="type"),
    db: Session = Depends(get_db)
):
    """Generate publications report with optional filters.

    Filters:
    - dept_id: Filter publications by department via linked project department
    - year: Filter by publication year
    - type: Filter by publication type (Journal Article, Conference Paper, etc.)
    """

    # Base query: publications, optionally joined to projects for department filtering
    pub_query = db.query(Publication).outerjoin(Project, Publication.project_id == Project.project_id)

    if dept_id:
        pub_query = pub_query.filter(Project.dept_id == dept_id)
    if year:
        pub_query = pub_query.filter(extract('year', Publication.publication_date) == year)
    if publication_type:
        pub_query = pub_query.filter(Publication.publication_type == publication_type)

    publications = pub_query.order_by(Publication.publication_date.desc()).all()

    # Build publications list with authors and project/department info
    publications_data: List[Dict[str, Any]] = []
    total_citations = 0

    for pub in publications:
        total_citations += pub.citation_count or 0

        # Authors ordered by author_order
        authors_rows = db.query(
            Faculty.faculty_id,
            Faculty.first_name,
            Faculty.last_name,
            PublicationAuthor.author_order,
            PublicationAuthor.is_corresponding
        ).join(
            PublicationAuthor, Faculty.faculty_id == PublicationAuthor.faculty_id
        ).filter(
            PublicationAuthor.publication_id == pub.publication_id
        ).order_by(
            PublicationAuthor.author_order
        ).all()

        authors = [
            {
                "faculty_id": row.faculty_id,
                "name": f"{row.first_name} {row.last_name}",
                "author_order": row.author_order,
                "is_corresponding": row.is_corresponding,
            }
            for row in authors_rows
        ]

        dept_name = None
        dept_id_value = None
        project_title = None
        if pub.project_id:
            proj = db.query(Project).filter(Project.project_id == pub.project_id).first()
            if proj:
                project_title = proj.project_title
                dept_id_value = proj.dept_id
                dept = db.query(Department).filter(Department.dept_id == proj.dept_id).first()
                if dept:
                    dept_name = dept.dept_name

        publications_data.append(
            {
                "publication_id": pub.publication_id,
                "title": pub.title,
                "publication_type": pub.publication_type,
                "journal_name": pub.journal_name,
                "publication_date": pub.publication_date,
                "doi": pub.doi,
                "citation_count": pub.citation_count,
                "project_id": pub.project_id,
                "project_title": project_title,
                "department_id": dept_id_value,
                "department_name": dept_name,
                "authors": authors,
            }
        )

    # Summary
    total_publications = len(publications_data)

    # Publications by type
    by_type_rows = pub_query.with_entities(
        Publication.publication_type, func.count(Publication.publication_id)
    ).group_by(Publication.publication_type).all()
    by_type: Dict[str, int] = {t: c for t, c in by_type_rows}

    # Publications by year
    by_year_rows = pub_query.with_entities(
        extract('year', Publication.publication_date).label('year'),
        func.count(Publication.publication_id)
    ).group_by(extract('year', Publication.publication_date)).order_by(extract('year', Publication.publication_date)).all()
    by_year: Dict[int, int] = {int(y): c for y, c in by_year_rows if y is not None}

    # Top authors (by number of publications and citations) within the filtered set
    author_base = db.query(
        PublicationAuthor.faculty_id,
        func.count(PublicationAuthor.publication_id).label("pub_count"),
        func.coalesce(func.sum(Publication.citation_count), 0).label("citations")
    ).join(
        Publication, Publication.publication_id == PublicationAuthor.publication_id
    ).outerjoin(
        Project, Publication.project_id == Project.project_id
    )

    if dept_id:
        author_base = author_base.filter(Project.dept_id == dept_id)
    if year:
        author_base = author_base.filter(extract('year', Publication.publication_date) == year)
    if publication_type:
        author_base = author_base.filter(Publication.publication_type == publication_type)

    author_rows = author_base.group_by(PublicationAuthor.faculty_id).order_by(desc("pub_count")).limit(10).all()

    top_authors: List[Dict[str, Any]] = []
    for row in author_rows:
        fac = db.query(Faculty).filter(Faculty.faculty_id == row.faculty_id).first()
        if fac:
            top_authors.append(
                {
                    "faculty_id": fac.faculty_id,
                    "name": f"{fac.first_name} {fac.last_name}",
                    "department_id": fac.dept_id,
                    "department_name": db.query(Department.dept_name).filter(Department.dept_id == fac.dept_id).scalar(),
                    "publications": row.pub_count,
                    "citations": int(row.citations or 0),
                }
            )

    # Publications by department (only when not filtering to a single department)
    by_department: Dict[int, Dict[str, Any]] | None = None
    if not dept_id:
        dept_rows = db.query(
            Project.dept_id,
            func.count(Publication.publication_id),
            func.coalesce(func.sum(Publication.citation_count), 0)
        ).join(Project, Publication.project_id == Project.project_id).group_by(Project.dept_id).all()

        by_department = {}
        for d_id, count, cites in dept_rows:
            name = db.query(Department.dept_name).filter(Department.dept_id == d_id).scalar()
            by_department[d_id] = {
                "department_name": name,
                "publication_count": count,
                "total_citations": int(cites or 0),
            }

    return {
        "filters": {
            "dept_id": dept_id,
            "year": year,
            "type": publication_type,
        },
        "summary": {
            "total_publications": total_publications,
            "total_citations": total_citations,
            "by_type": by_type,
            "by_year": by_year,
        },
        "top_authors": top_authors,
        "by_department": by_department,
        "publications": publications_data,
    }
