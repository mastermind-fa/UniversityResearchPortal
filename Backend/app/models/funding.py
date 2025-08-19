from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base

class FundingSource(Base):
    __tablename__ = "funding_sources"

    funding_id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(200), nullable=False)
    source_type = Column(String(50), nullable=False)
    contact_info = Column(Text)
    
    # Relationships
    project_funding = relationship("ProjectFunding", back_populates="funding_source")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("source_type IN ('Government', 'Private', 'University', 'International')", name='check_source_type'),
    )

class ProjectFunding(Base):
    __tablename__ = "project_funding"

    project_id = Column(Integer, ForeignKey("research_projects.project_id"), nullable=False, primary_key=True)
    funding_id = Column(Integer, ForeignKey("funding_sources.funding_id"), nullable=False, primary_key=True)
    amount = Column(Float, CheckConstraint("amount > 0"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    grant_number = Column(String(100))
    
    # Relationships
    project = relationship("Project", back_populates="funding")
    funding_source = relationship("FundingSource", back_populates="project_funding")
