# University Research Portal Backend

This is the backend for a University Research Portal built with FastAPI and SQLite.

## Project Structure

```
Backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── departments.py
│   │   │   ├── faculty.py
│   │   │   ├── students.py
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── db/
│   │   ├── session.py
│   │   └── __init__.py
│   ├── models/
│   │   ├── departments.py
│   │   ├── faculty.py
│   │   ├── students.py
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── departments.py
│   │   ├── faculty.py
│   │   ├── students.py
│   │   └── __init__.py
│   └── __init__.py
├── main.py
└── requirements.txt
```

## Database Design

### Tables
1. **DEPARTMENTS** - Stores information about academic departments
2. **FACULTY** - Contains information about faculty members
3. **STUDENTS** - Manages graduate student information

## Setup and Installation

### Option 1: Manual Setup
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database with sample data:
```bash
python init_db.py
```

3. Run the application:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Single Command Setup
Use the provided Python script to install dependencies, initialize the database, and start the application:
```bash
python start.py
```

## API Documentation

Once the application is running, you can access:
- Interactive API documentation: http://localhost:8000/docs
- Alternative API documentation: http://localhost:8000/redoc

## Sample Data

Sample request and response data can be found in the `examples/` directory:

### JSON Examples
- `examples/departments.json`: Sample data for departments API
- `examples/faculty.json`: Sample data for faculty API
- `examples/students.json`: Sample data for students API
- `examples/projects.json`: Sample data for research projects API
- `examples/analytics.json`: Sample data for analytics API
- `examples/reports.json`: Sample data for reports API

### Markdown Examples
- `examples/all_api_curl_examples.md`: **Complete curl commands for every API endpoint**
- `examples/api_examples.md`: Complete examples of API requests using curl
- `examples/faculty_search.md`: Examples for faculty search API
- `examples/students_by_advisor.md`: Examples for students by advisor API
- `examples/projects_extended.md`: Extended examples for projects API
- `examples/analytics_extended.md`: Extended examples for analytics API
- `examples/reports_extended.md`: Extended examples for reports API
- `examples/api_usage_scenarios.md`: Real-world scenarios using multiple API endpoints
- `examples/validation_errors.md`: Examples of validation and error handling

## API Endpoints

### Departments
- `GET /departments` - List all departments
- `GET /departments/{dept_id}` - Get a specific department
- `POST /departments` - Create a new department
- `PUT /departments/{dept_id}` - Update a department
- `DELETE /departments/{dept_id}` - Delete a department

### Faculty
- `GET /faculty` - List all faculty members
- `GET /faculty/{faculty_id}` - Get a specific faculty member
- `POST /faculty` - Create a new faculty member
- `PUT /faculty/{faculty_id}` - Update a faculty member
- `DELETE /faculty/{faculty_id}` - Delete a faculty member
- `GET /faculty/search` - Search faculty with filters

### Students
- `GET /students` - List all students
- `GET /students/{student_id}` - Get a specific student
- `POST /students` - Create a new student
- `PUT /students/{student_id}` - Update a student
- `DELETE /students/{student_id}` - Delete a student
- `GET /students/by-advisor/{advisor_id}` - Get students by advisor

### Research Projects
- `GET /projects` - List all projects
- `GET /projects/{project_id}` - Get a specific project
- `POST /projects` - Create a new project
- `PUT /projects/{project_id}` - Update a project
- `DELETE /projects/{project_id}` - Delete a project
- `GET /projects/active` - Get active projects
- `GET /projects/by-department/{dept_id}` - Get projects by department

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/department/{dept_id}` - Get department analytics

### Reports
- `GET /reports/faculty` - Generate faculty reports
- `GET /reports/projects` - Generate project reports
- `GET /reports/publications` - Generate publication reports (placeholder)
