from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class PublicationAuthor(Base):
    __tablename__ = "publication_authors"
    
    publication_id = Column(Integer, ForeignKey("publications.publication_id"), primary_key=True)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"), primary_key=True)
    author_order = Column(Integer, CheckConstraint("author_order > 0"), nullable=False)
    is_corresponding = Column(String(1), default='N')  # 'Y' or 'N' to match data
    
    # Relationships
    publication = relationship("Publication", back_populates="authors")
    faculty = relationship("Faculty")
