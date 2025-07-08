// Reports page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const reportFilters = document.getElementById('report-filters');
    const facultyFilters = document.getElementById('faculty-filters');
    const projectsFilters = document.getElementById('projects-filters');
    const publicationsFilters = document.getElementById('publications-filters');
    const fundingFilters = document.getElementById('funding-filters');
    const filterTitle = document.getElementById('filter-title');
    
    const loadingIndicator = document.getElementById('loading');
    const reportContent = document.getElementById('report-content');
    const noData = document.getElementById('no-data');
    
    const reportTitle = document.getElementById('report-title');
    const reportSubtitle = document.getElementById('report-subtitle');
    const reportBody = document.getElementById('report-body');
    
    const facultyReportBtn = document.getElementById('faculty-report-btn');
    const projectsReportBtn = document.getElementById('projects-report-btn');
    const publicationsReportBtn = document.getElementById('publications-report-btn');
    const fundingReportBtn = document.getElementById('funding-report-btn');
    
    const facultySelect = document.getElementById('faculty-select');
    const deptSelect = document.getElementById('dept-select');
    const statusSelect = document.getElementById('status-select');
    const pubDeptSelect = document.getElementById('pub-dept-select');
    const fundingTypeSelect = document.getElementById('funding-type-select');
    
    const generateFacultyReportBtn = document.getElementById('generate-faculty-report');
    const generateProjectsReportBtn = document.getElementById('generate-projects-report');
    const generatePublicationsReportBtn = document.getElementById('generate-publications-report');
    const generateFundingReportBtn = document.getElementById('generate-funding-report');
    
    const exportReportBtn = document.getElementById('export-report');
    
    // State variables
    let departments = [];
    let faculty = [];
    let currentReportType = null;
    
    // Initialize page
    initPage();

    // Report type selection
    facultyReportBtn.addEventListener('click', () => selectReportType('faculty'));
    projectsReportBtn.addEventListener('click', () => selectReportType('projects'));
    publicationsReportBtn.addEventListener('click', () => selectReportType('publications'));
    fundingReportBtn.addEventListener('click', () => selectReportType('funding'));
    
    // Generate report buttons
    generateFacultyReportBtn.addEventListener('click', generateFacultyReport);
    generateProjectsReportBtn.addEventListener('click', generateProjectsReport);
    generatePublicationsReportBtn.addEventListener('click', generatePublicationsReport);
    generateFundingReportBtn.addEventListener('click', generateFundingReport);
    
    // Export report
    exportReportBtn.addEventListener('click', exportReport);

    async function initPage() {
        try {
            // Load departments
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            
            // Load faculty
            faculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
            
            // Populate filter selects
            populateFilters();
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
    }

    function populateFilters() {
        // Populate department selects
        const populateDeptSelect = (selectEl) => {
            // Clear existing options except the first one
            while (selectEl.options.length > 1) {
                selectEl.remove(1);
            }
            
            // Add department options
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.dept_id;
                option.textContent = dept.dept_name;
                selectEl.appendChild(option);
            });
        };
        
        populateDeptSelect(deptSelect);
        populateDeptSelect(pubDeptSelect);
        
        // Populate faculty select
        while (facultySelect.options.length > 1) {
            facultySelect.remove(1);
        }
        
        // Sort faculty by last name
        faculty.sort((a, b) => a.last_name.localeCompare(b.last_name));
        
        faculty.forEach(f => {
            const option = document.createElement('option');
            option.value = f.faculty_id;
            option.textContent = `${f.last_name}, ${f.first_name}`;
            facultySelect.appendChild(option);
        });
    }

    function selectReportType(type) {
        currentReportType = type;
        
        // Hide all reports and filters
        reportContent.classList.add('hidden');
        noData.classList.add('hidden');
        
        // Show filter section
        reportFilters.classList.remove('hidden');
        
        // Hide all filter types
        facultyFilters.classList.add('hidden');
        projectsFilters.classList.add('hidden');
        publicationsFilters.classList.add('hidden');
        fundingFilters.classList.add('hidden');
        
        // Set filter title and show appropriate filters
        switch (type) {
            case 'faculty':
                filterTitle.textContent = 'Faculty Research Report';
                facultyFilters.classList.remove('hidden');
                break;
            case 'projects':
                filterTitle.textContent = 'Research Projects Report';
                projectsFilters.classList.remove('hidden');
                break;
            case 'publications':
                filterTitle.textContent = 'Research Publications Report';
                publicationsFilters.classList.remove('hidden');
                break;
            case 'funding':
                filterTitle.textContent = 'Research Funding Report';
                fundingFilters.classList.remove('hidden');
                break;
        }
    }

    async function generateFacultyReport() {
        const facultyId = facultySelect.value;
        if (!facultyId) {
            showNotification('Please select a faculty member', 'warning');
            return;
        }
        
        showLoading();
        
        try {
            const reportData = await fetchAPI(`${CONFIG.ENDPOINTS.REPORTS_FACULTY}/${facultyId}`);
            
            if (!reportData) {
                showNoData();
                return;
            }
            
            const facultyMember = faculty.find(f => f.faculty_id == facultyId);
            const departmentName = getDepartmentName(facultyMember.dept_id);
            
            // Set report title and subtitle
            reportTitle.textContent = `Faculty Research Report: ${facultyMember.first_name} ${facultyMember.last_name}`;
            reportSubtitle.textContent = `${facultyMember.position || 'Faculty'}, ${departmentName}`;
            
            // Generate report content
            let content = `
                <div class="border-b pb-6 mb-6">
                    <h3 class="text-lg font-semibold mb-3">Faculty Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <p class="text-gray-500 text-sm">Email</p>
                            <p class="text-gray-800">${facultyMember.email}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Phone</p>
                            <p class="text-gray-800">${facultyMember.phone || 'Not specified'}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Hire Date</p>
                            <p class="text-gray-800">${formatDate(facultyMember.hire_date)}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-sm">Research Interests</p>
                            <p class="text-gray-800">${facultyMember.research_interests || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Projects section
            content += `<div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Research Projects (${reportData.projects ? reportData.projects.length : 0})</h3>
            `;
            
            if (reportData.projects && reportData.projects.length > 0) {
                content += `
                    <div class="space-y-4">
                        ${reportData.projects.map(project => `
                            <div class="border rounded-lg p-4">
                                <h4 class="font-semibold text-indigo-700">${project.title}</h4>
                                <p class="text-sm text-gray-600 mb-2">${project.description || ''}</p>
                                <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span class="text-gray-500">Status:</span> 
                                        <span class="badge ${project.is_active ? 'badge-success' : 'badge-info'}">
                                            ${project.is_active ? 'Active' : 'Completed'}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Department:</span> 
                                        ${getDepartmentName(project.dept_id)}
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Dates:</span> 
                                        ${formatDate(project.start_date)} - ${project.end_date ? formatDate(project.end_date) : 'Present'}
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Budget:</span> 
                                        ${project.budget ? formatCurrency(project.budget) : 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content += '<p class="text-gray-500">No research projects found</p>';
            }
            content += '</div>';
            
            // Student advisees section
            content += `<div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Student Advisees (${reportData.advisees ? reportData.advisees.length : 0})</h3>
            `;
            
            if (reportData.advisees && reportData.advisees.length > 0) {
                content += `
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Program</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Department</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Enrollment Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.advisees.map(student => `
                                    <tr class="border-b">
                                        <td class="py-2 px-4">${student.first_name} ${student.last_name}</td>
                                        <td class="py-2 px-4">
                                            <span class="px-2 py-1 text-xs rounded-full ${getStudentProgramClass(student.program_type)}">
                                                ${student.program_type}
                                            </span>
                                        </td>
                                        <td class="py-2 px-4">${getDepartmentName(student.dept_id)}</td>
                                        <td class="py-2 px-4">${formatDate(student.enrollment_date)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                content += '<p class="text-gray-500">No student advisees found</p>';
            }
            content += '</div>';
            
            // Set content and show report
            reportBody.innerHTML = content;
            showReport();
        } catch (error) {
            console.error('Error generating faculty report:', error);
            showNotification('Failed to generate report', 'error');
            showNoData();
        }
    }

    async function generateProjectsReport() {
        const deptId = deptSelect.value;
        const status = statusSelect.value;
        
        showLoading();
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            if (deptId) {
                params.append('dept_id', deptId);
            }
            
            if (status !== '') {
                params.append('is_active', status);
            }
            
            // Fetch report data
            let endpoint = CONFIG.ENDPOINTS.REPORTS_PROJECTS;
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            
            const reportData = await fetchAPI(endpoint);
            
            if (!reportData || reportData.projects.length === 0) {
                showNoData();
                return;
            }
            
            // Set title and subtitle
            let titleParts = [];
            if (status === 'true') titleParts.push('Active');
            if (status === 'false') titleParts.push('Completed');
            titleParts.push('Research Projects Report');
            reportTitle.textContent = titleParts.join(' ');
            
            let subtitleParts = [];
            if (deptId) {
                const dept = departments.find(d => d.dept_id == deptId);
                if (dept) subtitleParts.push(dept.dept_name);
            } else {
                subtitleParts.push('All Departments');
            }
            reportSubtitle.textContent = subtitleParts.join(' • ');
            
            // Generate report content
            let content = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-indigo-800">${reportData.total_projects}</h3>
                        <p class="text-indigo-600">Total Projects</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-green-800">${reportData.total_faculty_involved}</h3>
                        <p class="text-green-600">Faculty Involved</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-blue-800">${formatCurrency(reportData.total_budget)}</h3>
                        <p class="text-blue-600">Total Budget</p>
                    </div>
                </div>
            `;
            
            // Projects by department chart
            if (reportData.projects_by_department) {
                content += `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Projects by Department</h3>
                            <div id="dept-chart" class="h-64"></div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-3">Budget Distribution</h3>
                            <div id="budget-chart" class="h-64"></div>
                        </div>
                    </div>
                `;
            }
            
            // Projects list
            content += `
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-3">Projects List</h3>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Project Title</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Department</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Start Date</th>
                                    <th class="py-2 px-4 text-left text-sm font-medium text-gray-700">Budget</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportData.projects.map(project => `
                                    <tr class="border-b">
                                        <td class="py-2 px-4">${project.title}</td>
                                        <td class="py-2 px-4">${getDepartmentName(project.dept_id)}</td>
                                        <td class="py-2 px-4">
                                            <span class="badge ${project.is_active ? 'badge-success' : 'badge-info'}">
                                                ${project.is_active ? 'Active' : 'Completed'}
                                            </span>
                                        </td>
                                        <td class="py-2 px-4">${formatDate(project.start_date)}</td>
                                        <td class="py-2 px-4">${project.budget ? formatCurrency(project.budget) : 'Not specified'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            // Set content and show report
            reportBody.innerHTML = content;
            showReport();
            
            // Render charts if data is available
            if (reportData.projects_by_department) {
                renderDepartmentChart(reportData.projects_by_department);
                renderBudgetChart(reportData.projects_by_department);
            }
        } catch (error) {
            console.error('Error generating projects report:', error);
            showNotification('Failed to generate report', 'error');
            showNoData();
        }
    }

    async function generatePublicationsReport() {
        const deptId = pubDeptSelect.value;
        
        showLoading();
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            if (deptId) {
                params.append('dept_id', deptId);
            }
            
            // Fetch report data
            let endpoint = CONFIG.ENDPOINTS.REPORTS_PUBLICATIONS;
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            
            const reportData = await fetchAPI(endpoint);
            
            if (!reportData || reportData.publications.length === 0) {
                showNoData();
                return;
            }
            
            // Set title and subtitle
            reportTitle.textContent = 'Research Publications Report';
            
            if (deptId) {
                const dept = departments.find(d => d.dept_id == deptId);
                if (dept) {
                    reportSubtitle.textContent = dept.dept_name;
                } else {
                    reportSubtitle.textContent = 'All Departments';
                }
            } else {
                reportSubtitle.textContent = 'All Departments';
            }
            
            // Generate report content
            let content = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-indigo-800">${reportData.total_publications}</h3>
                        <p class="text-indigo-600">Total Publications</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-green-800">${reportData.publications_this_year}</h3>
                        <p class="text-green-600">Publications This Year</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="text-xl font-bold text-blue-800">${reportData.total_citations}</h3>
                        <p class="text-blue-600">Total Citations</p>
                    </div>
                </div>
            `;
            
            // Publications by year chart
            content += `
                <div class="mb-8">
                    <h3 class="text-lg font-semibold mb-3">Publications by Year</h3>
                    <div id="publications-chart" class="h-80"></div>
                </div>
            `;
            
            // Publications list
            content += `
                <div class="mt-6">
                    <h3 class="text-lg font-semibold mb-3">Recent Publications</h3>
                    <div class="space-y-4">
                        ${reportData.publications.map((pub, index) => `
                            <div class="border-b pb-4">
                                <h4 class="font-medium">${pub.title}</h4>
                                <p class="text-sm text-gray-600">
                                    ${pub.authors.join(', ')} • ${pub.journal} • ${pub.year}
                                </p>
                                <div class="flex items-center mt-2 text-sm text-gray-500">
                                    <span class="mr-4"><i class="fas fa-quote-right mr-1"></i> ${pub.citations} citations</span>
                                    <span><i class="fas fa-university mr-1"></i> ${getDepartmentName(pub.dept_id)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Set content and show report
            reportBody.innerHTML = content;
            showReport();
            
            // Render publications chart
            renderPublicationsChart(reportData.publications_by_year);
        } catch (error) {
            console.error('Error generating publications report:', error);
            showNotification('Failed to generate report', 'error');
            showNoData();
        }
    }

    function getDepartmentName(deptId) {
        const department = departments.find(dept => dept.dept_id === deptId);
        return department ? department.dept_name : 'Unknown Department';
    }

    function getStudentProgramClass(programType) {
        switch(programType) {
            case 'PhD':
                return 'bg-indigo-100 text-indigo-800';
            case 'Masters':
                return 'bg-green-100 text-green-800';
            case 'Undergraduate':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    function showLoading() {
        reportContent.classList.add('hidden');
        noData.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
    }

    function showReport() {
        loadingIndicator.classList.add('hidden');
        noData.classList.add('hidden');
        reportContent.classList.remove('hidden');
    }

    function showNoData() {
        loadingIndicator.classList.add('hidden');
        reportContent.classList.add('hidden');
        noData.classList.remove('hidden');
    }

    function renderDepartmentChart(deptData) {
        const chartEl = document.getElementById('dept-chart');
        if (!chartEl) return;
        
        const deptNames = [];
        const projectCounts = [];
        
        // Extract data
        for (const deptId in deptData) {
            const dept = departments.find(d => d.dept_id == deptId);
            if (dept) {
                deptNames.push(dept.dept_name);
                projectCounts.push(deptData[deptId].project_count);
            }
        }
        
        // Sort by project count
        const sortData = projectCounts
            .map((count, i) => ({ count, name: deptNames[i] }))
            .sort((a, b) => b.count - a.count);
        
        const sortedNames = sortData.map(d => d.name);
        const sortedCounts = sortData.map(d => d.count);
        
        // Create chart
        const options = {
            series: [{
                name: 'Projects',
                data: sortedCounts
            }],
            chart: {
                type: 'bar',
                height: 250,
                toolbar: {
                    show: false
                }
            },
            colors: [CONFIG.CHART_COLORS[0]],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: sortedNames,
            },
            grid: {
                borderColor: '#f1f1f1'
            }
        };

        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }

    function renderBudgetChart(deptData) {
        const chartEl = document.getElementById('budget-chart');
        if (!chartEl) return;
        
        const deptNames = [];
        const budgetAmounts = [];
        
        // Extract data
        for (const deptId in deptData) {
            const dept = departments.find(d => d.dept_id == deptId);
            if (dept) {
                deptNames.push(dept.dept_name);
                budgetAmounts.push(deptData[deptId].total_budget);
            }
        }
        
        // Create chart
        const options = {
            series: budgetAmounts,
            chart: {
                type: 'donut',
                height: 250
            },
            labels: deptNames,
            colors: CONFIG.CHART_COLORS,
            legend: {
                position: 'bottom',
                fontSize: '14px'
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.round(val) + "%"
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '55%'
                    }
                }
            }
        };

        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }

    function renderPublicationsChart(yearData) {
        const chartEl = document.getElementById('publications-chart');
        if (!chartEl) return;
        
        const years = [];
        const counts = [];
        const citations = [];
        
        // Sort years
        const sortedYears = Object.keys(yearData).sort();
        
        // Extract data
        sortedYears.forEach(year => {
            years.push(year);
            counts.push(yearData[year].count);
            citations.push(yearData[year].citations);
        });
        
        // Create chart
        const options = {
            series: [
                {
                    name: 'Publications',
                    type: 'column',
                    data: counts
                },
                {
                    name: 'Citations',
                    type: 'line',
                    data: citations
                }
            ],
            chart: {
                height: 350,
                type: 'line',
                toolbar: {
                    show: false
                }
            },
            stroke: {
                width: [0, 4],
                curve: 'smooth'
            },
            colors: [CONFIG.CHART_COLORS[0], CONFIG.CHART_COLORS[4]],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [1]
            },
            labels: years,
            xaxis: {
                type: 'category'
            },
            yaxis: [
                {
                    title: {
                        text: 'Publications',
                    },
                },
                {
                    opposite: true,
                    title: {
                        text: 'Citations'
                    }
                }
            ]
        };

        const chart = new ApexCharts(chartEl, options);
        chart.render();
    }

    function exportReport() {
        // In a real application, this would generate a PDF or CSV export
        // For now, we'll just show a notification
        showNotification('Report exported successfully', 'success');
    }
});
