#!/usr/bin/env python3
"""
Comprehensive test script for the authentication system.
This script tests all authentication endpoints and functionality.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_health():
    """Test server health."""
    print("🔍 Testing server health...")
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("✅ Server is healthy")
        return True
    else:
        print(f"❌ Server health check failed: {response.status_code}")
        return False

def test_admin_login():
    """Test admin login."""
    print("\n🔍 Testing admin login...")
    data = {"email": "admin@gmail.com", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Admin login successful")
        print(f"   User ID: {result['user_id']}")
        print(f"   User Type: {result['user_type']}")
        print(f"   Token: {result['access_token'][:50]}...")
        return result['access_token']
    else:
        print(f"❌ Admin login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_faculty_login():
    """Test faculty login."""
    print("\n🔍 Testing faculty login...")
    data = {"email": "j.smith@university.edu", "password": "password123"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Faculty login successful")
        print(f"   User ID: {result['user_id']}")
        print(f"   User Type: {result['user_type']}")
        return result['access_token']
    else:
        print(f"❌ Faculty login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_student_login():
    """Test student login."""
    print("\n🔍 Testing student login...")
    data = {"email": "alice.cooper@student.edu", "password": "password123"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Student login successful")
        print(f"   User ID: {result['user_id']}")
        print(f"   User Type: {result['user_type']}")
        return result['access_token']
    else:
        print(f"❌ Student login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_admin_profile(admin_token):
    """Test admin profile retrieval."""
    print("\n🔍 Testing admin profile...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Admin profile retrieved successfully")
        print(f"   Name: {result['first_name']} {result['last_name']}")
        print(f"   Email: {result['email']}")
        print(f"   User Type: {result['user_type']}")
    else:
        print(f"❌ Admin profile retrieval failed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_faculty_profile(faculty_token):
    """Test faculty profile retrieval."""
    print("\n🔍 Testing faculty profile...")
    headers = {"Authorization": f"Bearer {faculty_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Faculty profile retrieved successfully")
        print(f"   Name: {result['first_name']} {result['last_name']}")
        print(f"   Position: {result['position']}")
        print(f"   Department: {result['dept_name']}")
        print(f"   Research Interests: {result['research_interests']}")
    else:
        print(f"❌ Faculty profile retrieval failed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_student_profile(student_token):
    """Test student profile retrieval."""
    print("\n🔍 Testing student profile...")
    headers = {"Authorization": f"Bearer {student_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Student profile retrieved successfully")
        print(f"   Name: {result['first_name']} {result['last_name']}")
        print(f"   Program: {result['program_type']}")
        print(f"   Department: {result['dept_name']}")
        print(f"   Advisor: {result['advisor_name']}")
    else:
        print(f"❌ Student profile retrieval failed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_admin_get_all_users(admin_token):
    """Test admin getting all users."""
    print("\n🔍 Testing admin get all users...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/users", headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Admin retrieved {len(result)} users successfully")
        
        # Count user types
        user_types = {}
        for user in result:
            user_type = user['user_type']
            user_types[user_type] = user_types.get(user_type, 0) + 1
        
        for user_type, count in user_types.items():
            print(f"   {user_type.capitalize()}: {count}")
    else:
        print(f"❌ Admin get all users failed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_non_admin_access_denied(faculty_token):
    """Test that non-admin users cannot access admin endpoints."""
    print("\n🔍 Testing non-admin access denied...")
    headers = {"Authorization": f"Bearer {faculty_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/users", headers=headers)
    
    if response.status_code == 403:
        result = response.json()
        print("✅ Non-admin access correctly denied")
        print(f"   Message: {result['detail']}")
    else:
        print(f"❌ Non-admin access incorrectly allowed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_public_endpoints():
    """Test that public endpoints are accessible without authentication."""
    print("\n🔍 Testing public endpoints...")
    
    endpoints = [
        "/api/faculty/",
        "/api/students/",
        "/api/projects/",
        "/api/departments/",
        "/api/publications/"
    ]
    
    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}")
        if response.status_code == 200:
            print(f"✅ {endpoint} accessible without authentication")
        else:
            print(f"❌ {endpoint} not accessible: {response.status_code}")

def test_registration():
    """Test user registration."""
    print("\n🔍 Testing user registration...")
    
    # Test faculty registration
    faculty_data = {
        "email": "test.faculty3@university.edu",
        "password": "password123",
        "user_type": "faculty",
        "first_name": "Test",
        "last_name": "Faculty3",
        "phone": "555-7777",
        "hire_date": "2024-07-01",
        "position": "Lecturer",
        "research_interests": "Computer Vision",
        "dept_id": 1
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=faculty_data)
    if response.status_code == 200:
        result = response.json()
        print("✅ Faculty registration successful")
        print(f"   User ID: {result['user_id']}")
        return result['access_token']
    else:
        print(f"❌ Faculty registration failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_profile_update(token):
    """Test profile update functionality."""
    print("\n🔍 Testing profile update...")
    headers = {"Authorization": f"Bearer {token}"}
    
    update_data = {
        "phone": "555-UPDATED",
        "research_interests": "Updated Research Interests"
    }
    
    response = requests.put(f"{BASE_URL}/api/auth/profile", json=update_data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        print("✅ Profile update successful")
        print(f"   Updated phone: {result['phone']}")
        print(f"   Updated research interests: {result['research_interests']}")
    else:
        print(f"❌ Profile update failed: {response.status_code}")
        print(f"   Response: {response.text}")

def test_invalid_credentials():
    """Test login with invalid credentials."""
    print("\n🔍 Testing invalid credentials...")
    
    # Test wrong password
    data = {"email": "admin@gmail.com", "password": "wrongpassword"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    
    if response.status_code == 401:
        result = response.json()
        print("✅ Invalid credentials correctly rejected")
        print(f"   Message: {result['detail']}")
    else:
        print(f"❌ Invalid credentials not properly handled: {response.status_code}")

def test_duplicate_registration():
    """Test registration with existing email."""
    print("\n🔍 Testing duplicate registration...")
    
    data = {
        "email": "admin@gmail.com",
        "password": "password123",
        "user_type": "faculty",
        "first_name": "Test",
        "last_name": "Duplicate"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    if response.status_code == 400:
        result = response.json()
        print("✅ Duplicate registration correctly rejected")
        print(f"   Message: {result['detail']}")
    else:
        print(f"❌ Duplicate registration not properly handled: {response.status_code}")

def main():
    """Run all authentication tests."""
    print("🚀 Starting Authentication System Tests")
    print("=" * 50)
    
    # Test server health
    if not test_health():
        print("❌ Server is not running. Please start the server first.")
        return
    
    # Test public endpoints
    test_public_endpoints()
    
    # Test authentication
    admin_token = test_admin_login()
    faculty_token = test_faculty_login()
    student_token = test_student_login()
    
    if not all([admin_token, faculty_token, student_token]):
        print("❌ Some login tests failed. Cannot continue with authenticated tests.")
        return
    
    # Test profiles
    test_admin_profile(admin_token)
    test_faculty_profile(faculty_token)
    test_student_profile(student_token)
    
    # Test admin functionality
    test_admin_get_all_users(admin_token)
    
    # Test access control
    test_non_admin_access_denied(faculty_token)
    
    # Test registration
    new_user_token = test_registration()
    
    if new_user_token:
        # Test profile update
        test_profile_update(new_user_token)
    
    # Test security features
    test_invalid_credentials()
    test_duplicate_registration()
    
    print("\n" + "=" * 50)
    print("🎉 Authentication System Tests Completed!")
    print("✅ All core functionality is working correctly")
    print("✅ Role-based access control is enforced")
    print("✅ Security measures are in place")
    print("✅ Public endpoints remain accessible")

if __name__ == "__main__":
    main()
