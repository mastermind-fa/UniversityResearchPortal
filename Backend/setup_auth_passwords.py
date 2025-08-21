#!/usr/bin/env python3
"""
Script to set up authentication passwords for all existing users.
This script will:
1. Update all existing faculty and students to have password "password123"
2. Create admin user with admin@gmail.com and password "admin123"
3. Ensure all users are properly linked in the users table
"""

import sys
import os
from datetime import date

# Add the current directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, create_tables
from app.models.auth import User
from app.models.faculty import Faculty
from app.models.students import Student
from app.core.auth import get_password_hash

def setup_auth_passwords():
    """Set up authentication passwords for all users."""
    db = SessionLocal()
    try:
        print("🔐 Setting up authentication passwords...")
        
        # Create tables if they don't exist
        create_tables()
        
        # Get all faculty members
        faculty_members = db.query(Faculty).all()
        print(f"📚 Found {len(faculty_members)} faculty members")
        
        # Get all students
        students = db.query(Student).all()
        print(f"🎓 Found {len(students)} students")
        
        # Update or create user accounts for faculty
        for faculty in faculty_members:
            # Check if user account exists
            user = db.query(User).filter(User.faculty_id == faculty.faculty_id).first()
            
            if user:
                # Update password if needed
                if not user.hashed_password or not user.hashed_password.startswith('$2b$'):
                    user.hashed_password = get_password_hash("password123")
                    print(f"✅ Updated password for faculty: {faculty.email}")
            else:
                # Create new user account
                user = User(
                    email=faculty.email,
                    hashed_password=get_password_hash("password123"),
                    user_type="faculty",
                    is_active=True,
                    faculty_id=faculty.faculty_id
                )
                db.add(user)
                print(f"✅ Created user account for faculty: {faculty.email}")
        
        # Update or create user accounts for students
        for student in students:
            # Check if user account exists
            user = db.query(User).filter(User.student_id == student.student_id).first()
            
            if user:
                # Update password if needed
                if not user.hashed_password or not user.hashed_password.startswith('$2b$'):
                    user.hashed_password = get_password_hash("password123")
                    print(f"✅ Updated password for student: {student.email}")
            else:
                # Create new user account
                user = User(
                    email=student.email,
                    hashed_password=get_password_hash("password123"),
                    user_type="student",
                    is_active=True,
                    student_id=student.student_id
                )
                db.add(user)
                print(f"✅ Created user account for student: {student.email}")
        
        # Create admin user if it doesn't exist
        admin_user = db.query(User).filter(User.email == "admin@gmail.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@gmail.com",
                hashed_password=get_password_hash("admin123"),
                user_type="admin",
                is_active=True
            )
            db.add(admin_user)
            print("✅ Created admin user: admin@gmail.com")
        else:
            # Update admin password
            admin_user.hashed_password = get_password_hash("admin123")
            print("✅ Updated admin password")
        
        # Commit all changes
        db.commit()
        print("🎉 All authentication passwords have been set up successfully!")
        
        # Print summary
        total_users = db.query(User).count()
        faculty_users = db.query(User).filter(User.user_type == "faculty").count()
        student_users = db.query(User).filter(User.user_type == "student").count()
        admin_users = db.query(User).filter(User.user_type == "admin").count()
        
        print(f"\n📊 User Summary:")
        print(f"   Total users: {total_users}")
        print(f"   Faculty users: {faculty_users}")
        print(f"   Student users: {student_users}")
        print(f"   Admin users: {admin_users}")
        
        print(f"\n🔑 Default Passwords:")
        print(f"   Faculty/Students: password123")
        print(f"   Admin: admin123")
        
    except Exception as e:
        print(f"❌ Error setting up authentication: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    setup_auth_passwords()
