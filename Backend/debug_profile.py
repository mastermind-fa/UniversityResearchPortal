#!/usr/bin/env python3
"""
Debug script to test profile functionality
"""

import sys
import os

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.auth import User
from app.models.faculty import Faculty
from app.models.departments import Department

def debug_profile():
    """Debug the profile functionality."""
    db = SessionLocal()
    try:
        print("🔍 Debugging profile functionality...")
        
        # Get user with faculty_id = 1
        user = db.query(User).filter(User.faculty_id == 1).first()
        if user:
            print(f"✅ Found user: {user.email}, type: {user.user_type}")
            print(f"   faculty_id: {user.faculty_id}")
        else:
            print("❌ User not found")
            return
        
        # Get faculty record
        faculty = db.query(Faculty).filter(Faculty.faculty_id == 1).first()
        if faculty:
            print(f"✅ Found faculty: {faculty.first_name} {faculty.last_name}")
            print(f"   hire_date: {faculty.hire_date}, type: {type(faculty.hire_date)}")
            print(f"   dept_id: {faculty.dept_id}")
        else:
            print("❌ Faculty not found")
            return
        
        # Get department
        if faculty.dept_id:
            dept = db.query(Department).filter(Department.dept_id == faculty.dept_id).first()
            if dept:
                print(f"✅ Found department: {dept.dept_name}")
            else:
                print("❌ Department not found")
        
        # Test profile data construction
        profile_data = {
            "user_id": user.user_id,
            "email": user.email,
            "user_type": user.user_type,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        
        if user.user_type == "faculty" and user.faculty_id:
            profile_data.update({
                "first_name": faculty.first_name,
                "last_name": faculty.last_name,
                "phone": faculty.phone,
                "hire_date": faculty.hire_date,
                "position": faculty.position,
                "research_interests": faculty.research_interests,
                "dept_id": faculty.dept_id
            })
            if faculty.dept_id:
                dept = db.query(Department).filter(Department.dept_id == faculty.dept_id).first()
                if dept:
                    profile_data["dept_name"] = dept.dept_name
                    print(f"✅ Added dept_name: {dept.dept_name}")
        
        print(f"✅ Profile data constructed successfully:")
        for key, value in profile_data.items():
            print(f"   {key}: {value} (type: {type(value)})")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_profile()
