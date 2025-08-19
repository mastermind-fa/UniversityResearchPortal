from sqlalchemy import Column, Integer, String, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class ProjectCollaborator(Base):
    __tablename__ = "project_collaborators"
    
    project_id = Column(Integer, ForeignKey("research_projects.project_id"), primary_key=True)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), primary_key=True)
    role = Column(String(100), nullable=False)
    involvement_percentage = Column(Float, CheckConstraint("involvement_percentage >= 0 AND involvement_percentage <= 100"))
    
    # Relationships
    project = relationship("Project", back_populates="collaborators")
    faculty = relationship("Faculty")
