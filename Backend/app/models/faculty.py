from sqlalchemy import Column, Integer, String, Float, CheckConstraint, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base

class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(15))
    hire_date = Column(Date, nullable=False)
    position = Column(String(50))
    dept_id = Column(Integer, ForeignKey("departments.dept_id"))
    salary = Column(Float)
    research_interests = Column(String(1000))

    # Relationships
    department = relationship("Department", back_populates="faculty")
    advisees = relationship("Student", back_populates="advisor")
    user_account = relationship("User", back_populates="faculty", uselist=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("position IN ('Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Adjunct')", name='check_position'),
        CheckConstraint('salary > 0', name='check_salary'),
    )
