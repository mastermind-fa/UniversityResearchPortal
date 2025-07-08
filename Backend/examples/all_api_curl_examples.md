# Complete API Curl Examples

This file contains curl commands for all API endpoints in the University Research Portal.

## Departments API

### List all departments
```bash
curl -X 'GET' \
  'http://localhost:8000/departments' \
  -H 'accept: application/json'
```

### Get department by ID
```bash
curl -X 'GET' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json'
```

### Create new department
```bash
curl -X 'POST' \
  'http://localhost:8000/departments/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Biomedical Engineering",
  "dept_head": "Dr. Maria Rodriguez",
  "research_focus": "Medical Devices, Tissue Engineering, Biomechanics",
  "established_year": 2010,
  "budget": 1950000.00
}'
```

### Update department
```bash
curl -X 'PUT' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Computer Science and AI",
  "dept_head": "Dr. Alan Turing",
  "research_focus": "AI, Machine Learning, Cybersecurity, Data Science",
  "budget": 2800000.00
}'
```

### Delete department
```bash
curl -X 'DELETE' \
  'http://localhost:8000/departments/6' \
  -H 'accept: application/json'
```

## Faculty API

### List all faculty
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty' \
  -H 'accept: application/json'
```

### Get faculty by ID
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/1' \
  -H 'accept: application/json'
```

### Create new faculty
```bash
curl -X 'POST' \
  'http://localhost:8000/faculty/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Thomas",
  "last_name": "Anderson",
  "email": "thomas.anderson@university.edu",
  "phone": "555-765-4321",
  "hire_date": "2025-06-15",
  "position": "Assistant Professor",
  "dept_id": 1,
  "salary": 92000.00,
  "research_interests": "Artificial Intelligence, Neural Networks, Deep Learning"
}'
```

### Update faculty
```bash
curl -X 'PUT' \
  'http://localhost:8000/faculty/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "position": "Professor",
  "salary": 130000.00,
  "phone": "555-987-6543",
  "research_interests": "Machine Learning, Computer Vision, Robotics"
}'
```

### Delete faculty
```bash
curl -X 'DELETE' \
  'http://localhost:8000/faculty/15' \
  -H 'accept: application/json'
```

### Search faculty
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/search?research_interests=Machine%20Learning&position=Professor' \
  -H 'accept: application/json'
```

## Students API

### List all students
```bash
curl -X 'GET' \
  'http://localhost:8000/students' \
  -H 'accept: application/json'
```

### Get student by ID
```bash
curl -X 'GET' \
  'http://localhost:8000/students/1' \
  -H 'accept: application/json'
```

### Create new student
```bash
curl -X 'POST' \
  'http://localhost:8000/students/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Jessica",
  "last_name": "Williams",
  "email": "jessica.williams@university.edu",
  "enrollment_date": "2025-09-01",
  "program_type": "PhD",
  "dept_id": 2,
  "advisor_id": 4
}'
```

### Update student
```bash
curl -X 'PUT' \
  'http://localhost:8000/students/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "advisor_id": 5,
  "graduation_date": "2026-05-15"
}'
```

### Delete student
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

## Projects API

### List all projects
```bash
curl -X 'GET' \
  'http://localhost:8000/projects' \
  -H 'accept: application/json'
```

### Get project by ID
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/1' \
  -H 'accept: application/json'
```

### Create new project
```bash
curl -X 'POST' \
  'http://localhost:8000/projects/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Quantum Machine Learning Algorithms",
  "description": "Research on quantum computing applications in machine learning and AI",
  "start_date": "2025-09-01",
  "end_date": null,
  "is_active": true,
  "budget": 375000.00,
  "funding_source": "National Science Foundation",
  "dept_id": 2,
  "faculty_ids": [2, 4, 7],
  "student_ids": [3, 5, 8, 12]
}'
```

### Update project
```bash
curl -X 'PUT' \
  'http://localhost:8000/projects/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "title": "Advanced Machine Learning for Big Data Analytics",
  "description": "Updated project focus on big data applications",
  "budget": 325000.00,
  "faculty_ids": [1, 3, 5],
  "student_ids": [2, 5, 8, 11]
}'
```

### Delete project
```bash
curl -X 'DELETE' \
  'http://localhost:8000/projects/10' \
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

### Get department project reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects?dept_id=1' \
  -H 'accept: application/json'
```

### Get publications reports
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/publications' \
  -H 'accept: application/json'
```
