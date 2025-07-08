# University Research Portal API Examples

This file contains examples of API requests using curl for testing purposes.

## Departments API

### Get all departments
```bash
curl -X 'GET' \
  'http://localhost:8000/departments' \
  -H 'accept: application/json'
```

### Get a specific department
```bash
curl -X 'GET' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json'
```

### Create a new department
```bash
curl -X 'POST' \
  'http://localhost:8000/departments/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Data Science",
  "dept_head": "Dr. Jane Smith",
  "research_focus": "Big Data, Machine Learning, Data Visualization",
  "established_year": 2015,
  "budget": 1750000.50
}'
```

### Update a department
```bash
curl -X 'PUT' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Computer Science and Artificial Intelligence",
  "dept_head": "Dr. Alan Turing",
  "research_focus": "AI, ML, Databases, Networks, Cybersecurity",
  "established_year": 1970,
  "budget": 3000000.00
}'
```

### Delete a department
```bash
curl -X 'DELETE' \
  'http://localhost:8000/departments/6' \
  -H 'accept: application/json'
```

## Faculty API

### Get all faculty members
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty' \
  -H 'accept: application/json'
```

### Get faculty by department
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty?dept_id=1' \
  -H 'accept: application/json'
```

### Get faculty by position
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty?position=Professor' \
  -H 'accept: application/json'
```

### Get faculty by name search
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty?name=Smith' \
  -H 'accept: application/json'
```

### Get a specific faculty member
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/1' \
  -H 'accept: application/json'
```

### Create a new faculty member
```bash
curl -X 'POST' \
  'http://localhost:8000/faculty/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Richard",
  "last_name": "Rodriguez",
  "email": "richard.rodriguez@university.edu",
  "phone": "555-123-4567",
  "hire_date": "2023-03-15",
  "position": "Assistant Professor",
  "dept_id": 1,
  "salary": 95000,
  "research_interests": "Deep Learning, Neural Networks, Computer Vision"
}'
```

### Update a faculty member
```bash
curl -X 'PUT' \
  'http://localhost:8000/faculty/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "position": "Professor",
  "salary": 125000,
  "research_interests": "Updated research interests"
}'
```

### Delete a faculty member
```bash
curl -X 'DELETE' \
  'http://localhost:8000/faculty/15' \
  -H 'accept: application/json'
```

## Students API

### Get all students
```bash
curl -X 'GET' \
  'http://localhost:8000/students' \
  -H 'accept: application/json'
```

### Get students by department
```bash
curl -X 'GET' \
  'http://localhost:8000/students?dept_id=2' \
  -H 'accept: application/json'
```

### Get students by program type
```bash
curl -X 'GET' \
  'http://localhost:8000/students?program_type=PhD' \
  -H 'accept: application/json'
```

### Get students by advisor
```bash
curl -X 'GET' \
  'http://localhost:8000/students?advisor_id=3' \
  -H 'accept: application/json'
```

### Get a specific student
```bash
curl -X 'GET' \
  'http://localhost:8000/students/1' \
  -H 'accept: application/json'
```

### Create a new student
```bash
curl -X 'POST' \
  'http://localhost:8000/students/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Emily",
  "last_name": "Johnson",
  "email": "emily.johnson@university.edu",
  "enrollment_date": "2024-09-01",
  "program_type": "PhD",
  "dept_id": 1,
  "advisor_id": 3
}'
```

### Update a student
```bash
curl -X 'PUT' \
  'http://localhost:8000/students/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "graduation_date": "2025-05-15",
  "advisor_id": 5
}'
```

### Delete a student
```bash
curl -X 'DELETE' \
  'http://localhost:8000/students/30' \
  -H 'accept: application/json'
```

### Get students by advisor
```bash
curl -X 'GET' \
  'http://localhost:8000/students/by-advisor/3' \
  -H 'accept: application/json'
```

## Research Projects API

### Get all projects
```bash
curl -X 'GET' \
  'http://localhost:8000/projects' \
  -H 'accept: application/json'
```

### Get a specific project
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/1' \
  -H 'accept: application/json'
```

### Get active projects
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/active' \
  -H 'accept: application/json'
```

### Get projects by department
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/by-department/1' \
  -H 'accept: application/json'
```

### Create a new project
```bash
curl -X 'POST' \
  'http://localhost:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Advanced Neural Networks for Medical Imaging",
  "description": "Research project focused on developing neural network models for improving medical imaging diagnostics",
  "start_date": "2025-07-01",
  "is_active": true,
  "budget": 350000.00,
  "funding_source": "National Institutes of Health",
  "dept_id": 1,
  "faculty_ids": [1, 3, 5],
  "student_ids": [2, 4, 6, 8]
}'
```

### Update a project
```bash
curl -X 'PUT' \
  'http://localhost:8000/projects/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Updated Project Title",
  "budget": 425000.00,
  "is_active": true,
  "faculty_ids": [1, 3, 5, 7],
  "student_ids": [2, 4, 6, 8, 10]
}'
```

### Delete a project
```bash
curl -X 'DELETE' \
  'http://localhost:8000/projects/10' \
  -H 'accept: application/json'
```

## Analytics API

### Get dashboard statistics
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/dashboard' \
  -H 'accept: application/json'
```

### Get department analytics
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/department/1' \
  -H 'accept: application/json'
```

## Reports API

### Get faculty reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty' \
  -H 'accept: application/json'
```

### Get faculty reports by department
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty?dept_id=1' \
  -H 'accept: application/json'
```

### Get faculty reports by position
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty?position=Professor' \
  -H 'accept: application/json'
```

### Get project reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects' \
  -H 'accept: application/json'
```

### Get active project reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects?is_active=true' \
  -H 'accept: application/json'
```

### Get publications reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/publications' \
  -H 'accept: application/json'
```
