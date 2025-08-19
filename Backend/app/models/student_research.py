from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class StudentResearch(Base):
    __tablename__ = "student_research"
    
    student_id = Column(Integer, ForeignKey("students.student_id"), primary_key=True)
    project_id = Column(Integer, ForeignKey("research_projects.project_id"), primary_key=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    role = Column(String(100), nullable=False)
    
    # Relationships
    student = relationship("Student")
    project = relationship("Project", back_populates="student_research")
