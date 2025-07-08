from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Table
from sqlalchemy.orm import relationship

from app.db.session import Base

# Association table for many-to-many relationship between projects and faculty
project_faculty = Table(
    "project_faculty",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.project_id"), primary_key=True),
    Column("faculty_id", Integer, ForeignKey("faculty.faculty_id"), primary_key=True)
)

# Association table for many-to-many relationship between projects and students
project_student = Table(
    "project_student",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.project_id"), primary_key=True),
    Column("student_id", Integer, ForeignKey("students.student_id"), primary_key=True)
)

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    budget = Column(Float)
    funding_source = Column(String(200))
    dept_id = Column(Integer, ForeignKey("departments.dept_id"))

    # Relationships
    department = relationship("Department")
    faculty_members = relationship("Faculty", secondary=project_faculty, backref="projects")
    students = relationship("Student", secondary=project_student, backref="projects")
