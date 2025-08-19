# University Research Portal Backend

This is the backend for a University Research Portal built with FastAPI and SQLite. The system manages comprehensive university research data including departments, faculty, students, research projects, funding, publications, and collaborations.

## Project Structure

```
Backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── analytics.py           # Analytics and reporting endpoints
│   │   │   ├── collaborators.py       # Project collaboration management
│   │   │   ├── departments.py         # Department management
│   │   │   ├── faculty.py             # Faculty management
│   │   │   ├── funding.py             # Research funding management
│   │   │   ├── projects.py            # Research project management
│   │   │   ├── publications.py        # Academic publication management
│   │   │   ├── reports.py             # Report generation
│   │   │   ├── student_research.py    # Student research participation
│   │   │   ├── students.py            # Student management
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── db/
│   │   ├── session.py                 # Database session management
│   │   └── __init__.py
│   ├── models/
│   │   ├── collaborators.py           # Project collaborator model
│   │   ├── departments.py             # Department model
│   │   ├── faculty.py                 # Faculty model
│   │   ├── funding.py                 # Funding model
│   │   ├── projects.py                # Project model
│   │   ├── publication_authors.py     # Publication authorship model
│   │   ├── publications.py            # Publication model
│   │   ├── student_research.py        # Student research model
│   │   ├── students.py                # Student model
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── departments.py             # Department Pydantic schemas
│   │   ├── faculty.py                 # Faculty Pydantic schemas
│   │   ├── funding.py                 # Funding Pydantic schemas
│   │   ├── projects.py                # Project Pydantic schemas
│   │   ├── publications.py            # Publication Pydantic schemas
│   │   ├── students.py                # Student Pydantic schemas
│   │   └── __init__.py
│   └── __init__.py
├── main.py                            # FastAPI application entry point
├── init_db.py                         # Database initialization script
├── start.py                          # Automated setup and start script
├── university_portal.db              # SQLite database file
└── requirements.txt                   # Python dependencies
```

## Database Design

### Core Tables
1. **DEPARTMENTS** - Academic departments (Computer Science, Biology, etc.)
2. **FACULTY** - Faculty members with expertise and contact information
3. **STUDENTS** - Graduate students with advisor relationships
4. **RESEARCH_PROJECTS** - Research projects with funding and timelines
5. **FUNDING_SOURCES** - Grant funding sources and amounts
6. **PUBLICATIONS** - Academic publications and research outputs
7. **PROJECT_COLLABORATORS** - Faculty collaboration on projects
8. **STUDENT_RESEARCH** - Student participation in research projects
9. **PUBLICATION_AUTHORS** - Authorship relationships for publications

## Setup and Installation

### Prerequisites
- Python 3.7+
- pip (Python package installer)

### Option 1: Quick Start
Use the automated setup script:
```bash
python start.py
```

### Option 2: Manual Setup
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python init_db.py
```

3. Run the application:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Shell Scripts
Use the provided shell scripts:
```bash
# Simple run with basic setup
./simple_run.sh

# Full run with data population
./run.sh
```
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
- **Interactive API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Documentation**: http://localhost:8000/redoc (ReDoc)

## Complete API Reference

### 🏫 Departments API (`/api/departments/`)

**Base URL**: `/api/departments/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all departments | None |
| GET | `/{dept_id}` | Get specific department by ID | `dept_id` (int) |
| POST | `/` | Create new department | Query params: `dept_name`, `budget`, `building`, `head_faculty_id` |
| PUT | `/{dept_id}` | Update department | `dept_id` (int) + query params |
| DELETE | `/{dept_id}` | Delete department | `dept_id` (int) |

### 👨‍🏫 Faculty API (`/api/faculty/`)

