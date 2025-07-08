# API Validation and Error Handling Examples

This document shows examples of validation errors and error handling in the API.

## Data Validation Errors

### Invalid Department Creation (Established Year Too Early)
```bash
curl -X 'POST' \
  'http://localhost:8000/departments/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Mechanical Engineering",
  "dept_head": "Dr. John Smith",
  "established_year": 1850,
  "budget": 1800000.00
}'
```

**Response:**
```json
{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["body", "established_year"],
      "msg": "Input should be greater than or equal to 1900",
      "input": 1850,
      "ctx": {
        "ge": 1900
      }
    }
  ]
}
```

### Invalid Faculty Creation (Negative Salary)
```bash
curl -X 'POST' \
  'http://localhost:8000/faculty/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@university.edu",
  "hire_date": "2025-07-01",
  "position": "Assistant Professor",
  "dept_id": 1,
  "salary": -10000
}'
```

**Response:**
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "salary"],
      "msg": "Input should be greater than 0",
      "input": -10000,
      "ctx": {
        "gt": 0
      }
    }
  ]
}
```

### Invalid Student Creation (Invalid Program Type)
```bash
curl -X 'POST' \
  'http://localhost:8000/students/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@university.edu",
  "enrollment_date": "2025-09-01",
  "program_type": "Undergraduate",
  "dept_id": 1
}'
```

**Response:**
```json
{
  "detail": "Constraint check failed for column 'program_type'"
}
```

## Resource Not Found Errors

### Department Not Found
```bash
curl -X 'GET' \
  'http://localhost:8000/departments/99' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "detail": "Department not found"
}
```

### Faculty Not Found
```bash
curl -X 'GET' \
  'http://localhost:8000/faculty/99' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "detail": "Faculty member not found"
}
```

### Project Not Found
```bash
curl -X 'GET' \
  'http://localhost:8000/projects/99' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "detail": "Project not found"
}
```

## Relationship Constraint Errors

### Delete Department with Faculty Members
```bash
curl -X 'DELETE' \
  'http://localhost:8000/departments/1' \
  -H 'accept: application/json'
```

**Response:**
```json
{
  "detail": "Cannot delete department with associated faculty members or students"
}
```

### Invalid Department Reference
```bash
curl -X 'POST' \
  'http://localhost:8000/faculty/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@university.edu",
  "hire_date": "2025-07-01",
  "position": "Assistant Professor",
  "dept_id": 99,
  "salary": 90000
}'
```

**Response:**
```json
{
  "detail": "Foreign key constraint failed: Department with ID 99 does not exist"
}
```

### Invalid Faculty Advisor Reference
```bash
curl -X 'POST' \
  'http://localhost:8000/students/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@university.edu",
  "enrollment_date": "2025-09-01",
  "program_type": "PhD",
  "dept_id": 1,
  "advisor_id": 99
}'
```

**Response:**
```json
{
  "detail": "Foreign key constraint failed: Faculty advisor with ID 99 does not exist"
}
```

## Duplicate Entry Errors

### Duplicate Department Name
```bash
curl -X 'POST' \
  'http://localhost:8000/departments/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "dept_name": "Computer Science",
  "dept_head": "Dr. Jane Smith",
  "established_year": 2020,
  "budget": 1800000.00
}'
```

**Response:**
```json
{
  "detail": "Unique constraint failed: Department name 'Computer Science' already exists"
}
```

### Duplicate Email for Faculty
```bash
curl -X 'POST' \
  'http://localhost:8000/faculty/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "first_name": "New",
  "last_name": "Professor",
  "email": "faculty1@university.edu",
  "hire_date": "2025-07-01",
  "position": "Assistant Professor",
  "dept_id": 1,
  "salary": 90000
}'
```

**Response:**
```json
{
  "detail": "Unique constraint failed: Email 'faculty1@university.edu' already exists"
}
```
