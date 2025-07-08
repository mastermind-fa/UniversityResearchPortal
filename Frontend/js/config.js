// Configuration file for the CSEDU Portal

const CONFIG = {
    // API base URL
    API_BASE_URL: 'http://localhost:8000',
    
    // API endpoints
    ENDPOINTS: {
        // Departments
        DEPARTMENTS: '/departments',
        
        // Faculty
        FACULTY: '/faculty',
        FACULTY_SEARCH: '/faculty/search',
        
        // Students
        STUDENTS: '/students',
        STUDENTS_BY_ADVISOR: '/students/by-advisor',
        
        // Projects
        PROJECTS: '/projects',
        ACTIVE_PROJECTS: '/projects/active',
        PROJECTS_BY_DEPARTMENT: '/projects/by-department',
        
        // Publications
        PUBLICATIONS: '/publications',
        
        // Funding
        FUNDING_SOURCES: '/funding-sources',
        PROJECT_FUNDING: '/project-funding',
        
        // Student Research
        STUDENT_RESEARCH: '/student-research',
        
        // Project Collaborators
        PROJECT_COLLABORATORS: '/project-collaborators',
        
        // Analytics
        ANALYTICS_DASHBOARD: '/analytics/dashboard',
        ANALYTICS_DEPARTMENT: '/analytics/department',
        
        // Reports
        REPORTS_FACULTY: '/reports/faculty',
        REPORTS_PROJECTS: '/reports/projects',
        REPORTS_PUBLICATIONS: '/reports/publications',
        REPORTS_FUNDING: '/reports/funding'
    },
    
    // Chart colors
    CHART_COLORS: [
        '#4f46e5', '#818cf8', '#c7d2fe', '#6366f1', '#3730a3',
        '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857',
        '#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#b45309',
        '#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#b91c1c'
    ],
    
    // Pagination settings
    PAGINATION: {
        ITEMS_PER_PAGE: 10
    },
    
    // Form validation messages
    VALIDATION: {
        REQUIRED: 'This field is required',
        MIN_LENGTH: (min) => `This field must be at least ${min} characters`,
        MAX_LENGTH: (max) => `This field must be less than ${max} characters`,
        EMAIL_FORMAT: 'Please enter a valid email address',
        NUMBER_FORMAT: 'Please enter a valid number',
        DATE_FORMAT: 'Please enter a valid date (YYYY-MM-DD)'
    }
};
