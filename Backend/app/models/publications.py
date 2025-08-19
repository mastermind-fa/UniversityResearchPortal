from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Table, CheckConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base

class Publication(Base):
    __tablename__ = "publications"

    publication_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    publication_type = Column(String(50), nullable=False)
    journal_name = Column(String(200))
    publication_date = Column(Date, nullable=False)
    doi = Column(String(100), unique=True)
    citation_count = Column(Integer, default=0)
    project_id = Column(Integer, ForeignKey("research_projects.project_id"), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="publications")
    authors = relationship("PublicationAuthor", back_populates="publication")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("publication_type IN ('Journal Article', 'Conference Paper', 'Book Chapter', 'Book', 'Patent')", name='check_publication_type'),
        CheckConstraint("citation_count >= 0", name='check_citation_count'),
    )
