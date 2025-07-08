# Projects API Examples

## Get all projects
```bash
curl -X 'GET' \
  'http://localhost:8000/projects' \
  -H 'accept: application/json'
```

## Get active projects
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/active' \
  -H 'accept: application/json'
```

## Get projects by department
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/by-department/1' \
  -H 'accept: application/json'
```

## Sample Response for Active Projects
```json
[
  {
    "project_id": 1,
    "title": "Advanced Machine Learning Algorithms for Big Data",
    "description": "Description for project 1",
    "start_date": "2025-01-15",
    "end_date": null,
    "is_active": true,
    "budget": 275000.0,
    "funding_source": "NSF",
    "dept_id": 1,
    "faculty_members": [
      {
        "faculty_id": 1,
        "first_name": "Faculty1FirstName",
        "last_name": "Faculty1LastName"
      },
      {
        "faculty_id": 3,
        "first_name": "Faculty3FirstName",
        "last_name": "Faculty3LastName"
      }
    ],
    "students": [
      {
        "student_id": 2,
        "first_name": "Student2FirstName",
        "last_name": "Student2LastName"
      },
      {
        "student_id": 5,
        "first_name": "Student5FirstName",
        "last_name": "Student5LastName"
      },
      {
        "student_id": 8,
        "first_name": "Student8FirstName",
        "last_name": "Student8LastName"
      }
    ]
  },
  {
    "project_id": 3,
    "title": "Sustainable Energy Solutions for Urban Areas",
    "description": "Description for project 3",
    "start_date": "2024-10-01",
    "end_date": null,
    "is_active": true,
    "budget": 320000.0,
    "funding_source": "Corporate Sponsor",
    "dept_id": 5,
    "faculty_members": [
      {
        "faculty_id": 5,
        "first_name": "Faculty5FirstName",
        "last_name": "Faculty5LastName"
      }
    ],
    "students": [
      {
        "student_id": 7,
        "first_name": "Student7FirstName",
        "last_name": "Student7LastName"
      },
      {
        "student_id": 12,
        "first_name": "Student12FirstName",
        "last_name": "Student12LastName"
      },
      {
        "student_id": 18,
        "first_name": "Student18FirstName",
        "last_name": "Student18LastName"
      }
    ]
  }
]
```

## Sample Request for Creating a Project
```json
{
  "title": "Next-Generation Quantum Computing Architecture",
  "description": "Research on novel quantum computing architectures with improved error correction and scalability",
  "start_date": "2025-09-01",
  "end_date": null,
  "is_active": true,
  "budget": 450000.00,
  "funding_source": "Department of Defense",
  "dept_id": 2,
  "faculty_ids": [2, 4, 8],
  "student_ids": [3, 6, 9, 12]
}
```

## Sample Request for Updating a Project
```json
{
  "title": "Next-Generation Quantum Computing and Cryptography",
  "description": "Expanded research on quantum computing architectures with applications in cryptography",
  "budget": 520000.00,
  "faculty_ids": [2, 4, 8, 10],
  "student_ids": [3, 6, 9, 12, 15]
}
```
