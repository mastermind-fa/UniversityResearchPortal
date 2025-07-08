"""
This script initializes the database with sample data.
Run this after setting up the application to have some initial data.
"""

import sys
import os
from datetime import date, timedelta
import random

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, create_tables
from app.models.departments import Department
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.projects import Project

# Create tables
create_tables()

# Sample data
departments = [
    {
        "dept_name": "Computer Science",
        "dept_head": "Dr. Alan Turing",
        "research_focus": "Artificial Intelligence, Machine Learning, Databases, Computer Networks",
        "established_year": 1970,
        "budget": 2500000.00
    },
    {
        "dept_name": "Mathematics",
        "dept_head": "Dr. Katherine Johnson",
        "research_focus": "Number Theory, Applied Mathematics, Statistics",
        "established_year": 1930,
        "budget": 1800000.00
    },
    {
        "dept_name": "Physics",
        "dept_head": "Dr. Richard Feynman",
        "research_focus": "Quantum Physics, Theoretical Physics, Astronomy",
        "established_year": 1925,
        "budget": 3000000.00
    },
    {
        "dept_name": "Chemistry",
        "dept_head": "Dr. Marie Curie",
        "research_focus": "Organic Chemistry, Biochemistry",
        "established_year": 1935,
        "budget": 2200000.00
    },
    {
        "dept_name": "Electrical Engineering",
        "dept_head": "Dr. Nikola Tesla",
        "research_focus": "Power Systems, Electronics, Control Systems",
        "established_year": 1945,
        "budget": 2800000.00
    }
]

faculty_positions = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Adjunct"]

def add_sample_data():
    db = SessionLocal()
    try:
        # Check if we already have data
        existing_departments = db.query(Department).count()
        if existing_departments > 0:
            print("Database already contains data. Skipping initialization.")
            return
            
        # Add departments
        db_departments = []
        for dept_data in departments:
            department = Department(**dept_data)
            db.add(department)
            db_departments.append(department)
        
        db.commit()
        for dept in db_departments:
            db.refresh(dept)
            
        # Add faculty members
        faculty_members = []
        for i in range(1, 16):
            dept_index = random.randint(0, len(db_departments) - 1)
            hire_date = date.today() - timedelta(days=random.randint(365, 7300))  # Between 1 and 20 years ago
            
            faculty = Faculty(
                first_name=f"Faculty{i}FirstName",
                last_name=f"Faculty{i}LastName",
                email=f"faculty{i}@university.edu",
                phone=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                hire_date=hire_date,
                position=faculty_positions[random.randint(0, len(faculty_positions) - 1)],
                dept_id=db_departments[dept_index].dept_id,
                salary=80000 + random.randint(0, 120000),
                research_interests="Research interests for faculty member " + str(i)
            )
            db.add(faculty)
            faculty_members.append(faculty)
        
        db.commit()
        for faculty in faculty_members:
            db.refresh(faculty)
        
        # Add students
        program_types = ["Masters", "PhD"]
        for i in range(1, 31):
            dept_index = random.randint(0, len(db_departments) - 1)
            faculty_index = random.randint(0, len(faculty_members) - 1)
            enrollment_date = date.today() - timedelta(days=random.randint(30, 1460))  # Between 1 month and 4 years ago
            
            # Some students have graduated, some haven't
            graduation_date = None
            if random.random() > 0.7:  # 30% of students have graduated
                graduation_date = enrollment_date + timedelta(days=random.randint(730, 1460))  # 2-4 years after enrollment
            
            student = Student(
                first_name=f"Student{i}FirstName",
                last_name=f"Student{i}LastName",
                email=f"student{i}@university.edu",
                enrollment_date=enrollment_date,
                program_type=program_types[random.randint(0, len(program_types) - 1)],
                dept_id=db_departments[dept_index].dept_id,
                advisor_id=faculty_members[faculty_index].faculty_id,
                graduation_date=graduation_date
            )
            db.add(student)
        
        # Add research projects
        funding_sources = ["NSF", "NIH", "DOD", "University Grant", "Corporate Sponsor", "Private Donor"]
        project_titles = [
            "Advanced Machine Learning Algorithms for Big Data",
            "Quantum Computing Applications in Cryptography",
            "Sustainable Energy Solutions for Urban Areas",
            "Novel Approaches to Cancer Treatment",
            "Smart City Infrastructure and IoT",
            "Secure Blockchain Technologies for Financial Systems",
            "Climate Change Modeling and Prediction",
            "Artificial Intelligence in Healthcare",
            "Robotics for Assistive Technologies",
            "Advanced Materials for Space Exploration"
        ]
        
        for i in range(1, 11):
            dept_index = random.randint(0, len(db_departments) - 1)
            start_date = date.today() - timedelta(days=random.randint(30, 730))
            
            # 70% of projects are active
            is_active = random.random() > 0.3
            end_date = None
            if not is_active:
                end_date = start_date + timedelta(days=random.randint(180, 730))
            
            project = Project(
                title=project_titles[i-1],
                description=f"Description for project {i}",
                start_date=start_date,
                end_date=end_date,
                is_active=is_active,
                budget=50000 + random.randint(0, 450000),
                funding_source=funding_sources[random.randint(0, len(funding_sources) - 1)],
                dept_id=db_departments[dept_index].dept_id
            )
            db.add(project)
        
        db.commit()
        db.flush()
        
        # Add faculty and students to projects
        projects = db.query(Project).all()
        faculty_members = db.query(Faculty).all()
        students = db.query(Student).all()
        
        for project in projects:
            # Add 1-3 faculty members to each project
            num_faculty = random.randint(1, 3)
            selected_faculty = random.sample(faculty_members, min(num_faculty, len(faculty_members)))
            project.faculty_members.extend(selected_faculty)
            
            # Add 2-5 students to each project
            num_students = random.randint(2, 5)
            selected_students = random.sample(students, min(num_students, len(students)))
            project.students.extend(selected_students)
        
        db.commit()
        print("Sample data has been added successfully!")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
