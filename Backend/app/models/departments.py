from sqlalchemy import Column, Integer, String, Float, CheckConstraint, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base

class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(100), nullable=False, unique=True, index=True)
    dept_head = Column(String(100))
    research_focus = Column(String(500))
    established_year = Column(Integer)
    budget = Column(Float)

    # Relationships
    faculty = relationship("Faculty", back_populates="department")
    students = relationship("Student", back_populates="department")

    # Constraints
    __table_args__ = (
        CheckConstraint('established_year >= 1900', name='check_established_year'),
        CheckConstraint('budget >= 0', name='check_budget'),
    )
