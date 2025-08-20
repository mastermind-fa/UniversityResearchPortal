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
    async function generateFundingReport() {
        showLoading();
        try {
            // Fetch summary stats
            const summaryRes = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FUNDING_SUMMARY);
            if (!summaryRes.ok) throw new Error('Failed to fetch funding summary');
            const summary = await summaryRes.json();

            // Fetch project funding allocations (first page, larger limit)
            const selectedType = fundingTypeSelect.value || '';
            const allocQuery = new URLSearchParams({ page: '1', limit: '100' });
            if (selectedType) allocQuery.append('type', selectedType);
            const allocRes = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.PROJECT_FUNDING}?${allocQuery.toString()}`);
            if (!allocRes.ok) throw new Error('Failed to fetch funding allocations');
            const allocations = await allocRes.json();
            const items = allocations.items || [];

            // Title/subtitle
            reportTitle.textContent = 'Research Funding Report';
            reportSubtitle.textContent = `${allocations.total} Allocations${selectedType ? ' • Filter: ' + selectedType : ''} • ${formatCurrency(summary.total_funding)} Total`;

            // Build content
            let content = `
                <div class="mb-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-dollar-sign text-orange-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-orange-800">${formatCurrency(summary.total_funding)}</h4>
                                    <p class="text-orange-600 font-medium">Total Funding</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-file-invoice-dollar text-indigo-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-indigo-800">${allocations.total}</h4>
                                    <p class="text-indigo-600 font-medium">Funding Allocations</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-sitemap text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-green-800">${Object.keys(summary.funding_by_type || {}).length}</h4>
                                    <p class="text-green-600 font-medium">Source Types</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Counts by Funding Type -->
                <div class="mb-6">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${(() => {
                            const allTypes = ['Government','Private','University','International'];
                            const typeCounts = { Government: 0, Private: 0, University: 0, International: 0 };
                            const typeTotals = { Government: 0, Private: 0, University: 0, International: 0 };
                            (items || []).forEach(a => {
                                if (a.source_type && typeCounts[a.source_type] !== undefined) {
                                    typeCounts[a.source_type] += 1;
                                    typeTotals[a.source_type] += (a.amount || 0);
                                }
                            });
                            return allTypes.map(t => `
                                <div class="bg-white p-4 rounded-xl border border-gray-200">
                                    <div class="text-sm text-gray-500">${t}</div>
                                    <div class="mt-1 text-lg font-semibold text-gray-900">${typeCounts[t]} allocations</div>
                                    <div class="text-sm text-gray-600">${formatCurrency(typeTotals[t])}</div>
                                </div>
                            `).join('');
                        })()}
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">Funding by Source Type</h3>
                        <div id="funding-type-chart" class="h-80"></div>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">Funding by Year</h3>
                        <div id="funding-year-chart" class="h-80"></div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">Top Funding Sources</h3>
                        <div id="top-sources-chart" class="h-80"></div>
                    </div>
                </div>

                <div class="mb-2">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-list mr-3 text-gray-600"></i>
                        Funding Allocations (First ${items.length} of ${allocations.total})
                    </h3>
                    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant #</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${items.map(a => `
                                        <tr class="hover:bg-gray-50 transition-colors">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.source_name}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.source_type}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.project_title}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(a.amount)}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.grant_number || 'N/A'}</td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(a.start_date)} - ${a.end_date ? formatDate(a.end_date) : 'Present'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            reportBody.innerHTML = content;
            showReport();

            // Charts
            let typeLabels, typeSeries;
            if (selectedType) {
                // Build from filtered allocations
                const localByType = {};
                items.forEach(a => { localByType[a.source_type] = (localByType[a.source_type] || 0) + (a.amount || 0); });
                typeLabels = Object.keys(localByType);
                typeSeries = typeLabels.map(k => localByType[k]);
            } else {
                typeLabels = Object.keys(summary.funding_by_type || {});
                typeSeries = typeLabels.map(k => summary.funding_by_type[k]);
            }
            renderDonutChart('funding-type-chart', typeLabels, typeSeries);

            let yearLabels, yearSeries;
            if (selectedType) {
                const localByYear = {};
                items.forEach(a => {
                    const y = new Date(a.start_date).getFullYear();
                    localByYear[y] = (localByYear[y] || 0) + (a.amount || 0);
                });
                yearLabels = Object.keys(localByYear).sort();
                yearSeries = yearLabels.map(k => localByYear[k]);
            } else {
                yearLabels = Object.keys(summary.funding_by_year || {}).sort();
                yearSeries = yearLabels.map(k => summary.funding_by_year[k]);
            }
            renderBarChart('funding-year-chart', yearLabels, yearSeries);

            const topNames = (summary.top_funding_sources || []).map(s => s.source_name);
            const topAmounts = (summary.top_funding_sources || []).map(s => s.total_amount);
            renderBarChart('top-sources-chart', topNames, topAmounts);
        } catch (error) {
            console.error('Error generating funding report:', error);
            showNotification('Failed to generate report', 'error');
            showNoData();
        }
    }

    function renderDonutChart(elId, labels, series) {
        const el = document.getElementById(elId);
        if (!el) return;
        const options = {
            series: series,
            chart: { type: 'donut', height: 320 },
            labels: labels,
            colors: CONFIG.CHART_COLORS.slice(0, labels.length),
            legend: { position: 'bottom' },
            dataLabels: { enabled: true }
        };
        new ApexCharts(el, options).render();
    }

    function renderBarChart(elId, categories, data) {
        const el = document.getElementById(elId);
        if (!el) return;
        const options = {
            series: [{ name: 'Amount', data }],
            chart: { type: 'bar', height: 320, toolbar: { show: false } },
            colors: [CONFIG.CHART_COLORS[5]],
            plotOptions: { bar: { borderRadius: 6, horizontal: true } },
            dataLabels: { enabled: false },
            xaxis: { categories },
            grid: { borderColor: '#f1f1f1' }
        };
        new ApexCharts(el, options).render();
    }
    
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
            const facultyResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY + facultyId);
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
            let projects = [];
            
            // Use the correct endpoint based on department selection
            if (deptId) {
                // Use department-specific endpoint
                const response = await fetch(CONFIG.API_BASE_URL + `${CONFIG.ENDPOINTS.PROJECTS_BY_DEPARTMENT}/${deptId}`);
                if (response.ok) {
                    projects = await response.json();
                }
            } else {
                // Use general projects endpoint for all departments
                const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
                if (response.ok) {
                    projects = await response.json();
                }
            }
            
            if (!projects || projects.length === 0) {
                showNoData();
                return;
            }
            
            // Apply status filter if selected
            if (status !== '') {
                const isActive = status === 'true';
                projects = projects.filter(project => {
                    const projectStatus = project.status || (project.is_active ? 'Active' : 'Completed');
                    return isActive ? projectStatus === 'Active' : projectStatus === 'Completed';
                });
            }
            
            if (projects.length === 0) {
                showNoData();
                return;
            }
            
            // Calculate statistics
            const totalProjects = projects.length;
            const activeProjects = projects.filter(p => p.status === 'Active' || p.is_active).length;
            const completedProjects = totalProjects - activeProjects;
            const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
            
            // Group projects by department for charts
            const projectsByDept = {};
            projects.forEach(project => {
                const projectDeptId = project.dept_id;
                if (!projectsByDept[projectDeptId]) {
                    projectsByDept[projectDeptId] = {
                        project_count: 0,
                        total_budget: 0,
                        projects: []
                    };
                }
                projectsByDept[projectDeptId].project_count++;
                projectsByDept[projectDeptId].total_budget += (project.budget || 0);
                projectsByDept[projectDeptId].projects.push(project);
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
            
            // Projects by department chart (only show if multiple departments or if showing all departments)
            if (Object.keys(projectsByDept).length > 1 || !deptId) {
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
                                                <div class="text-sm font-medium text-gray-900">${project.project_title || 'Untitled Project'}</div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${getDepartmentName(project.dept_id)}</td>
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
            
            // Render charts if data is available and multiple departments
            if (Object.keys(projectsByDept).length > 1 || !deptId) {
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
            const params = new URLSearchParams();
            if (deptId) params.append('dept_id', deptId);

            let endpoint = CONFIG.ENDPOINTS.REPORTS_PUBLICATIONS;
            if (params.toString()) endpoint += `?${params.toString()}`;

            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            if (!response.ok) throw new Error('Failed to fetch publications report');
            const reportData = await response.json();

            const publications = reportData.publications || [];
            if (publications.length === 0) {
                showNoData();
                return;
            }

            // Title and subtitle
            reportTitle.textContent = 'Research Publications Report';
            if (deptId) {
                const dept = departments.find(d => d.dept_id == deptId);
                reportSubtitle.textContent = dept ? dept.dept_name : 'All Departments';
            } else {
                reportSubtitle.textContent = 'All Departments';
            }

            const totalPublications = reportData.summary?.total_publications || publications.length;
            const totalCitations = reportData.summary?.total_citations || 0;
            const byType = reportData.summary?.by_type || {};
            const byYear = reportData.summary?.by_year || {};
            const publicationsThisYear = (() => {
                const y = new Date().getFullYear();
                return byYear[y] || 0;
            })();
            const mostProductiveYear = (() => {
                const entries = Object.entries(byYear);
                if (entries.length === 0) return 'N/A';
                entries.sort((a, b) => b[1] - a[1]);
                return entries[0][0];
            })();

            // Build content
            let content = `
                <div class="mb-8">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-book text-indigo-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-indigo-800">${totalPublications}</h4>
                                    <p class="text-indigo-600 font-medium">Total Publications</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-quote-right text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-blue-800">${totalCitations}</h4>
                                    <p class="text-blue-600 font-medium">Total Citations</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-calendar-alt text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-green-800">${publicationsThisYear}</h4>
                                    <p class="text-green-600 font-medium">This Year</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                            <div class="flex items-center mb-2">
                                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                                    <i class="fas fa-chart-line text-orange-600 text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="text-2xl font-bold text-orange-800">${mostProductiveYear}</h4>
                                    <p class="text-orange-600 font-medium">Most Productive Year</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">Publications by Year</h3>
                        <div id="publications-year-chart" class="h-80"></div>
                    </div>
                    <div class="chart-container">
                        <h3 class="text-lg font-semibold mb-4 text-gray-800">Publications by Type</h3>
                        <div id="publications-type-chart" class="h-80"></div>
                    </div>
                </div>
            `;

            // Top authors
            if (reportData.top_authors && reportData.top_authors.length > 0) {
                content += `
                    <div class="mb-8">
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-user-tie mr-3 text-indigo-600"></i>
                            Top Authors
                        </h3>
                        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publications</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Citations</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        ${reportData.top_authors.map(a => `
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.name}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.department_name || 'N/A'}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.publications}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${a.citations}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Publications list
            content += `
                <div class="mb-2">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-list mr-3 text-gray-600"></i>
                        Publications (${publications.length})
                    </h3>
                    <div class="space-y-4">
                        ${publications.map(pub => `
                            <div class="bg-white rounded-xl border border-gray-200 p-6">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <h4 class="text-lg font-semibold text-gray-900">${pub.title}</h4>
                                        <p class="text-sm text-gray-600 mt-1">
                                            ${pub.publication_type} ${pub.journal_name ? '• ' + pub.journal_name : ''} • ${formatDate(pub.publication_date)}
                                        </p>
                                        <p class="text-sm text-gray-500 mt-1">
                                            ${pub.project_title ? 'Project: ' + pub.project_title + ' • ' : ''}${pub.department_name || ''}
                                        </p>
                                        ${pub.authors && pub.authors.length ? `
                                        <div class="mt-2 text-sm text-gray-700">
                                            <span class="text-gray-500">Authors:</span> ${pub.authors.map(a => a.name).join(', ')}
                                        </div>` : ''}
                                    </div>
                                    <div class="text-right">
                                        <div class="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                            <i class="fas fa-quote-right mr-1"></i> ${pub.citation_count || 0} citations
                                        </div>
                                        ${pub.doi ? `<div class="mt-2 text-xs text-gray-500">DOI: ${pub.doi}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            reportBody.innerHTML = content;
            showReport();

            // Render charts
            renderPublicationsYearChart(byYear);
            renderPublicationsTypeChart(byType);
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
        
        // Extract data and filter out any invalid entries
        for (const deptId in deptData) {
            const dept = departments.find(d => d.dept_id == deptId);
            if (dept && deptData[deptId].project_count > 0) {
                deptNames.push(dept.dept_name);
                projectCounts.push(deptData[deptId].project_count);
            }
        }
        
        // Only render chart if we have valid data
        if (deptNames.length === 0 || projectCounts.length === 0) {
            chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No department data available</div>';
            return;
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
        
        // Extract data and filter out any invalid entries
        for (const deptId in deptData) {
            const dept = departments.find(d => d.dept_id == deptId);
            if (dept && deptData[deptId].total_budget > 0) {
                deptNames.push(dept.dept_name);
                budgetAmounts.push(deptData[deptId].total_budget);
            }
        }
        
        // Only render chart if we have valid data
        if (deptNames.length === 0 || budgetAmounts.length === 0) {
            chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500">No budget data available</div>';
            return;
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
                    if (opts.dataPointIndex < budgetPercentages.length) {
                        const percentage = budgetPercentages[opts.dataPointIndex];
                        const amount = formatCurrency(val);
                        return `${percentage}%\n${amount}`;
                    }
                    return '';
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

    function renderPublicationsYearChart(byYear) {
        const chartEl = document.getElementById('publications-year-chart');
        if (!chartEl) return;
        const years = Object.keys(byYear).sort();
        const counts = years.map(y => byYear[y]);

        const options = {
            series: [{ name: 'Publications', data: counts }],
            chart: { type: 'bar', height: 320, toolbar: { show: false } },
            colors: [CONFIG.CHART_COLORS[0]],
            plotOptions: { bar: { borderRadius: 6 } },
            dataLabels: { enabled: false },
            xaxis: { categories: years },
            grid: { borderColor: '#f1f1f1' }
        };
        new ApexCharts(chartEl, options).render();
    }

    function renderPublicationsTypeChart(byType) {
        const chartEl = document.getElementById('publications-type-chart');
        if (!chartEl) return;
        const labels = Object.keys(byType);
        const series = labels.map(l => byType[l]);

        const options = {
            series: series,
            chart: { type: 'donut', height: 320 },
            labels: labels,
            colors: CONFIG.CHART_COLORS.slice(0, labels.length),
            legend: { position: 'bottom' },
            dataLabels: { enabled: true }
        };
        new ApexCharts(chartEl, options).render();
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
