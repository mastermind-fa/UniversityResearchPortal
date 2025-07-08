// Dashboard functionality for the CSEDU Portal

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch dashboard analytics data
        const dashboardData = await fetchAPI(CONFIG.ENDPOINTS.ANALYTICS_DASHBOARD);
        console.log('Dashboard data:', dashboardData); // Debug log to see the data
        
        // Hide loading indicator and show dashboard content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('dashboard-stats').classList.remove('hidden');
        
        // Populate stats cards
        populateStatsCards(dashboardData);
        
        // Create charts
        // Transform students_by_program from object to array for chart
        const studentsProgram = Object.entries(dashboardData.students_by_program).map(([program, count]) => {
            return { program, count };
        });
        createStudentsProgramChart(studentsProgram);
        
        // Skip budget range chart if data is not available in the format we need
        // Create a simple active projects chart instead
        createActiveProjectsChart(dashboardData.active_projects);
        
        // Populate active projects table
        await populateActiveProjects();
        
        // Show department spotlight
        showDepartmentSpotlight(dashboardData.department_with_most_faculty);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('loading').classList.add('hidden');
        showNotification('Error loading dashboard data. Please try again.', 'error');
    }
});

/**
 * Populate stats cards with dashboard data
 * @param {Object} data - Dashboard data
 */
function populateStatsCards(data) {
    const statsContainer = document.getElementById('dashboard-stats');
    
    // Clear existing content
    statsContainer.innerHTML = '';
    
    // Create stats cards
    const statsCards = [
        {
            title: 'Total Departments',
            value: data.departments_count || 0,
            icon: 'fa-building',
            color: 'indigo'
        },
        {
            title: 'Total Faculty',
            value: data.faculty_count || 0,
            icon: 'fa-chalkboard-teacher',
            color: 'blue'
        },
        {
            title: 'Total Students',
            value: data.student_count || 0,
            icon: 'fa-user-graduate',
            color: 'green'
        },
        {
            title: 'Active Projects',
            value: data.active_projects || 0,
            icon: 'fa-flask',
            color: 'yellow'
        },
        {
            title: 'Total Funding',
            value: formatCurrency(data.total_project_budget || 0),
            icon: 'fa-dollar-sign',
            color: 'red'
        },
        {
            title: 'Research Programs',
            value: Object.keys(data.students_by_program || {}).length,
            icon: 'fa-book',
            color: 'purple'
        },
        {
            title: 'Collaborators',
            value: data.collaborators_count || 0,
            icon: 'fa-users',
            color: 'pink'
        },
        {
            title: 'Student Research',
            value: data.student_research_count || 0,
            icon: 'fa-microscope',
            color: 'teal'
        }
    ];
    
    // Add stats cards to container
    statsCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `bg-white p-6 rounded-lg shadow-md flex items-center`;
        
        cardElement.innerHTML = `
            <div class="bg-${card.color}-100 p-3 rounded-full">
                <i class="fas ${card.icon} text-${card.color}-500 text-xl"></i>
            </div>
            <div class="ml-4">
                <h3 class="text-gray-500 text-sm">${card.title}</h3>
                <p class="text-2xl font-semibold">${card.value}</p>
            </div>
        `;
        
        statsContainer.appendChild(cardElement);
    });
}

/**
 * Create the students by program chart
 * @param {Array} data - Students by program data
 */
function createStudentsProgramChart(data) {
    const chartData = {
        series: data.map(item => item.count),
        labels: data.map(item => item.program)
    };
    
    const options = {
        chart: {
            type: 'pie',
            height: 350
        },
        colors: CONFIG.CHART_COLORS,
        labels: chartData.labels,
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    height: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };
    
    const chart = new ApexCharts(document.getElementById('students-program-chart'), options);
    chart.render();
}

/**
 * Create a chart showing active projects stats
 * @param {number} activeProjects - Number of active projects
 */
function createActiveProjectsChart(activeProjects) {
    // Update the chart title to match the new content
    const chartTitle = document.querySelector('#projects-budget-chart').previousElementSibling;
    if (chartTitle) {
        chartTitle.textContent = 'Active Projects Status';
    }
    
    const chartData = {
        series: [activeProjects, 100 - activeProjects],
        labels: ['Active', 'Inactive/Completed']
    };
    
    const options = {
        chart: {
            type: 'donut',
            height: 350
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%'
                }
            }
        },
        dataLabels: {
            enabled: true
        },
        colors: [CONFIG.CHART_COLORS[0], CONFIG.CHART_COLORS[4]],
        labels: chartData.labels,
        legend: {
            position: 'bottom'
        }
    };
    
    const chart = new ApexCharts(document.getElementById('projects-budget-chart'), options);
    chart.render();
}

/**
 * Populate active projects table
 */
async function populateActiveProjects() {
    try {
        // Fetch active projects
        const activeProjects = await fetchAPI(CONFIG.ENDPOINTS.ACTIVE_PROJECTS);
        
        const projectsTableBody = document.getElementById('active-projects');
        
        // Clear existing rows
        projectsTableBody.innerHTML = '';
        
        // Show max 5 active projects
        const projectsToShow = activeProjects.slice(0, 5);
        
        // Add project rows
        projectsToShow.forEach(project => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${project.title}</td>
                <td class="py-2 px-4 border-b">${project.department_name}</td>
                <td class="py-2 px-4 border-b">${formatCurrency(project.budget)}</td>
                <td class="py-2 px-4 border-b">${project.funding_source || 'N/A'}</td>
                <td class="py-2 px-4 border-b">
                    <a href="pages/projects.html?id=${project.id}" class="text-indigo-600 hover:text-indigo-800">
                        <i class="fas fa-eye mr-1"></i> View
                    </a>
                </td>
            `;
            
            projectsTableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading active projects:', error);
        showNotification('Error loading active projects. Please try again.', 'error');
    }
}

/**
 * Show department spotlight
 * @param {Object} department - Top department data
 */
function showDepartmentSpotlight(department) {
    if (!department) {
        document.getElementById('top-department-card').classList.add('hidden');
        return;
    }
    
    const contentDiv = document.getElementById('top-department-content');
    
    // Clear existing content
    contentDiv.innerHTML = '';
    
    // Create department spotlight content
    const content = document.createElement('div');
    
    content.innerHTML = `
        <div class="flex items-center mb-4">
            <div class="bg-indigo-100 p-3 rounded-full">
                <i class="fas fa-trophy text-indigo-500 text-xl"></i>
            </div>
            <div class="ml-4">
                <h3 class="text-xl font-semibold">${department.name}</h3>
                <p class="text-gray-600">${department.faculty_count} Faculty Members</p>
            </div>
        </div>
        <p class="text-gray-700">Leading our university research initiatives with outstanding faculty and groundbreaking projects.</p>
        <div class="mt-4 flex justify-between">
            <div>
                <p class="text-sm text-gray-600">Department with most faculty members</p>
            </div>
            <a href="pages/departments.html" class="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                Learn more <i class="fas fa-arrow-right ml-1"></i>
            </a>
        </div>
    `;
    
    contentDiv.appendChild(content);
}
