from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./university_portal.db"

# Create engine with connection arguments suitable for SQLite
try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL query logging
    )
    print(f"✅ Database engine created successfully: {SQLALCHEMY_DATABASE_URL}")
except Exception as e:
    print(f"❌ Error creating database engine: {e}")
    raise

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to create all tables
def create_tables():
    try:
        from app.models import (
            departments, faculty, students, projects, 
            publications, funding, collaborators, student_research, auth
        )
        print("✅ All models imported successfully")
        
        # Check if tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"📊 Existing tables: {existing_tables}")
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully")
        
    except Exception as e:
        print(f"❌ Error in create_tables: {e}")
        import traceback
        traceback.print_exc()
        raise
