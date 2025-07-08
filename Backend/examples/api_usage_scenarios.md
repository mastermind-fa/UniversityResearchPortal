# University Research Portal API Usage Scenarios

This document demonstrates how the different API endpoints can be used together in common scenarios.

## Scenario 1: Department Overview

### Step 1: Get Department Details
```bash
curl -X 'GET' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "dept_id": 1,
  "dept_name": "Computer Science",
  "dept_head": "Dr. Alan Turing",
  "research_focus": "Artificial Intelligence, Machine Learning, Databases, Computer Networks",
  "established_year": 1970,
  "budget": 2500000.0
}
```

### Step 2: Get Department Analytics
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/department/1' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "department_name": "Computer Science",
  "faculty_count": 6,
  "faculty_positions_distribution": {
    "Professor": 2,
    "Associate Professor": 1,
    "Assistant Professor": 2,
    "Lecturer": 1
  },
  "student_count": 12,
  "student_program_distribution": {
    "Masters": 8,
    "PhD": 4
  },
  "project_count": 3,
  "active_projects": 2,
  "total_project_budget": 725000.0,
  "research_focus": "Artificial Intelligence, Machine Learning, Databases, Computer Networks",
  "established_year": 1970,
  "budget": 2500000.0
}
```

### Step 3: Get Faculty in Department
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty?dept_id=1' \
  -H 'accept: application/json'
```

### Step 4: Get Projects by Department
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/by-department/1' \
  -H 'accept: application/json'
```

## Scenario 2: Faculty Member Research Profile

### Step 1: Get Faculty Member Details
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/3' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "faculty_id": 3,
  "first_name": "Robert",
  "last_name": "Smith",
  "email": "robert.smith@university.edu",
  "phone": "555-287-6543",
  "hire_date": "2019-08-15",
  "position": "Associate Professor",
  "dept_id": 1,
  "salary": 110000.0,
  "research_interests": "Machine Learning, Computer Vision, Natural Language Processing"
}
```

### Step 2: Get Faculty Member's Advisees
```bash
curl -X 'GET' \
  'http://localhost:8000/students/by-advisor/3' \
  -H 'accept: application/json'
```

### Step 3: Get Projects Involving This Faculty Member
This would require a custom endpoint or filtering project data client-side.

## Scenario 3: Student Enrollment and Advisory

### Step 1: Create a New Student
```bash
curl -X 'POST' \
  'http://localhost:8000/students/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Emily",
  "last_name": "Johnson",
  "email": "emily.johnson@university.edu",
  "enrollment_date": "2025-09-01",
  "program_type": "PhD",
  "dept_id": 1,
  "advisor_id": 3
}'
```

**Response:**
```json
{
  "student_id": 31,
  "first_name": "Emily",
  "last_name": "Johnson",
  "email": "emily.johnson@university.edu",
  "enrollment_date": "2025-09-01",
  "program_type": "PhD",
  "dept_id": 1,
  "advisor_id": 3,
  "graduation_date": null
}
```

### Step 2: Assign Student to a Project
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/active' \
  -H 'accept: application/json'
```

Find an active project and then:

```bash
curl -X 'PUT' \
  'http://localhost:8000/projects/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "student_ids": [2, 5, 8, 31]
}'
```

## Scenario 4: Research Project Management

### Step 1: Create a New Project
```bash
curl -X 'POST' \
  'http://localhost:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Explainable AI for Healthcare Decision Support",
  "description": "Developing transparent machine learning models for clinical decision support systems",
  "start_date": "2025-08-01",
  "is_active": true,
  "budget": 320000.00,
  "funding_source": "National Institutes of Health",
  "dept_id": 1,
  "faculty_ids": [1, 3],
  "student_ids": [4, 9, 17]
}'
```

### Step 2: Find Faculty with Relevant Research Interests
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/search?research_interests=machine%20learning' \
  -H 'accept: application/json'
```

### Step 3: Add More Faculty to Project
```bash
curl -X 'PUT' \
  'http://localhost:8000/projects/11' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "faculty_ids": [1, 3, 7, 10]
}'
```

## Scenario 5: Department Budget Analysis

### Step 1: Get Department Details
```bash
curl -X 'GET' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json'
```

### Step 2: Get Faculty Salaries (Sum)
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty?dept_id=1' \
  -H 'accept: application/json'
```

(Sum the salaries client-side or implement a custom endpoint)

### Step 3: Get Project Budgets for Department
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/by-department/1' \
  -H 'accept: application/json'
```

### Step 4: Update Department Budget
```bash
curl -X 'PUT' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "budget": 2750000.00
}'
```

## Scenario 6: Dashboard and Reports Generation

### Step 1: Get Dashboard Overview
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/dashboard' \
  -H 'accept: application/json'
```

### Step 2: Get Faculty Reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty' \
  -H 'accept: application/json'
```

### Step 3: Get Project Reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects' \
  -H 'accept: application/json'
```

### Step 4: Get Publications Reports (Placeholder)
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/publications' \
  -H 'accept: application/json'
```
