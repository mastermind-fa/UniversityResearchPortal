# Analytics API Examples

## Dashboard Analytics

### Request
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/dashboard' \
  -H 'accept: application/json'
```

### Response
```json
{
  "departments_count": 5,
  "faculty_count": 15,
  "student_count": 30,
  "students_by_program": {
    "Masters": 18,
    "PhD": 12
  },
  "active_projects": 7,
  "total_project_budget": 2150000.0,
  "department_with_most_faculty": {
    "name": "Computer Science",
    "faculty_count": 6
  }
}
```

## Department Analytics

### Request
```bash
curl -X 'GET' \
  'http://localhost:8000/analytics/department/1' \
  -H 'accept: application/json'
```

### Response
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

### Department Analytics for Mathematics (ID: 2)
```json
{
  "department_name": "Mathematics",
  "faculty_count": 4,
  "faculty_positions_distribution": {
    "Professor": 1,
    "Associate Professor": 2,
    "Assistant Professor": 1
  },
  "student_count": 8,
  "student_program_distribution": {
    "Masters": 5,
    "PhD": 3
  },
  "project_count": 2,
  "active_projects": 1,
  "total_project_budget": 325000.0,
  "research_focus": "Number Theory, Applied Mathematics, Statistics",
  "established_year": 1930,
  "budget": 1800000.0
}
```
