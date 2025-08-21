#!/usr/bin/env python3
"""
Debug script to test get_all_users functionality
"""

import sys
import os

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.auth import User
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.departments import Department

def debug_get_all_users():
    """Debug the get_all_users functionality."""
    db = SessionLocal()
    try:
        print("🔍 Debugging get_all_users functionality...")
        
        users = db.query(User).all()
        print(f"✅ Found {len(users)} users")
        
        profiles = []
        
        for user in users:
            print(f"\n--- User {user.user_id}: {user.email} ({user.user_type}) ---")
            
            profile_data = {
                "user_id": user.user_id,
                "email": user.email,
                "user_type": user.user_type,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            
            if user.user_type == "faculty" and user.faculty_id:
                faculty = db.query(Faculty).filter(Faculty.faculty_id == user.faculty_id).first()
                if faculty:
                    print(f"   Faculty: {faculty.first_name} {faculty.last_name}")
                    print(f"   hire_date: {faculty.hire_date} (type: {type(faculty.hire_date)})")
                    
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
                            print(f"   Department: {dept.dept_name}")
            
            elif user.user_type == "student" and user.student_id:
                student = db.query(Student).filter(Student.student_id == user.student_id).first()
                if student:
                    print(f"   Student: {student.first_name} {student.last_name}")
                    print(f"   enrollment_date: {student.enrollment_date} (type: {type(student.enrollment_date)})")
                    
                    profile_data.update({
                        "first_name": student.first_name,
                        "last_name": student.last_name,
                        "enrollment_date": student.enrollment_date,
                        "program_type": student.program_type,
                        "dept_id": student.dept_id,
                        "advisor_id": student.advisor_id
                    })
                    
                    if student.dept_id:
                        dept = db.query(Department).filter(Department.dept_id == student.dept_id).first()
                        if dept:
                            print(f"   Department: {dept.dept_name}")
            
            elif user.user_type == "admin":
                print("   Admin user")
                profile_data.update({
                    "first_name": "Admin",
                    "last_name": "User"
                })
            
            # Test if we can create UserProfile from this data
            try:
                from app.schemas.auth import UserProfile
                profile = UserProfile(**profile_data)
                print(f"   ✅ Profile validation successful")
                profiles.append(profile)
            except Exception as e:
                print(f"   ❌ Profile validation failed: {e}")
                print(f"   Profile data: {profile_data}")
        
        print(f"\n✅ Successfully created {len(profiles)} profiles")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_get_all_users()
