// University Research Portal Dashboard functionality

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load dashboard data
        await loadDashboardStats();
        await loadDashboardCharts();
        await loadRecentProjects();
        await loadTopResearchers();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard data. Please try again.', 'error');
    }
});

/**
 * Load and display dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Fetch data from different endpoints
        const [facultyData, projectsData, publicationsData, fundingData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.FACULTY),
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS),
            fetchAPI(CONFIG.ENDPOINTS.PUBLICATIONS),
            fetchAPI(CONFIG.ENDPOINTS.ANALYTICS_DASHBOARD)
        ]);

        // Update stat cards
        document.getElementById('total-faculty').textContent = facultyData.length || 0;
        document.getElementById('active-projects').textContent = 
            projectsData.filter(p => p.status === 'Active').length || 0;
        document.getElementById('total-publications').textContent = publicationsData.length || 0;
        
        // Calculate total funding
        const totalFunding = projectsData.reduce((sum, project) => sum + (project.total_budget || 0), 0);
        document.getElementById('total-funding').textContent = `$${(totalFunding / 1000000).toFixed(1)}M`;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

/**
 * Load and display dashboard charts
 */
async function loadDashboardCharts() {
    try {
        const [projectsData, publicationsData, departmentsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS),
            fetchAPI(CONFIG.ENDPOINTS.PUBLICATIONS),
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS)
        ]);

        // Create funding trends chart
        createFundingTrendsChart(projectsData);
        
        // Create publications by department chart
        createPublicationsByDepartmentChart(publicationsData, departmentsData);
        
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}

/**
 * Create funding trends chart
 */
function createFundingTrendsChart(projectsData) {
    // Process data for funding trends by year
    const fundingByYear = {};
    projectsData.forEach(project => {
        if (project.start_date && project.total_budget) {
            const year = new Date(project.start_date).getFullYear();
            fundingByYear[year] = (fundingByYear[year] || 0) + project.total_budget;
        }
    });

    const years = Object.keys(fundingByYear).sort();
    const amounts = years.map(year => fundingByYear[year] / 1000000); // Convert to millions

    const options = {
        series: [{
            name: 'Funding ($ Millions)',
            data: amounts
        }],
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false }
        },
        colors: ['#3B82F6'],
        xaxis: {
            categories: years,
            title: { text: 'Year' }
        },
        yaxis: {
            title: { text: 'Funding ($ Millions)' }
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        markers: {
            size: 6
        },
        grid: {
            strokeDashArray: 4
        }
    };

    const chart = new ApexCharts(document.getElementById('funding-chart'), options);
    chart.render();
}

/**
 * Create publications by department chart
 */
function createPublicationsByDepartmentChart(publicationsData, departmentsData) {
    // Count publications by department
    const pubsByDept = {};
    
    // First, get projects to map publications to departments
    fetchAPI(CONFIG.ENDPOINTS.PROJECTS).then(projectsData => {
        publicationsData.forEach(pub => {
            if (pub.project_id) {
                const project = projectsData.find(p => p.project_id === pub.project_id);
                if (project && project.dept_id) {
                    const dept = departmentsData.find(d => d.dept_id === project.dept_id);
                    if (dept) {
                        pubsByDept[dept.dept_name] = (pubsByDept[dept.dept_name] || 0) + 1;
                    }
                }
            }
        });

        const departments = Object.keys(pubsByDept);
        const counts = Object.values(pubsByDept);

        const options = {
            series: counts,
            chart: {
                type: 'donut',
                height: 300
            },
            labels: departments,
            colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'],
            legend: {
                position: 'bottom'
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%'
                    }
                }
            }
        };

        const chart = new ApexCharts(document.getElementById('publications-chart'), options);
        chart.render();
    });
}

/**
 * Load and display recent projects
 */
async function loadRecentProjects() {
    try {
        const [projectsData, facultyData, departmentsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS),
            fetchAPI(CONFIG.ENDPOINTS.FACULTY),
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS)
        ]);

        // Get 5 most recent active projects
        const recentProjects = projectsData
            .filter(p => p.status === 'Active')
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .slice(0, 5);

        const container = document.getElementById('recent-projects');
        container.innerHTML = '';

        if (recentProjects.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No recent projects found.</p>';
            return;
        }

        recentProjects.forEach(project => {
            const faculty = facultyData.find(f => f.faculty_id === project.principal_investigator);
            const department = departmentsData.find(d => d.dept_id === project.dept_id);
            
            const projectCard = document.createElement('div');
            projectCard.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
            projectCard.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800 line-clamp-2">${project.project_title}</h4>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">${project.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">
                    <i class="fas fa-user mr-1"></i>PI: ${faculty ? `${faculty.first_name} ${faculty.last_name}` : 'Unknown'}
                </p>
                <p class="text-sm text-gray-600 mb-2">
                    <i class="fas fa-building mr-1"></i>${department ? department.dept_name : 'Unknown Department'}
                </p>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>${formatDate(project.start_date)}
                    </span>
                    <span class="font-medium text-blue-600">
                        $${(project.total_budget / 1000).toFixed(0)}K
                    </span>
                </div>
            `;
            container.appendChild(projectCard);
        });

    } catch (error) {
        console.error('Error loading recent projects:', error);
    }
}

/**
 * Load and display top researchers
 */
async function loadTopResearchers() {
    try {
        const [facultyData, publicationsData, projectsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.FACULTY),
            fetchAPI(CONFIG.ENDPOINTS.PUBLICATIONS),
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS)
        ]);

        // Calculate research metrics for each faculty
        const facultyMetrics = facultyData.map(faculty => {
            const publications = publicationsData.filter(pub => {
                // This requires publication_authors endpoint to properly map
                return true; // Simplified for now
            });
            
            const projects = projectsData.filter(proj => 
                proj.principal_investigator === faculty.faculty_id
            );

            return {
                ...faculty,
                publicationCount: publications.length,
                projectCount: projects.length,
                totalFunding: projects.reduce((sum, p) => sum + (p.total_budget || 0), 0)
            };
        });

        // Sort by combined metrics
        const topResearchers = facultyMetrics
            .sort((a, b) => (b.publicationCount + b.projectCount) - (a.publicationCount + a.projectCount))
            .slice(0, 5);

        const container = document.getElementById('top-researchers');
        container.innerHTML = '';

        if (topResearchers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No researchers found.</p>';
            return;
        }

        topResearchers.forEach((faculty, index) => {
            const researcherCard = document.createElement('div');
            researcherCard.className = 'flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow';
            researcherCard.innerHTML = `
                <div class="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <i class="fas fa-user-graduate text-blue-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 truncate">
                        ${faculty.first_name} ${faculty.last_name}
                    </h4>
                    <p class="text-sm text-gray-600">${faculty.position}</p>
                    <div class="flex space-x-3 text-xs text-gray-500 mt-1">
                        <span><i class="fas fa-project-diagram mr-1"></i>${faculty.projectCount} projects</span>
                        <span><i class="fas fa-dollar-sign mr-1"></i>$${(faculty.totalFunding/1000).toFixed(0)}K</span>
                    </div>
                </div>
                <div class="bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-600">
                    ${index + 1}
                </div>
            `;
            container.appendChild(researcherCard);
        });

    } catch (error) {
        console.error('Error loading top researchers:', error);
    }
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}
