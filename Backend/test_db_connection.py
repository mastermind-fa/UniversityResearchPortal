#!/usr/bin/env python3
"""
Test database connection and basic queries
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import get_db, engine
from app.models import Department, Faculty, Project, Publication, ProjectFunding
from sqlalchemy import func

def test_database_connection():
    """Test basic database connection and queries"""
    try:
        print("🧪 Testing Database Connection...")
        
        # Test basic connection
        db = next(get_db())
        print("✅ Database connection successful")
        
        # Test basic counts
        dept_count = db.query(func.count(Department.dept_id)).scalar()
        print(f"📊 Departments: {dept_count}")
        
        faculty_count = db.query(func.count(Faculty.faculty_id)).scalar()
        print(f"📊 Faculty: {faculty_count}")
        
        project_count = db.query(func.count(Project.project_id)).scalar()
        print(f"📊 Projects: {project_count}")
        
        publication_count = db.query(func.count(Publication.publication_id)).scalar()
        print(f"📊 Publications: {publication_count}")
        
        # Test funding query specifically
        try:
            funding_sum = db.query(func.sum(ProjectFunding.amount)).scalar()
            print(f"💰 Total Funding: ${funding_sum or 0:,.2f}")
        except Exception as e:
            print(f"❌ Funding query failed: {e}")
        
        # Test active projects
        try:
            active_projects = db.query(func.count(Project.project_id)).filter(Project.status == 'Active').scalar()
            print(f"📊 Active Projects: {active_projects}")
        except Exception as e:
            print(f"❌ Active projects query failed: {e}")
        
        db.close()
        print("✅ All database tests passed!")
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database_connection()
