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
            const deptResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.DEPARTMENTS);
            if (deptResponse.ok) {
                departments = await deptResponse.json();
            }
            
            // Load faculty  
            const facultyResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY);
            if (facultyResponse.ok) {
                faculty = await facultyResponse.json();
            }
            
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
            // First, get faculty details
            const facultyResponse = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.FACULTY}/${facultyId}`);
            let facultyMember = null;
            if (facultyResponse.ok) {
                facultyMember = await facultyResponse.json();
            }
            
            if (!facultyMember) {
                showNotification('Faculty member not found', 'error');
                showNoData();
                return;
            }
            
            // Get faculty's projects
            const projectsResponse = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.PROJECTS}?principal_investigator_id=${facultyId}`);
            let projects = [];
            if (projectsResponse.ok) {
                projects = await projectsResponse.json();
            }
            
            // Get faculty's students (advisees)
            const studentsResponse = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.STUDENTS}?advisor_id=${facultyId}`);
            let students = [];
            if (studentsResponse.ok) {
                students = await studentsResponse.json();
            }
            
            // Get faculty's publications
            const publicationsResponse = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.PUBLICATIONS}?faculty_id=${facultyId}`);
            let publications = [];
            if (publicationsResponse.ok) {
                publications = await publicationsResponse.json();
            }
            
            const departmentName = getDepartmentName(facultyMember.dept_id);
            
            // Set report title and subtitle
            reportTitle.textContent = `Faculty Research Report: ${facultyMember.first_name} ${facultyMember.last_name}`;
            reportSubtitle.textContent = `${facultyMember.position || 'Faculty Member'}, ${departmentName}`;
            
            // Generate report content
            let content = `
                <!-- Faculty Overview Section -->
                <div class="mb-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-flask text-indigo-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-indigo-800">${projects.length}</h4>
                                    <p class="text-indigo-600 font-medium">Research Projects</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-user-graduate text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-green-800">${students.length}</h4>
                                    <p class="text-green-600 font-medium">Student Advisees</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-book text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-blue-800">${publications.length}</h4>
                                    <p class="text-blue-600 font-medium">Publications</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Faculty Information Card -->
                    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user-tie mr-3 text-indigo-600"></i>
                            Faculty Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-3">
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Full Name</label>
                                    <p class="text-gray-900 font-semibold">${facultyMember.first_name} ${facultyMember.last_name}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Email</label>
                                    <p class="text-gray-900">${facultyMember.email || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Phone</label>
                                    <p class="text-gray-900">${facultyMember.phone || 'Not specified'}</p>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Department</label>
                                    <p class="text-gray-900 font-semibold">${departmentName}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Position</label>
                                    <p class="text-gray-900">${facultyMember.position || 'Faculty Member'}</p>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500">Hire Date</label>
                                    <p class="text-gray-900">${formatDate(facultyMember.hire_date) || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                        ${facultyMember.research_interests ? `
                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <label class="text-sm font-medium text-gray-500">Research Interests</label>
                            <p class="text-gray-900 mt-1">${facultyMember.research_interests}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            // Projects section
            content += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-project-diagram mr-3 text-green-600"></i>
                        Research Projects (${projects.length})
                    </h3>
            `;
            
            if (projects.length > 0) {
                content += `
                    <div class="space-y-4">
                        ${projects.map(project => `
                            <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                <div class="flex items-start justify-between mb-3">
                                    <h4 class="text-lg font-semibold text-gray-900">${project.project_title || 'Untitled Project'}</h4>
                                    <span class="px-3 py-1 text-xs font-medium rounded-full ${project.is_active ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                        ${project.is_active ? 'Active' : 'Completed'}
                                    </span>
                                </div>
                                ${project.description ? `<p class="text-gray-600 mb-4">${project.description}</p>` : ''}
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-500">Department:</span> 
                                        <span class="text-gray-900 font-medium">${getDepartmentName(project.dept_id)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Start Date:</span> 
                                        <span class="text-gray-900 font-medium">${formatDate(project.start_date)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">End Date:</span> 
                                        <span class="text-gray-900 font-medium">${project.end_date ? formatDate(project.end_date) : 'Present'}</span>
                                    </div>
                                </div>
                                ${project.budget ? `
                                <div class="mt-3 pt-3 border-t border-gray-100">
                                    <span class="text-gray-500">Budget:</span> 
                                    <span class="text-gray-900 font-bold text-lg">${formatCurrency(project.budget)}</span>
                                </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content += `
                    <div class="bg-gray-50 rounded-xl p-8 text-center">
                        <i class="fas fa-flask text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-600">No research projects found for this faculty member</p>
                    </div>
                `;
            }
            content += '</div>';
            
            // Student advisees section
            content += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-user-graduate mr-3 text-purple-600"></i>
                        Student Advisees (${students.length})
                    </h3>
            `;
            
            if (students.length > 0) {
                content += `
                    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${students.map(student => `
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="flex items-center">
                                                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                        <i class="fas fa-user text-purple-600 text-sm"></i>
                                                    </div>
                                                    <div class="text-sm font-medium text-gray-900">${student.first_name} ${student.last_name}</div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full ${getStudentProgramClass(student.program_type)}">
                                                    ${student.program_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getDepartmentName(student.dept_id)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(student.enrollment_date) || 'N/A'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                content += `
                    <div class="bg-gray-50 rounded-xl p-8 text-center">
                        <i class="fas fa-user-graduate text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-600">No student advisees found for this faculty member</p>
                    </div>
                `;
            }
            content += '</div>';
            
            // Publications section
            if (publications.length > 0) {
                content += `
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-book mr-3 text-blue-600"></i>
                            Publications (${publications.length})
                        </h3>
                        <div class="space-y-4">
                            ${publications.map(pub => `
                                <div class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                    <h4 class="text-lg font-semibold text-gray-900 mb-2">${pub.title || 'Untitled Publication'}</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span class="text-gray-500">Type:</span> 
                                            <span class="text-gray-900 font-medium">${pub.publication_type || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-500">Venue:</span> 
                                            <span class="text-gray-900 font-medium">${pub.venue || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-500">Date:</span> 
                                            <span class="text-gray-900 font-medium">${formatDate(pub.publication_date) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Set content and show report
            reportBody.innerHTML = content;
            showReport();
        } catch (error) {
            console.error('Error generating faculty report:', error);
            showNotification('Failed to generate report: ' + (error.message || 'Unknown error'), 'error');
            showNoData();
        }
    }

    async function generateProjectsReport() {
        const deptId = deptSelect.value;
        const status = statusSelect.value;
        
        showLoading();
        
        try {
            // Build query parameters for projects API
            const params = new URLSearchParams();
            
            if (deptId) {
                params.append('department_id', deptId);
            }
            
            if (status !== '') {
                params.append('status', status === 'true' ? 'Active' : 'Completed');
            }
            
            // Fetch projects data
            let endpoint = CONFIG.ENDPOINTS.PROJECTS;
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            
            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            let projects = [];
            if (response.ok) {
                projects = await response.json();
            }
            
            if (!projects || projects.length === 0) {
                showNoData();
                return;
            }
            
            // Calculate statistics
            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p.status === 'Active' || p.is_active).length;
            const completedProjects = totalProjects - activeProjects;
            const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
            
            // Group projects by department
            const projectsByDept = {};
            projects.forEach(project => {
                const deptId = project.dept_id || project.department_id;
                if (!projectsByDept[deptId]) {
                    projectsByDept[deptId] = {
                        project_count: 0,
                        total_budget: 0,
                        projects: []
                    };
                }
                projectsByDept[deptId].project_count++;
                projectsByDept[deptId].total_budget += (project.budget || 0);
                projectsByDept[deptId].projects.push(project);
            });
            
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
            subtitleParts.push(`${totalProjects} Projects`);
            reportSubtitle.textContent = subtitleParts.join(' • ');
            
            // Generate report content
            let content = `
                <!-- Projects Overview Section -->
                <div class="mb-8">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-project-diagram text-indigo-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-indigo-800">${totalProjects}</h4>
                                    <p class="text-indigo-600 font-medium">Total Projects</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-play-circle text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-green-800">${activeProjects}</h4>
                                    <p class="text-green-600 font-medium">Active Projects</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-check-circle text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-blue-800">${completedProjects}</h4>
                                    <p class="text-blue-600 font-medium">Completed</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                            <div class="flex items-center mb-3">
                                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-dollar-sign text-orange-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-orange-800">${formatCurrency(totalBudget)}</h4>
                                    <p class="text-orange-600 font-medium">Total Budget</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Projects by department chart
            if (Object.keys(projectsByDept).length > 0) {
                content += `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div class="chart-container">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">Projects by Department</h3>
                            <div id="dept-chart" class="h-80"></div>
                        </div>
                        <div class="chart-container">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">Budget Distribution</h3>
                            <div id="budget-chart" class="h-80"></div>
                        </div>
                    </div>
                `;
            }
            
            // Projects list
            content += `
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-list mr-3 text-gray-600"></i>
                        Projects List (${totalProjects})
                    </h3>
                    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Title</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${projects.map(project => `
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-medium text-gray-900">${project.project_title || project.title || 'Untitled Project'}</div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getDepartmentName(project.dept_id || project.department_id)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <span class="px-3 py-1 text-xs font-medium rounded-full ${(project.status === 'Active' || project.is_active) ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                                                    ${(project.status === 'Active' || project.is_active) ? 'Active' : 'Completed'}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(project.start_date)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${project.budget ? formatCurrency(project.budget) : 'Not specified'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            // Set content and show report
            reportBody.innerHTML = content;
            showReport();
            
            // Render charts if data is available
            if (Object.keys(projectsByDept).length > 0) {
                renderDepartmentChart(projectsByDept);
                renderBudgetChart(projectsByDept);
            }
        } catch (error) {
            console.error('Error generating projects report:', error);
            showNotification('Failed to generate report: ' + (error.message || 'Unknown error'), 'error');
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
            
            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            let reportData = null;
            if (response.ok) {
                reportData = await response.json();
            }
            
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
                height: 300,
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            colors: [CONFIG.CHART_COLORS[0]],
            plotOptions: {
                bar: {
                    borderRadius: 8,
                    horizontal: true,
                    distributed: true,
                    dataLabels: {
                        position: 'center'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val
                },
                style: {
                    fontSize: '12px',
                    colors: ['#fff']
                }
            },
            xaxis: {
                categories: sortedNames,
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            grid: {
                borderColor: '#f1f1f1',
                strokeDashArray: 5
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function (val) {
                        return val + ' projects'
                    }
                }
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
        
        // Calculate percentages for display
        const totalBudget = budgetAmounts.reduce((sum, amount) => sum + amount, 0);
        const budgetPercentages = budgetAmounts.map(amount => 
            totalBudget > 0 ? Math.round((amount / totalBudget) * 100) : 0
        );
        
        // Create chart
        const options = {
            series: budgetAmounts,
            chart: {
                type: 'donut',
                height: 300,
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            labels: deptNames,
            colors: CONFIG.CHART_COLORS.slice(0, deptNames.length),
            legend: {
                position: 'bottom',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                markers: {
                    width: 12,
                    height: 12,
                    radius: 6
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val, opts) {
                    const percentage = budgetPercentages[opts.dataPointIndex];
                    const amount = formatCurrency(val);
                    return `${percentage}%\n${amount}`;
                },
                style: {
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600'
                }
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
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '600',
                                color: '#374151'
                            },
                            value: {
                                show: true,
                                fontSize: '18px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '700',
                                color: '#1f2937',
                                formatter: function (val) {
                                    return formatCurrency(val);
                                }
                            },
                            total: {
                                show: true,
                                label: 'Total Budget',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: '600',
                                color: '#374151',
                                formatter: function (w) {
                                    return formatCurrency(w.globals.seriesTotals.reduce((a, b) => a + b, 0));
                                }
                            }
                        }
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return formatCurrency(val);
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

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    function formatCurrency(amount) {
        if (!amount || isNaN(amount)) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function getStudentProgramClass(programType) {
        if (!programType) return 'bg-gray-100 text-gray-800';
        
        switch(programType.toLowerCase()) {
            case 'phd':
                return 'bg-indigo-100 text-indigo-800';
            case 'masters':
            case 'ms':
                return 'bg-green-100 text-green-800';
            case 'undergraduate':
            case 'bs':
            case 'ba':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
});
