from sqlalchemy import Column, Integer, String, Float, CheckConstraint, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    enrollment_date = Column(Date, nullable=False)
    program_type = Column(String(20))
    dept_id = Column(Integer, ForeignKey("departments.dept_id"))
    advisor_id = Column(Integer, ForeignKey("faculty.faculty_id"))
    graduation_date = Column(Date)

    # Relationships
    department = relationship("Department", back_populates="students")
    advisor = relationship("Faculty", back_populates="advisees")
    user_account = relationship("User", back_populates="student", uselist=False)

    # Constraints
    __table_args__ = (
        CheckConstraint("program_type IN ('Masters', 'PhD')", name='check_program_type'),
    )
