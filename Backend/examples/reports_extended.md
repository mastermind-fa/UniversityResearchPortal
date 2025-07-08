# Reports API Examples

## Faculty Reports

### Request - All Faculty
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty' \
  -H 'accept: application/json'
```

### Request - Faculty by Department
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty?dept_id=1' \
  -H 'accept: application/json'
```

### Request - Faculty by Position
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/faculty?position=Professor' \
  -H 'accept: application/json'
```

### Response - Faculty Report
```json
{
  "summary": {
    "total_faculty": 15,
    "position_distribution": {
      "Professor": 5,
      "Associate Professor": 4,
      "Assistant Professor": 3,
      "Lecturer": 2,
      "Adjunct": 1
    }
  },
  "faculty": [
    {
      "faculty_id": 1,
      "name": "Faculty1FirstName Faculty1LastName",
      "email": "faculty1@university.edu",
      "position": "Associate Professor",
      "department": "Computer Science",
      "hire_date": "2018-07-12",
      "research_interests": "Research interests for faculty member 1",
      "project_count": 2,
      "active_projects": 1,
      "advisee_count": 3
    },
    {
      "faculty_id": 2,
      "name": "Faculty2FirstName Faculty2LastName",
      "email": "faculty2@university.edu",
      "position": "Professor",
      "department": "Physics",
      "hire_date": "2015-09-01",
      "research_interests": "Research interests for faculty member 2",
      "project_count": 3,
      "active_projects": 2,
      "advisee_count": 5
    },
    {
      "faculty_id": 3,
      "name": "Faculty3FirstName Faculty3LastName",
      "email": "faculty3@university.edu",
      "position": "Assistant Professor",
      "department": "Computer Science",
      "hire_date": "2020-01-15",
      "research_interests": "Research interests for faculty member 3",
      "project_count": 1,
      "active_projects": 1,
      "advisee_count": 2
    }
  ]
}
```

## Project Reports

### Request - All Projects
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects' \
  -H 'accept: application/json'
```

### Request - Active Projects
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects?is_active=true' \
  -H 'accept: application/json'
```

### Request - Projects by Department
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/projects?dept_id=1' \
  -H 'accept: application/json'
```

### Response - Project Report
```json
{
  "summary": {
    "total_projects": 10,
    "active_projects": 7,
    "completed_projects": 3,
    "total_budget": 2150000.0,
    "avg_budget": 215000.0
  },
  "projects": [
    {
      "project_id": 1,
      "title": "Advanced Machine Learning Algorithms for Big Data",
      "description": "Description for project 1",
      "department": "Computer Science",
      "start_date": "2025-01-15",
      "end_date": null,
      "is_active": true,
      "budget": 275000.0,
      "funding_source": "NSF",
      "faculty_count": 2,
      "student_count": 3,
      "faculty": [
        {
          "id": 1,
          "name": "Faculty1FirstName Faculty1LastName"
        },
        {
          "id": 3,
          "name": "Faculty3FirstName Faculty3LastName"
        }
      ],
      "students": [
        {
          "id": 2,
          "name": "Student2FirstName Student2LastName"
        },
        {
          "id": 5,
          "name": "Student5FirstName Student5LastName"
        },
        {
          "id": 8,
          "name": "Student8FirstName Student8LastName"
        }
      ]
    },
    {
      "project_id": 2,
      "title": "Quantum Computing Applications in Cryptography",
      "description": "Description for project 2",
      "department": "Physics",
      "start_date": "2024-11-03",
      "end_date": "2025-05-15",
      "is_active": false,
      "budget": 190000.0,
      "funding_source": "DOD",
      "faculty_count": 1,
      "student_count": 2,
      "faculty": [
        {
          "id": 2,
          "name": "Faculty2FirstName Faculty2LastName"
        }
      ],
      "students": [
        {
          "id": 1,
          "name": "Student1FirstName Student1LastName"
        },
        {
          "id": 3,
          "name": "Student3FirstName Student3LastName"
        }
      ]
    }
  ]
}
```

## Publications Report

### Request
```bash
curl -X 'GET' \
  'http://localhost:8000/reports/publications' \
  -H 'accept: application/json'
```

### Response
```json
{
  "message": "Publications reporting API",
  "note": "This is a placeholder. In a real implementation, this endpoint would return publication statistics and data."
}
```

### Example of what a real Publications Report might look like
```json
{
  "summary": {
    "total_publications": 45,
    "publications_by_year": {
      "2025": 8,
      "2024": 15,
      "2023": 12,
      "2022": 10
    },
    "publications_by_type": {
      "Journal": 25,
      "Conference": 15,
      "Book Chapter": 5
    },
    "top_journals": [
      "Nature", 
      "Science", 
      "IEEE Transactions"
    ],
    "departments_with_most_publications": [
      {
        "department": "Computer Science",
        "count": 18
      },
      {
        "department": "Physics",
        "count": 12
      },
      {
        "department": "Electrical Engineering",
        "count": 8
      }
    ]
  },
  "publications": [
    {
      "id": 1,
      "title": "Advanced Neural Networks for Climate Prediction",
      "authors": [
        {
          "id": 1,
          "name": "Faculty1FirstName Faculty1LastName"
        },
        {
          "id": 3,
          "name": "Faculty3FirstName Faculty3LastName"
        },
        {
          "student_id": 2,
          "name": "Student2FirstName Student2LastName"
        }
      ],
      "publication_type": "Journal",
      "journal": "Nature",
      "year": 2025,
      "volume": "587",
      "issue": "7832",
      "pages": "123-135",
      "doi": "10.1038/s41586-025-1234-5",
      "citations": 12,
      "department": "Computer Science",
      "project_id": 1
    },
    {
      "id": 2,
      "title": "Quantum Computing: A New Paradigm for Cryptography",
      "authors": [
        {
          "id": 2,
          "name": "Faculty2FirstName Faculty2LastName"
        },
        {
          "student_id": 3,
          "name": "Student3FirstName Student3LastName"
        }
      ],
      "publication_type": "Conference",
      "conference": "International Cryptography Conference",
      "year": 2024,
      "location": "Zurich, Switzerland",
      "pages": "45-52",
      "doi": "10.1109/ICC.2024.123456",
      "citations": 8,
      "department": "Physics",
      "project_id": 2
    }
  ]
}
```
