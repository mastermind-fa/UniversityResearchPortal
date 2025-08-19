from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base

class Project(Base):
    __tablename__ = "research_projects"

    project_id = Column(Integer, primary_key=True, index=True)
    project_title = Column(String(200), nullable=False)
    description = Column(String(1000))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    status = Column(String(20), default='Active')
    budget = Column(Float)
    principal_investigator_id = Column(Integer, ForeignKey("faculty.faculty_id"))
    dept_id = Column(Integer, ForeignKey("departments.dept_id"))

    # Relationships
    department = relationship("Department")
    principal_investigator = relationship("Faculty", foreign_keys=[principal_investigator_id])
    collaborators = relationship("ProjectCollaborator", back_populates="project")
    student_research = relationship("StudentResearch", back_populates="project")
    publications = relationship("Publication", back_populates="project")
    funding = relationship("ProjectFunding", back_populates="project")

    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('Active', 'Completed', 'On Hold', 'Cancelled')", name='check_status'),
        CheckConstraint('budget >= 0', name='check_budget'),
    )
