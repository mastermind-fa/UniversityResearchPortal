# University Research Portal

A web-based application for managing university research activities including departments, faculty, students, projects, and reports.

## Project Structure

```
├── Backend/            # FastAPI backend server
│   ├── app/            # Application code
│   ├── examples/       # Example data files
│   ├── main.py         # Entry point for the server
│   └── requirements.txt # Python dependencies
├── Frontend/           # HTML/JavaScript/CSS frontend
│   ├── css/            # CSS styles
│   ├── images/         # Static images
│   ├── js/             # JavaScript files
│   └── pages/          # HTML pages
└── run_server.sh       # Script to run the backend server
```

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **SQLite**: Database for storing the application data
- **Python**: Programming language for the backend logic

### Frontend
- **HTML5**: Structure of the web pages
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JavaScript**: Client-side functionality and API integration
- **ApexCharts**: Data visualization library

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, etc.)

### Running the Application

1. Make the run script executable:
   ```bash
   chmod +x run_server.sh
   ```

2. Start the backend server:
   ```bash
   ./run_server.sh
   ```

3. Open the frontend in a web browser:
   - Navigate to `Frontend/index.html` in your file explorer and open it with your browser
   - Or start a simple HTTP server in the Frontend directory:
     ```bash
     cd Frontend
     python -m http.server 3000
     ```
     Then open `http://localhost:3000` in your browser

## Features

- **Dashboard**: Overview of university research metrics and stats
- **Departments Management**: Add, edit, view, and delete academic departments
- **Faculty Management**: Manage faculty members and their research interests
- **Students Management**: Track students and their advisors
- **Projects Management**: Manage research projects, including funding and status
- **Publications**: Track academic publications by faculty and students
- **Funding**: Manage funding sources and project allocations
- **Project Collaborators**: Track external collaborations with other institutions
- **Student Research**: Manage student thesis, dissertations, and research activities
- **Reports**: Generate and view various reports on research activities

## API Endpoints

The backend provides the following API endpoints:

- **Departments**: `/departments`
- **Faculty**: `/faculty`
- **Students**: `/students`
- **Projects**: `/projects`
- **Publications**: `/publications`
- **Funding Sources**: `/funding-sources`
- **Project Funding**: `/project-funding`
- **Project Collaborators**: `/project-collaborators`
- **Student Research**: `/student-research`
- **Analytics**: `/analytics/dashboard`, `/analytics/department`
- **Reports**: `/reports/faculty`, `/reports/projects`, `/reports/publications`, `/reports/funding`

## Development

To modify or extend this application:

1. Backend changes:
   - Edit the Python files in the `Backend/app/` directory
   - Create or update database models in `Backend/app/models/`
   - Add new API endpoints in `Backend/app/api/routes/`

2. Frontend changes:
   - Edit HTML files in `Frontend/` and `Frontend/pages/`
   - Modify styles in `Frontend/css/styles.css`
   - Update JavaScript functionality in `Frontend/js/`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
