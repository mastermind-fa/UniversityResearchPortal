from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from app.db.session import get_db
from app.core.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, require_admin, require_owner_or_admin
)
from app.schemas.auth import UserCreate, UserLogin, UserProfile, UserUpdate, Token
from app.models.auth import User
from app.models.faculty import Faculty
from app.models.students import Student
from app.models.departments import Department

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint."""
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email, "user_type": user.user_type, "user_id": user.user_id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user.user_type,
        "user_id": user.user_id,
        "email": user.email
    }

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate department exists
    if user_data.dept_id:
        dept = db.query(Department).filter(Department.dept_id == user_data.dept_id).first()
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department not found"
            )
    
    # Validate advisor exists for students
    if user_data.user_type == "student" and user_data.advisor_id:
        advisor = db.query(Faculty).filter(Faculty.faculty_id == user_data.advisor_id).first()
        if not advisor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Advisor not found"
            )
    
    try:
        # Create user account
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            user_type=user_data.user_type,
            is_active=True
        )
        db.add(user)
        db.flush()  # Get the user_id
        
        # Create faculty or student record
        if user_data.user_type == "faculty":
            # Convert hire_date string to date if needed
            hire_date = user_data.hire_date
            if isinstance(hire_date, str):
                from datetime import datetime
                try:
                    hire_date = datetime.strptime(hire_date, "%Y-%m-%d").date()
                except ValueError:
                    hire_date = date.today()
            
            faculty = Faculty(
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                email=user_data.email,
                phone=user_data.phone,
                hire_date=hire_date,
                position=user_data.position,
                dept_id=user_data.dept_id,
                research_interests=user_data.research_interests
            )
            db.add(faculty)
            db.flush()
            user.faculty_id = faculty.faculty_id
            
        elif user_data.user_type == "student":
            # Convert enrollment_date string to date if needed
            enrollment_date = user_data.enrollment_date
            if isinstance(enrollment_date, str):
                from datetime import datetime
                try:
                    enrollment_date = datetime.strptime(enrollment_date, "%Y-%m-%d").date()
                except ValueError:
                    enrollment_date = date.today()
            
            student = Student(
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                email=user_data.email,
                enrollment_date=enrollment_date,
                program_type=user_data.program_type,
                dept_id=user_data.dept_id,
                advisor_id=user_data.advisor_id
            )
            db.add(student)
            db.flush()
            user.student_id = student.student_id
        
        db.commit()
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.email, "user_type": user.user_type, "user_id": user.user_id},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_type": user.user_type,
            "user_id": user.user_id,
            "email": user.email
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's profile."""
    # Get profile information based on user type
    profile_data = {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "user_type": current_user.user_type,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }
    
    if current_user.user_type == "faculty" and current_user.faculty_id:
        faculty = db.query(Faculty).filter(Faculty.faculty_id == current_user.faculty_id).first()
        if faculty:
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
    
    elif current_user.user_type == "student" and current_user.student_id:
        student = db.query(Student).filter(Student.student_id == current_user.student_id).first()
        if student:
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
                    profile_data["dept_name"] = dept.dept_name
            if student.advisor_id:
                advisor = db.query(Faculty).filter(Faculty.faculty_id == student.advisor_id).first()
                if advisor:
                    profile_data["advisor_name"] = f"{advisor.first_name} {advisor.last_name}"
    
    elif current_user.user_type == "admin":
        profile_data.update({
            "first_name": "Admin",
            "last_name": "User"
        })
    
    return UserProfile(**profile_data)

@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    if current_user.user_type == "faculty" and current_user.faculty_id:
        faculty = db.query(Faculty).filter(Faculty.faculty_id == current_user.faculty_id).first()
        if faculty:
            for field, value in profile_update.dict(exclude_unset=True).items():
                if hasattr(faculty, field):
                    setattr(faculty, field, value)
            db.commit()
            db.refresh(faculty)
    
    elif current_user.user_type == "student" and current_user.student_id:
        student = db.query(Student).filter(Student.student_id == current_user.student_id).first()
        if student:
            for field, value in profile_update.dict(exclude_unset=True).items():
                if hasattr(student, field):
                    setattr(student, field, value)
            db.commit()
            db.refresh(student)
    
    # Return updated profile
    return await get_profile(current_user, db)

@router.get("/users", response_model=List[UserProfile])
async def get_all_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    profiles = []
    
    for user in users:
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
        
        elif user.user_type == "student" and user.student_id:
            student = db.query(Student).filter(Student.student_id == user.student_id).first()
            if student:
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
                        profile_data["dept_name"] = dept.dept_name
                if student.advisor_id:
                    advisor = db.query(Faculty).filter(Faculty.faculty_id == student.advisor_id).first()
                    if advisor:
                        profile_data["advisor_name"] = f"{advisor.first_name} {advisor.last_name}"
        
        elif user.user_type == "admin":
            profile_data.update({
                "first_name": "Admin",
                "last_name": "User"
            })
        
        # Handle orphaned users (users without corresponding faculty/student records)
        if "first_name" not in profile_data or "last_name" not in profile_data:
            profile_data.update({
                "first_name": "Unknown",
                "last_name": "User"
            })
        
        profiles.append(UserProfile(**profile_data))
    
    return profiles

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a user (admin only)."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.user_type == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete admin users"
        )
    
    try:
        db.delete(user)
        db.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )
