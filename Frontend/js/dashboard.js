// University Research Portal Dashboard functionality

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load dashboard data
        await loadDashboardStats();
        await loadDashboardCharts();
        await loadRecentProjects();
        await loadTopResearchers();
        await loadResearchAreas();
        
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
        console.log('🔄 Loading dashboard statistics...');
        
        // Use the analytics dashboard endpoint for comprehensive stats
        const analyticsResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ANALYTICS_DASHBOARD);
        
        if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            console.log('📊 Analytics data received:', analyticsData);
            
            // Update stat cards with data from analytics endpoint
            document.getElementById('total-faculty').textContent = analyticsData.faculty_count || 0;
            document.getElementById('active-projects').textContent = analyticsData.active_projects || 0;
            document.getElementById('total-publications').textContent = analyticsData.total_publications || 0;
            
            // Format total funding using the more accurate total_budget
            const totalFunding = analyticsData.total_budget || analyticsData.total_project_budget || 0;
            document.getElementById('total-funding').textContent = `$${(totalFunding / 1000000).toFixed(1)}M`;
            
            console.log('✅ Dashboard stats updated successfully');
            
        } else {
            console.warn('⚠️ Analytics endpoint failed, falling back to individual endpoints');
            console.warn('Response status:', analyticsResponse.status);
            console.warn('Response text:', await analyticsResponse.text());
            
            // Fallback to individual endpoints if analytics fails
            const [facultyResponse, projectsResponse, publicationsResponse] = await Promise.all([
                fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY),
                fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS),
                fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PUBLICATIONS)
            ]);

            const facultyData = facultyResponse.ok ? await facultyResponse.json() : [];
            const projectsData = projectsResponse.ok ? await projectsResponse.json() : [];
            const publicationsData = publicationsResponse.ok ? await publicationsResponse.json() : [];

            // Update stat cards
            document.getElementById('total-faculty').textContent = facultyData.length || 0;
            document.getElementById('active-projects').textContent = 
                projectsData.filter(p => p.status === 'Active').length || 0;
            document.getElementById('total-publications').textContent = publicationsData.length || 0;
            
            // Calculate total funding
            const totalFunding = projectsData.reduce((sum, project) => sum + (project.total_budget || 0), 0);
            document.getElementById('total-funding').textContent = `$${(totalFunding / 1000000).toFixed(1)}M`;
            
            console.log('✅ Dashboard stats updated using fallback method');
        }
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        // Show error notification
        showNotification('Error loading dashboard statistics. Please try again.', 'error');
    }
}

/**
 * Load and display dashboard charts
 */
async function loadDashboardCharts() {
    try {
        console.log('🔄 Loading dashboard charts...');
        
        const [projectsData, departmentsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS),
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS)
        ]);

        // Create funding trends chart
        await createFundingTrendsChart();
        
        // Create publications by department chart
        await createPublicationsByDepartmentChart();
        
        console.log('✅ Dashboard charts loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading charts:', error);
    }
}

/**
 * Create funding trends chart
 */