**Base URL**: `/api/faculty/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all faculty members | Optional: `department_id`, `expertise` |
| GET | `/{faculty_id}` | Get specific faculty by ID | `faculty_id` (int) |
| POST | `/` | Create new faculty member | Query params: `first_name`, `last_name`, `email`, `department_id`, `expertise`, `office_location` |
| PUT | `/{faculty_id}` | Update faculty member | `faculty_id` (int) + query params |
| DELETE | `/{faculty_id}` | Delete faculty member | `faculty_id` (int) |
| GET | `/search` | Search faculty with filters | `name`, `department_id`, `expertise` |

### 🎓 Students API (`/api/students/`)

**Base URL**: `/api/students/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all students | Optional: `department_id`, `advisor_id` |
| GET | `/{student_id}` | Get specific student by ID | `student_id` (int) |
| POST | `/` | Create new student | Query params: `first_name`, `last_name`, `email`, `department_id`, `advisor_id`, `program`, `year_of_study` |
| PUT | `/{student_id}` | Update student | `student_id` (int) + query params |
| DELETE | `/{student_id}` | Delete student | `student_id` (int) |
| GET | `/by-advisor/{advisor_id}` | Get students by advisor | `advisor_id` (int) |

### 🔬 Research Projects API (`/api/projects/`)

**Base URL**: `/api/projects/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all projects | Optional: `department_id`, `status`, `principal_investigator_id` |
| GET | `/{project_id}` | Get specific project by ID | `project_id` (int) |
| POST | `/` | Create new project | Query params: `project_title`, `description`, `start_date`, `end_date`, `principal_investigator_id`, `department_id`, `status`, `budget` |
| PUT | `/{project_id}` | Update project | `project_id` (int) + query params |
| DELETE | `/{project_id}` | Delete project | `project_id` (int) |
| GET | `/active` | Get active projects only | None |
| GET | `/by-department/{dept_id}` | Get projects by department | `dept_id` (int) |

### 💰 Funding API (`/api/funding-sources/`)

**Base URL**: `/api/funding-sources/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all funding sources | Optional: `project_id`, `funding_agency` |
| GET | `/{funding_id}` | Get specific funding by ID | `funding_id` (int) |
| POST | `/` | Create new funding source | Query params: `project_id`, `funding_agency`, `amount`, `grant_number`, `start_date`, `end_date` |
| PUT | `/{funding_id}` | Update funding source | `funding_id` (int) + query params |
| DELETE | `/{funding_id}` | Delete funding source | `funding_id` (int) |

### 🤝 Project Collaborators API (`/api/project-collaborators/`)

**Base URL**: `/api/project-collaborators/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all project collaborations | Optional: `project_id`, `faculty_id` |
| POST | `/` | Add faculty as project collaborator | Query params: `project_id`, `faculty_id`, `role`, `involvement_percentage` |
| POST | `/json` | Add collaborator using JSON body | JSON body: `{"project_id": int, "faculty_id": int, "role": str, "involvement_percentage": float}` |
| DELETE | `/{project_id}/{faculty_id}` | Remove project collaborator | `project_id` (int), `faculty_id` (int) |

### 🔬 Student Research API (`/api/student-research/`)

**Base URL**: `/api/student-research/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all student research participation | Optional: `student_id`, `project_id` |
| POST | `/` | Add student to research project | Query params: `student_id`, `project_id`, `start_date`, `role`, `end_date` |
| POST | `/json` | Add student research using JSON body | JSON body: `{"student_id": int, "project_id": int, "start_date": str, "role": str, "end_date": str}` |
| DELETE | `/{student_id}/{project_id}` | Remove student from research | `student_id` (int), `project_id` (int) |

### 📚 Publications API (`/api/publications/`)

**Base URL**: `/api/publications/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/` | List all publications | Optional: `faculty_id`, `publication_type`, `year` |
| GET | `/{pub_id}` | Get specific publication by ID | `pub_id` (int) |
| POST | `/` | Create new publication | Query params: `title`, `publication_type`, `venue`, `publication_date`, `doi`, `abstract` |
| PUT | `/{pub_id}` | Update publication | `pub_id` (int) + query params |
| DELETE | `/{pub_id}` | Delete publication | `pub_id` (int) |
| POST | `/authors` | Add author to publication | JSON body: `{"publication_id": int, "faculty_id": int, "author_order": int, "is_corresponding": str}` |

### 📊 Analytics API (`/api/analytics/`)

