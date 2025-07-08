# Students by Advisor API Examples

## Get students by advisor ID
```bash
curl -X 'GET' \
  'http://localhost:8000/students/by-advisor/3' \
  -H 'accept: application/json'
```

## Sample Response
```json
[
  {
    "student_id": 4,
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael.johnson@university.edu",
    "enrollment_date": "2023-09-01",
    "program_type": "PhD",
    "dept_id": 1,
    "advisor_id": 3,
    "graduation_date": null
  },
  {
    "student_id": 9,
    "first_name": "Emma",
    "last_name": "Davis",
    "email": "emma.davis@university.edu",
    "enrollment_date": "2024-01-15",
    "program_type": "Masters",
    "dept_id": 1,
    "advisor_id": 3,
    "graduation_date": null
  },
  {
    "student_id": 17,
    "first_name": "David",
    "last_name": "Wilson",
    "email": "david.wilson@university.edu",
    "enrollment_date": "2022-09-01",
    "program_type": "PhD",
    "dept_id": 1,
    "advisor_id": 3,
    "graduation_date": null
  }
]
```