async function createFundingTrendsChart() {
    try {
        console.log('🔄 Creating funding trends chart...');
        
        // Fetch funding trends data from the analytics endpoint
        const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ANALYTICS_FUNDING_TRENDS);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const fundingByYear = await response.json();
        console.log('💰 Funding trends data:', fundingByYear);
        
        if (!fundingByYear || Object.keys(fundingByYear).length === 0) {
            console.warn('⚠️ No funding trends data available');
            // Show a message in the chart area
            document.getElementById('funding-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No funding trends data available</div>';
            return;
        }
        
        const years = Object.keys(fundingByYear).sort((a, b) => parseInt(a) - parseInt(b));
        const amounts = years.map(year => (fundingByYear[year] / 1000000).toFixed(1)); // Convert to millions with 1 decimal
        
        console.log('📊 Chart data - Years:', years, 'Amounts:', amounts);
        
        const options = {
            series: [{
                name: 'Funding ($ Millions)',
                data: amounts.map(amount => parseFloat(amount))
            }],
            chart: {
                type: 'line',
                height: 300,
                toolbar: { show: false },
                zoom: { enabled: false }
            },
            colors: ['#3B82F6'],
            xaxis: {
                categories: years,
                title: { 
                    text: 'Year',
                    style: { fontSize: '14px', fontWeight: 600 }
                },
                labels: {
                    style: { fontSize: '12px' }
                }
            },
            yaxis: {
                title: { 
                    text: 'Funding ($ Millions)',
                    style: { fontSize: '14px', fontWeight: 600 }
                },
                labels: {
                    formatter: function(value) {
                        return '$' + value + 'M';
                    },
                    style: { fontSize: '12px' }
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3
            },
            markers: {
                size: 6,
                colors: ['#3B82F6'],
                strokeColors: '#ffffff',
                strokeWidth: 2
            },
            grid: {
                strokeDashArray: 4,
                borderColor: '#e5e7eb'
            },
            tooltip: {
                y: {
                    formatter: function(value) {
                        return '$' + value + 'M';
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return '$' + val + 'M';
                },
                style: {
                    fontSize: '11px',
                    fontWeight: 600,
                    colors: ['#1f2937']
                }
            }
        };
        
        // Clear any existing chart
        const chartContainer = document.getElementById('funding-chart');
        chartContainer.innerHTML = '';
        
        const chart = new ApexCharts(chartContainer, options);
        chart.render();
        
        console.log('✅ Funding trends chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating funding trends chart:', error);
        
        // Fallback: try to create a simple text-based display
        try {
            console.log('🔄 Attempting fallback display...');
            const fallbackResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
            if (fallbackResponse.ok) {
                const projects = await fallbackResponse.json();
                const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
                
                document.getElementById('funding-chart').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-64 text-center">
                        <div class="text-4xl font-bold text-blue-600 mb-2">$${(totalBudget / 1000000).toFixed(1)}M</div>
                        <div class="text-lg text-gray-600">Total Project Budget</div>
                        <div class="text-sm text-gray-500 mt-2">Chart temporarily unavailable</div>
                    </div>
                `;
                console.log('✅ Fallback display created successfully');
            } else {
                throw new Error('Fallback also failed');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            // Show error message in chart area
            document.getElementById('funding-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-red-500">Error loading funding trends chart</div>';
        }
    }
}

/**
 * Create publications by department chart
 */
async function createPublicationsByDepartmentChart() {
    try {
        console.log('🔄 Creating publications by department chart...');
        
        // Fetch publications by department data from the analytics endpoint
        const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.ANALYTICS_PUBLICATIONS_BY_DEPT);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const publicationsByDept = await response.json();
        console.log('📊 Publications by department data:', publicationsByDept);
        
        if (!publicationsByDept || Object.keys(publicationsByDept).length === 0) {
            console.warn('⚠️ No publications by department data available');
            // Show a message in the chart area
            document.getElementById('publications-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-gray-500">No publications data available</div>';
            return;
        }
        
        const departments = Object.keys(publicationsByDept);
        const counts = Object.values(publicationsByDept);
        
        console.log('📊 Chart data - Departments:', departments, 'Counts:', counts);
        
        const options = {
            series: counts,
            chart: {
                type: 'donut',
                height: 300,
                toolbar: { show: false }
            },
            labels: departments,
            colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'],
            legend: {
                position: 'bottom',
                fontSize: '12px'
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#374151'
                            },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 700,
                                color: '#1F2937'
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    return opts.w.globals.series[opts.seriesIndex];
                },
                style: {
                    fontSize: '12px',
                    fontWeight: 600
                }
            },
            tooltip: {
                y: {
                    formatter: function (value) {
                        return value + ' publications';
                    }
                }
            }
        };
        
        // Clear any existing chart
        const chartContainer = document.getElementById('publications-chart');
        chartContainer.innerHTML = '';
        
        const chart = new ApexCharts(chartContainer, options);
        chart.render();
        
        console.log('✅ Publications by department chart created successfully');
        
    } catch (error) {
        console.error('❌ Error creating publications by department chart:', error);
        
        // Fallback: try to create a simple text-based display
        try {
            console.log('🔄 Attempting fallback display...');
            const fallbackResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PUBLICATIONS);
            if (fallbackResponse.ok) {
                const publications = await fallbackResponse.json();
                const totalPubs = publications.length;
                
                document.getElementById('publications-chart').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-64 text-center">
                        <div class="text-4xl font-bold text-blue-600 mb-2">${totalPubs}</div>
                        <div class="text-lg text-gray-600">Total Publications</div>
                        <div class="text-sm text-gray-500 mt-2">Chart temporarily unavailable</div>
                    </div>
                `;
                console.log('✅ Fallback display created successfully');
            } else {
                throw new Error('Fallback also failed');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            // Show error message in chart area
            document.getElementById('publications-chart').innerHTML = 
                '<div class="flex items-center justify-center h-64 text-red-500">Error loading publications chart</div>';
        }
    }
}

/**
 * Test function for publications chart
 */
function testPublicationsChart() {
    console.log('🧪 Testing publications chart...');
    createPublicationsByDepartmentChart();
}

/**
 * Test function for funding trends chart
 */
function testFundingChart() {
    console.log('🧪 Testing funding trends chart...');
    createFundingTrendsChart();
}

/**
 * Test function for recent projects
 */
function testRecentProjects() {
    console.log('🧪 Testing recent projects...');
    loadRecentProjects();
}

/**
 * Test function for top researchers
 */
function testTopResearchers() {
    console.log('🧪 Testing top researchers...');
    loadTopResearchers();
}

/**
 * Load and display recent projects
 */
async function loadRecentProjects() {
    try {
        console.log('🔄 Loading recent projects...');
        
        const [projectsData, facultyData, departmentsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS),
            fetchAPI(CONFIG.ENDPOINTS.FACULTY),
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS)
        ]);

        console.log('📊 Projects data:', projectsData);
        console.log('👥 Faculty data:', facultyData);
        console.log('🏢 Departments data:', departmentsData);

        // Get 5 most recent active projects
        const recentProjects = projectsData
            .filter(p => p.status === 'Active')
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .slice(0, 5);

        console.log('📋 Recent active projects:', recentProjects);

        const container = document.getElementById('recent-projects');
        container.innerHTML = '';

        if (recentProjects.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No recent projects found.</p>';
            return;
        }

        recentProjects.forEach(project => {
            const faculty = facultyData.find(f => f.faculty_id === project.principal_investigator_id);
            const department = departmentsData.find(d => d.dept_id === project.dept_id);
            
            const projectCard = document.createElement('div');
            projectCard.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white';
            projectCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-gray-800 text-sm leading-tight flex-1 mr-3">${project.project_title}</h4>
                    <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0">${project.status}</span>
                </div>
                
                <p class="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    ${project.description || 'No description available'}
                </p>
                
                <div class="space-y-2 mb-3">
                    <div class="flex items-center text-xs text-gray-600">
                        <i class="fas fa-user mr-2 text-blue-500"></i>
                        <span class="font-medium">PI:</span>
                        <span class="ml-1">${faculty ? `${faculty.first_name} ${faculty.last_name}` : 'Unknown'}</span>
                    </div>
                    
                    <div class="flex items-center text-xs text-gray-600">
                        <i class="fas fa-building mr-2 text-green-500"></i>
                        <span class="font-medium">Dept:</span>
                        <span class="ml-1">${department ? department.dept_name : 'Unknown Department'}</span>
                    </div>
                </div>
                
                <div class="flex justify-between items-center text-xs">
                    <div class="flex items-center text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>${formatDate(project.start_date)}</span>
                        ${project.end_date ? `<span class="mx-1">-</span><span>${formatDate(project.end_date)}</span>` : ''}
                    </div>
                    <span class="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        $${(project.budget / 1000).toFixed(0)}K
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
        console.log('🔄 Loading top researchers...');
        
        const [facultyData, projectsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.FACULTY),
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS)
        ]);

        console.log('👥 Faculty data:', facultyData);
        console.log('📊 Projects data:', projectsData);

        // Calculate research metrics for each faculty
        const facultyMetrics = facultyData.map(faculty => {
            const projects = projectsData.filter(proj => 
                proj.principal_investigator_id === faculty.faculty_id
            );

            const metrics = {
                ...faculty,
                projectCount: projects.length,
                totalFunding: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
            };
            
            console.log(`📊 Faculty ${faculty.faculty_id} (${faculty.first_name} ${faculty.last_name}):`, metrics);
            return metrics;
        });

        console.log('📋 Faculty metrics:', facultyMetrics);

        // Sort by project count and funding
        const topResearchers = facultyMetrics
            .sort((a, b) => {
                // First sort by project count, then by funding
                if (b.projectCount !== a.projectCount) {
                    return b.projectCount - a.projectCount;
                }
                return b.totalFunding - a.totalFunding;
            })
            .slice(0, 5);

        console.log('🏆 Top researchers:', topResearchers);

        const container = document.getElementById('top-researchers');
        container.innerHTML = '';

        if (topResearchers.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No researchers found.</p>';
            return;
        }

        topResearchers.forEach((faculty, index) => {
            const researcherCard = document.createElement('div');
            researcherCard.className = 'flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white';
            researcherCard.innerHTML = `
                <div class="bg-blue-100 rounded-full p-2 flex-shrink-0">
                    <i class="fas fa-user-graduate text-blue-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-800 truncate">
                        ${faculty.first_name} ${faculty.last_name}
                    </h4>
                    <p class="text-sm text-gray-600">${faculty.position || 'Faculty Member'}</p>
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

        console.log('✅ Top researchers loaded successfully');

    } catch (error) {
        console.error('❌ Error loading top researchers:', error);
        // Show error message in container
        const container = document.getElementById('top-researchers');
        container.innerHTML = '<p class="text-red-500 text-center py-8">Error loading researchers. Please try again.</p>';
    }
}

/**
 * Load and display research areas dynamically
 */
async function loadResearchAreas() {
    try {
        console.log('🔄 Loading research areas...');
        
        const [departmentsData, projectsData] = await Promise.all([
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS),
            fetchAPI(CONFIG.ENDPOINTS.PROJECTS)
        ]);

        console.log('🏢 Departments data:', departmentsData);
        console.log('📊 Projects data:', projectsData);

        // Calculate active projects per department
        const departmentStats = departmentsData.map(dept => {
            const deptProjects = projectsData.filter(proj => 
                proj.dept_id === dept.dept_id && 
                (proj.status === 'Active' || proj.is_active)
            );
            
            return {
                ...dept,
                activeProjects: deptProjects.length
            };
        });

        // Sort by active projects count (descending)
        const sortedDepartments = departmentStats
            .sort((a, b) => b.activeProjects - a.activeProjects)
            .slice(0, 6); // Show top 6 departments

        console.log('📋 Department stats:', departmentStats);
        console.log('🏆 Top departments:', sortedDepartments);

        // Get the research areas container - find section with "Research Areas" heading
        const allSections = document.querySelectorAll('section');
        let researchAreasSection = null;
        let researchAreasGrid = null;
        
        for (const section of allSections) {
            const heading = section.querySelector('h2');
            if (heading && heading.textContent.includes('Research Areas')) {
                researchAreasSection = section;
                researchAreasGrid = section.querySelector('.grid');
                break;
            }
        }
        
        if (!researchAreasSection || !researchAreasGrid) {
            console.warn('⚠️ Research areas section or grid not found');
            return;
        }

        // Clear existing content
        researchAreasGrid.innerHTML = '';

        // Define color schemes for different departments
        const colorSchemes = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-teal-500 to-teal-600',
            'from-indigo-500 to-indigo-600'
        ];

        // Define icons for different research areas
        const getDepartmentIcon = (deptName) => {
            const lowerName = deptName.toLowerCase();
            if (lowerName.includes('computer') || lowerName.includes('cs')) return 'fas fa-robot';
            if (lowerName.includes('biology') || lowerName.includes('bio')) return 'fas fa-dna';
            if (lowerName.includes('chemistry')) return 'fas fa-atom';
            if (lowerName.includes('physics')) return 'fas fa-atom';
            if (lowerName.includes('math')) return 'fas fa-calculator';
            if (lowerName.includes('engineering')) return 'fas fa-cogs';
            return 'fas fa-flask'; // default icon
        };

        // Populate research areas dynamically
        sortedDepartments.forEach((dept, index) => {
            const colorScheme = colorSchemes[index % colorSchemes.length];
            const icon = getDepartmentIcon(dept.dept_name);
            
            const researchAreaCard = document.createElement('div');
            researchAreaCard.className = `bg-gradient-to-br ${colorScheme} rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300`;
            researchAreaCard.innerHTML = `
                <div class="flex items-center mb-4">
                    <i class="${icon} text-3xl mr-4"></i>
                    <h3 class="text-xl font-semibold">${dept.dept_name}</h3>
                </div>
                <p class="text-${colorScheme.includes('blue') ? 'blue' : colorScheme.includes('green') ? 'green' : colorScheme.includes('purple') ? 'purple' : colorScheme.includes('orange') ? 'orange' : colorScheme.includes('teal') ? 'teal' : 'indigo'}-100 mb-4">
                    ${dept.activeProjects} Active Research Projects
                </p>
                <div class="flex justify-between items-center">
                    <span class="text-sm">${dept.activeProjects} Active Projects</span>
                    <i class="fas fa-arrow-right"></i>
                </div>
            `;
            
            // Add click event to navigate to projects page with department filter
            researchAreaCard.addEventListener('click', () => {
                window.location.href = `pages/projects.html?dept_id=${dept.dept_id}`;
            });
            
            researchAreasGrid.appendChild(researchAreaCard);
        });

        console.log('✅ Research areas loaded successfully');

    } catch (error) {
        console.error('❌ Error loading research areas:', error);
        // Show error message in research areas section
        const allSections = document.querySelectorAll('section');
        let researchAreasSection = null;
        let researchAreasGrid = null;
        
        for (const section of allSections) {
            const heading = section.querySelector('h2');
            if (heading && heading.textContent.includes('Research Areas')) {
                researchAreasSection = section;
                researchAreasGrid = section.querySelector('.grid');
                break;
            }
        }
        
        if (researchAreasSection && researchAreasGrid) {
            researchAreasGrid.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500">Error loading research areas. Please try again.</p>
                </div>
            `;
        }
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