**Base URL**: `/api/analytics/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/dashboard` | Get comprehensive dashboard statistics | None |
| GET | `/department/{dept_id}` | Get department-specific analytics | `dept_id` (int) |

### 📋 Reports API (`/api/reports/`)

**Base URL**: `/api/reports/`

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/faculty` | Generate faculty activity reports | Optional: `department_id`, `year` |
| GET | `/projects` | Generate project status reports | Optional: `department_id`, `status` |
| GET | `/publications` | Generate publication reports | Optional: `department_id`, `year` |

## Request/Response Examples

### Creating a New Faculty Member
```bash
curl -X POST "http://localhost:8000/api/faculty/" \
  -d "first_name=John&last_name=Doe&email=john.doe@university.edu&department_id=1&expertise=Machine Learning&office_location=CS-101"
```

### Adding a Project Collaborator (JSON)
```bash
curl -X POST "http://localhost:8000/api/project-collaborators/json" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "faculty_id": 2, "role": "Co-Investigator", "involvement_percentage": 30.0}'
```

### Getting Department Analytics
```bash
curl "http://localhost:8000/api/analytics/department/1"
```

## Error Handling

The API uses standard HTTP status codes:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

Error responses include detailed error messages:
```json
{
  "detail": "Faculty not found"
}
```

## Sample Data & Examples

The system comes with comprehensive sample data and examples in the `examples/` directory:

### 📄 JSON Sample Data Files
- `examples/departments.json` - Sample department data
- `examples/faculty.json` - Sample faculty member data  
- `examples/students.json` - Sample student data
- `examples/projects.json` - Sample research project data
- `examples/analytics.json` - Sample analytics response data
- `examples/reports.json` - Sample report data

### 📖 Documentation & Examples
- `examples/all_api_curl_examples.md` - **Complete curl commands for every API endpoint**
- `examples/api_examples.md` - Comprehensive API request examples
- `examples/faculty_search.md` - Faculty search API examples
- `examples/students_by_advisor.md` - Student-advisor relationship examples
- `examples/projects_extended.md` - Extended project management examples
- `examples/analytics_extended.md` - Advanced analytics usage examples
- `examples/reports_extended.md` - Report generation examples
- `examples/api_usage_scenarios.md` - Real-world API usage scenarios
- `examples/validation_errors.md` - Error handling and validation examples

## Database Statistics

The system currently contains:
- **5 Departments** (Computer Science, Biology, Chemistry, Physics, Mathematics)
- **16 Faculty Members** across all departments
- **15 Graduate Students** with advisor relationships
- **32 Research Projects** with various funding sources
- **6 Funding Sources** from agencies like NSF, NIH, DOE
- **11 Project Collaborations** between faculty members
- **8 Student Research Participations** 
- **12 Publications** with authorship information
- **13 Publication Author Relationships**

**Total Records**: 118+ records across 9 database tables

## Features

### 🔍 Advanced Search & Filtering
- Faculty search by name, department, or expertise
- Project filtering by status, department, or investigator
- Student lookup by advisor or department
- Publication search by type, year, or author

### 📊 Analytics & Reporting
- Department-wise statistics and metrics
- Faculty productivity reports
- Project status and funding summaries
- Research collaboration networks

### 🔗 Relationship Management
- Faculty-student advisor relationships
- Project collaborations and team management
- Publication authorship tracking
- Funding source allocation

### 🛡️ Data Validation
- Comprehensive input validation using Pydantic
- Foreign key constraint enforcement
- Date format validation
- Email format validation

## Technology Stack

- **Framework**: FastAPI (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic models
- **Documentation**: Automatic OpenAPI/Swagger generation
- **CORS**: Enabled for frontend integration

## Development

### Adding New Endpoints
1. Create model in `app/models/`
2. Create Pydantic schemas in `app/schemas/`
3. Create route handlers in `app/api/routes/`
4. Register routes in `main.py`

### Database Migrations
```bash
# Initialize new database
python init_db.py

# Add sample data
python populate_all_data.py
```

### Testing
```bash
# Run the verification script
python verify_complete_database.py
```

## License

This project is part of an academic database management system implementation.
