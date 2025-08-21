from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    user_type = Column(String(20), nullable=False)  # 'admin', 'faculty', 'student'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys to link to faculty or student
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=True)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), nullable=True)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('student_id', name='uq_user_student'),
        UniqueConstraint('faculty_id', name='uq_user_faculty'),
    )
    
    # Relationships
    student = relationship("Student", back_populates="user_account", uselist=False)
    faculty = relationship("Faculty", back_populates="user_account", uselist=False)
