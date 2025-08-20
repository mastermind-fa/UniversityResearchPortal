// Projects page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const projectsGrid = document.getElementById('projects-grid');
    const loadingIndicator = document.getElementById('loading');
    const noProjectsMessage = document.getElementById('no-projects');
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectModal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const projectForm = document.getElementById('project-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const editProjectBtn = document.getElementById('edit-project-btn');
    
    const projectSearchInput = document.getElementById('project-search');
    const departmentFilter = document.getElementById('department-filter');
    const statusFilter = document.getElementById('status-filter');
    const searchBtn = document.getElementById('search-btn');
    const resultsCountEl = document.getElementById('results-count');
    
    // Statistics elements
    const totalProjectsCount = document.getElementById('total-projects-count');
    const activeProjectsCount = document.getElementById('active-projects-count');
    const totalBudgetAmount = document.getElementById('total-budget-amount');
    const departmentsCount = document.getElementById('departments-count');
    
    // Pagination
    const paginationSection = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form fields
    const projectIdInput = document.getElementById('project-id');
    const projectTitleInput = document.getElementById('project-title');
    const projectDescriptionInput = document.getElementById('project-description');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const projectDepartmentSelect = document.getElementById('project-department');
    const budgetInput = document.getElementById('budget');
    const fundingSourceInput = document.getElementById('funding-source');
    const isActiveCheckbox = document.getElementById('is-active');
    const facultySelectionDiv = document.getElementById('faculty-selection');
    const studentSelectionDiv = document.getElementById('student-selection');

    // State variables
    let allProjects = [];
    let filteredProjects = [];
    let departments = [];
    let faculty = [];
    let students = [];
    let currentProjectId = null;
    let currentPage = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    
    // Initialize page
    console.log('🚀 Projects page script loaded!');
    console.log('🔧 CONFIG:', CONFIG);
    console.log('🌐 API Base URL:', CONFIG.API_BASE_URL);
    console.log('📋 Projects endpoint:', CONFIG.ENDPOINTS.PROJECTS);
    
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        filterProjects();
    });

    // Modal events
    addProjectBtn.addEventListener('click', showAddProjectModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    projectForm.addEventListener('submit', saveProject);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    editProjectBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
        if (currentProjectId) {
            showEditProjectModal(currentProjectId);
        }
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProjects();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredProjects.length) {
            currentPage++;
            renderProjects();
        }
    });

    async function initPage() {
        try {
            // Load departments first
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            populateDepartmentFilters();
            
            // Load faculty and students
            faculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
            students = await fetchAPI(CONFIG.ENDPOINTS.STUDENTS);
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
        
        await loadProjects();
        await loadStatistics();
    }

    function populateDepartmentFilters() {
        // Clear existing options except the first one
        while (departmentFilter.options.length > 1) {
            departmentFilter.remove(1);
        }
        
        projectDepartmentSelect.innerHTML = '<option value="">Select Department</option>';
        
        // Add department options
        departments.forEach(dept => {
            const option1 = document.createElement('option');
            option1.value = dept.dept_id;
            option1.textContent = dept.dept_name;
            departmentFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = dept.dept_id;
            option2.textContent = dept.dept_name;
            projectDepartmentSelect.appendChild(option2);
        });
    }

    function populateTeamSelections(selectedFaculty = [], selectedStudents = []) {
        // Populate faculty selection
        facultySelectionDiv.innerHTML = faculty.length === 0 ? 
            '<div class="text-gray-500">No faculty members available</div>' : '';
        
        if (faculty.length > 0) {
            const facultyByDept = {};
            
            // Group faculty by department
            faculty.forEach(f => {
                if (!facultyByDept[f.dept_id]) {
                    facultyByDept[f.dept_id] = [];
                }
                facultyByDept[f.dept_id].push(f);
            });
            
            // Create faculty checkboxes by department
            Object.keys(facultyByDept).forEach(deptId => {
                const dept = departments.find(d => d.dept_id === parseInt(deptId));
                const deptName = dept ? dept.dept_name : 'Unknown Department';
                
                const deptSection = document.createElement('div');
                deptSection.className = 'mb-3';
                deptSection.innerHTML = `<h5 class="font-medium text-indigo-800 mb-1">${deptName}</h5>`;
                
                const facultyList = document.createElement('div');
                facultyList.className = 'space-y-1 pl-2';
                
                facultyByDept[deptId].forEach(f => {
                    const isChecked = selectedFaculty.includes(f.faculty_id);
                    
                    facultyList.innerHTML += `
                        <div class="flex items-center">
                            <input type="checkbox" id="faculty-${f.faculty_id}" name="faculty" 
                                value="${f.faculty_id}" class="form-checkbox h-4 w-4 text-indigo-600"
                                ${isChecked ? 'checked' : ''}>
                            <label for="faculty-${f.faculty_id}" class="ml-2 text-sm">
                                ${f.first_name} ${f.last_name} 
                                <span class="text-gray-500">(${f.position || 'Faculty'})</span>
                            </label>
                        </div>
                    `;
                });
                
                deptSection.appendChild(facultyList);
                facultySelectionDiv.appendChild(deptSection);
            });
        }
        
        // Populate student selection
        studentSelectionDiv.innerHTML = students.length === 0 ? 
            '<div class="text-gray-500">No students available</div>' : '';
        
        if (students.length > 0) {
            const studentsByProgram = {
                'PhD': [],
                'Masters': [],
                'Undergraduate': []
            };
            
            // Group students by program type
            students.forEach(s => {
                if (studentsByProgram[s.program_type]) {
                    studentsByProgram[s.program_type].push(s);
                } else {
                    studentsByProgram['Other'] = studentsByProgram['Other'] || [];
                    studentsByProgram['Other'].push(s);
                }
            });
            
            // Create student checkboxes by program
            Object.keys(studentsByProgram).forEach(program => {
                if (studentsByProgram[program].length === 0) return;
                
                const programSection = document.createElement('div');
                programSection.className = 'mb-3';
                programSection.innerHTML = `<h5 class="font-medium text-indigo-800 mb-1">${program} Students</h5>`;
                
                const studentList = document.createElement('div');
                studentList.className = 'space-y-1 pl-2';
                
                studentsByProgram[program].forEach(s => {
                    const isChecked = selectedStudents.includes(s.student_id);
                    const deptName = getDepartmentName(s.dept_id);
                    
                    studentList.innerHTML += `
                        <div class="flex items-center">
                            <input type="checkbox" id="student-${s.student_id}" name="student" 
                                value="${s.student_id}" class="form-checkbox h-4 w-4 text-indigo-600"
                                ${isChecked ? 'checked' : ''}>
                            <label for="student-${s.student_id}" class="ml-2 text-sm">
                                ${s.first_name} ${s.last_name} 
                                <span class="text-gray-500">(${deptName})</span>
                            </label>
                        </div>
                    `;
                });
                
                programSection.appendChild(studentList);
                studentSelectionDiv.appendChild(programSection);
            });
        }
    }

    async function loadProjects() {
        console.log('🔍 Starting to load projects...');
        
        // Show loading
        if (projectsGrid) projectsGrid.classList.add('hidden');
        if (paginationSection) paginationSection.classList.add('hidden');
        if (noProjectsMessage) noProjectsMessage.classList.add('hidden');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        
        try {
            // Fetch projects from backend API
            const apiUrl = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS;
            console.log('🌐 Fetching from:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allProjects = await response.json();
            console.log('✅ Loaded projects:', allProjects);
            console.log('📊 Total projects found:', allProjects.length);
            
            // Apply initial filtering
            filterProjects();
        } catch (error) {
            console.error('❌ Error loading projects:', error);
            showNotification('Failed to load research projects', 'error');
            if (noProjectsMessage) noProjectsMessage.classList.remove('hidden');
        } finally {
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }
    }

    async function loadStatistics() {
        try {
            if (allProjects.length > 0) {
                // Calculate statistics
                const totalProjects = allProjects.length;
                const activeProjects = allProjects.filter(p => p.status === 'Active').length;
                const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
                const uniqueDepartments = new Set(allProjects.map(p => p.dept_id)).size;
                
                // Update statistics display
                if (totalProjectsCount) totalProjectsCount.textContent = totalProjects;
                if (activeProjectsCount) activeProjectsCount.textContent = activeProjects;
                if (totalBudgetAmount) totalBudgetAmount.textContent = formatCurrency(totalBudget);
                if (departmentsCount) departmentsCount.textContent = uniqueDepartments;
                
                console.log('Statistics loaded:', { totalProjects, activeProjects, totalBudget, uniqueDepartments });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    function filterProjects() {
        console.log('🔍 Filtering projects...');
        console.log('📊 All projects:', allProjects);
        
        const searchTerm = projectSearchInput ? projectSearchInput.value.trim().toLowerCase() : '';
        const deptId = departmentFilter && departmentFilter.value ? parseInt(departmentFilter.value) : null;
        const status = statusFilter && statusFilter.value ? statusFilter.value : '';
        
        console.log('🔍 Search term:', searchTerm);
        console.log('🏢 Department filter:', deptId);
        console.log('📋 Status filter:', status);
        
        filteredProjects = allProjects.filter(project => {
            const title = project.project_title ? project.project_title.toLowerCase() : '';
            const description = project.description ? project.description.toLowerCase() : '';
            
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm) || 
                description.includes(searchTerm);
            
            const matchesDepartment = !deptId || project.dept_id === deptId;
            const matchesStatus = !status || project.status === status;
            
            return matchesSearch && matchesDepartment && matchesStatus;
        });
        
        console.log('✅ Filtered projects:', filteredProjects);
        console.log('📊 Filtered count:', filteredProjects.length);
        
        updateResultsCount();
        renderProjects();
    }

    function updateResultsCount() {
        if (resultsCountEl) {
            if (filteredProjects.length === allProjects.length) {
                resultsCountEl.textContent = 'Showing all projects';
            } else {
                resultsCountEl.textContent = `Showing ${filteredProjects.length} of ${allProjects.length} projects`;
            }
        }
    }

        async function renderProjects() {
        console.log('🎨 Starting to render projects...');
        console.log('📊 Projects grid element:', projectsGrid);
        
        // Clear existing projects
        const gridContainer = projectsGrid.querySelector('.projects-grid');
        console.log('🔍 Grid container found:', gridContainer);
        
        if (gridContainer) {
            gridContainer.innerHTML = '';
        }
        
        if (filteredProjects.length === 0) {
            console.log('❌ No projects to display');
            projectsGrid.classList.add('hidden');
            paginationSection.classList.add('hidden');
            noProjectsMessage.classList.remove('hidden');
            return;
        }
        
        console.log('✅ Rendering projects...');
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredProjects.length);
        const pageData = filteredProjects.slice(start, end);
        
        console.log('📄 Page data:', pageData);
        
        // Update pagination UI
        if (showingStart) showingStart.textContent = start + 1;
        if (showingEnd) showingEnd.textContent = end;
        if (totalItems) totalItems.textContent = filteredProjects.length;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = end >= filteredProjects.length;
        
        // Render each project
        for (const project of pageData) {
            console.log('🎯 Rendering project:', project);
            const departmentName = getDepartmentName(project.dept_id);
            
            // Fetch actual collaborator counts
            const [facultyCount, studentCount] = await Promise.all([
                getProjectFacultyCount(project.project_id),
                getProjectStudentCount(project.project_id)
            ]);
            
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow-lg p-6 border border-gray-200 project-card';
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold text-indigo-800 line-clamp-2">${project.project_title || 'Untitled Project'}</h3>
                    <span class="status-badge ${
                        project.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                    }">
                        ${project.status || 'Unknown'}
                    </span>
                </div>
                
                <p class="text-gray-600 mb-4 line-clamp-2" title="${project.description || ''}">
                    ${project.description || 'No description provided'}
                </p>
                
                <div class="space-y-3 mb-4">
                    <div class="flex items-center text-sm">
                        <i class="fas fa-building text-indigo-500 mr-2 w-4"></i>
                        <span class="text-gray-600">${departmentName}</span>
                    </div>
                    <div class="flex items-center text-sm">
                        <i class="fas fa-calendar text-indigo-500 mr-2 w-4"></i>
                        <span class="text-gray-600">${formatDate(project.start_date)} - ${project.end_date ? formatDate(project.end_date) : 'Present'}</span>
                    </div>
                    ${project.budget ? `
                        <div class="flex items-center text-sm">
                            <i class="fas fa-dollar-sign text-indigo-500 mr-2 w-4"></i>
                            <span class="text-gray-600">${formatCurrency(project.budget)}</span>
                        </div>
                    ` : ''}
                    ${project.principal_investigator_id ? `
                        <div class="flex items-center text-sm">
                            <i class="fas fa-user-tie text-indigo-500 mr-2 w-4"></i>
                            <span class="text-gray-600">PI: ${getFacultyName(project.principal_investigator_id)}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center text-sm">
                            <i class="fas fa-user-tie text-indigo-600 mr-2"></i>
                            <span class="font-medium text-indigo-700">${facultyCount}</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <i class="fas fa-user-graduate text-green-600 mr-2"></i>
                            <span class="text-green-700">${studentCount}</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button class="view-btn bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-colors" 
                            title="View Details" data-id="${project.project_id}">
                            <i class="fas fa-eye mr-1"></i>View
                        </button>
                        <button class="edit-btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors" 
                            title="Edit Project" data-id="${project.project_id}">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button class="delete-btn bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors" 
                            title="Delete Project" data-id="${project.project_id}">
                            <i class="fas fa-trash-alt mr-1"></i>Delete
                        </button>
                    </div>
                </div>
            `;
            
            if (gridContainer) {
                gridContainer.appendChild(card);
                console.log('✅ Card added to grid');
            } else {
                console.log('❌ Grid container not found');
            }
            
            // Action buttons
            card.querySelector('.view-btn').addEventListener('click', () => viewProject(project.project_id));
            card.querySelector('.edit-btn').addEventListener('click', () => showEditProjectModal(project.project_id));
            card.querySelector('.delete-btn').addEventListener('click', () => showDeleteConfirmation(project.project_id));
        }
        
        projectsGrid.classList.remove('hidden');
        paginationSection.classList.remove('hidden');
        console.log('✅ Projects rendering complete');
    }

    function getDepartmentName(deptId) {
        const department = departments.find(dept => dept.dept_id === deptId);
        return department ? department.dept_name : 'Unknown Department';
    }

    function getFacultyName(facultyId) {
        const facultyMember = faculty.find(f => f.faculty_id === facultyId);
        return facultyMember ? `${facultyMember.first_name} ${facultyMember.last_name}` : 'Unknown Faculty';
    }

    async function getProjectFacultyCount(projectId) {
        try {
            const url = `${CONFIG.API_BASE_URL}/project-collaborators/?project_id=${projectId}`;
            console.log(`🔍 Fetching faculty collaborators from: ${url}`);
            
            const response = await fetch(url);
            console.log(`📡 Faculty response status: ${response.status}`);
            
            if (response.ok) {
                const collaborators = await response.json();
                console.log(`👥 Faculty collaborators for project ${projectId}:`, collaborators);
                console.log(`📊 Faculty count: ${collaborators.length}`);
                return collaborators.length;
            }
            console.log(`❌ Faculty response not ok: ${response.status}`);
            return 0;
        } catch (error) {
            console.error('❌ Error fetching faculty collaborators:', error);
            return 0;
        }
    }

    async function getProjectStudentCount(projectId) {
        try {
            const url = `${CONFIG.API_BASE_URL}/student-research/?project_id=${projectId}`;
            console.log(`🔍 Fetching student researchers from: ${url}`);
            
            const response = await fetch(url);
            console.log(`📡 Student response status: ${response.status}`);
            
            if (response.ok) {
                const students = await response.json();
                console.log(`👥 Student researchers for project ${projectId}:`, students);
                console.log(`📊 Student count: ${students.length}`);
                return students.length;
            }
            console.log(`❌ Student response not ok: ${response.status}`);
            return 0;
        } catch (error) {
            console.error('❌ Error fetching student researchers:', error);
            return 0;
        }
    }

    function showAddProjectModal() {
        // Reset form
        projectForm.reset();
        projectIdInput.value = '';
        isActiveCheckbox.checked = true;
        modalTitle.textContent = 'Add Research Project';
        
        // Set default start date to today
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        
        // Populate team selections with no selected members
        populateTeamSelections();
        
        // Show modal
        projectModal.classList.remove('hidden');
    }

    function showEditProjectModal(projectId) {
        const project = allProjects.find(p => p.project_id === projectId);
        if (!project) return;
        
        // Set form values
        projectIdInput.value = project.project_id;
        projectTitleInput.value = project.title;
        projectDescriptionInput.value = project.description || '';
        startDateInput.value = project.start_date;
        endDateInput.value = project.end_date || '';
        projectDepartmentSelect.value = project.dept_id;
        budgetInput.value = project.budget || '';
        fundingSourceInput.value = project.funding_source || '';
        isActiveCheckbox.checked = project.is_active;
        
        // Get selected faculty and students
        const selectedFaculty = project.faculty_members ? 
            project.faculty_members.map(f => f.faculty_id) : [];
        
        const selectedStudents = project.students ?
            project.students.map(s => s.student_id) : [];
        
        // Populate team selections
        populateTeamSelections(selectedFaculty, selectedStudents);
        
        modalTitle.textContent = 'Edit Research Project';
        
        // Show modal
        projectModal.classList.remove('hidden');
    }

    function closeModal() {
        projectModal.classList.add('hidden');
    }

    async function saveProject(e) {
        e.preventDefault();
        
        // Get selected faculty and students
        const selectedFaculty = Array.from(
            document.querySelectorAll('input[name="faculty"]:checked')
        ).map(input => parseInt(input.value));
        
        const selectedStudents = Array.from(
            document.querySelectorAll('input[name="student"]:checked')
        ).map(input => parseInt(input.value));
        
        const projectData = {
            title: projectTitleInput.value.trim(),
            description: projectDescriptionInput.value.trim() || null,
            start_date: startDateInput.value,
            end_date: endDateInput.value || null,
            is_active: isActiveCheckbox.checked,
            budget: budgetInput.value ? parseFloat(budgetInput.value) : null,
            funding_source: fundingSourceInput.value.trim() || null,
            dept_id: parseInt(projectDepartmentSelect.value),
            faculty_ids: selectedFaculty,
            student_ids: selectedStudents
        };
        
        const isEditing = projectIdInput.value;
        
        try {
            let endpoint = CONFIG.ENDPOINTS.PROJECTS;
            let method = 'POST';
            
            if (isEditing) {
                endpoint = `${endpoint}/${projectIdInput.value}`;
                method = 'PUT';
            }
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification(
                `Project ${isEditing ? 'updated' : 'created'} successfully`, 
                'success'
            );
            
            closeModal();
            await loadProjects();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} project:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} project`, 'error');
        }
    }

    function showDeleteConfirmation(projectId) {
        currentProjectId = projectId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = deleteProject;
    }

    async function deleteProject() {
        if (!currentProjectId) return;
        
        try {
            const endpoint = `${CONFIG.ENDPOINTS.PROJECTS}/${currentProjectId}`;
            const options = {
                method: 'DELETE'
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification('Project deleted successfully', 'success');
            deleteModal.classList.add('hidden');
            await loadProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            showNotification('Failed to delete project', 'error');
        } finally {
            currentProjectId = null;
        }
    }

    function viewProject(projectId) {
        const project = allProjects.find(p => p.project_id === projectId);
        if (!project) return;
        
        currentProjectId = projectId;
        const departmentName = getDepartmentName(project.dept_id);
        
        // Show project details
        const projectDetails = document.getElementById('project-details');
        projectDetails.innerHTML = `
            <h2 class="text-2xl font-bold text-indigo-800 mb-4">
                ${project.project_title || 'Untitled Project'}
                <span class="ml-2 status-badge ${
                    project.status === 'Active' ? 'bg-green-100 text-green-700' : 
                    project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                }">
                    ${project.status || 'Unknown'}
                </span>
            </h2>
            
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 class="font-medium text-indigo-700 mb-2">Project Description</h3>
                <p class="text-gray-700">
                    ${project.description || 'No description provided'}
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                    <p class="text-gray-500 text-sm">Department</p>
                    <p class="text-gray-800 font-medium">${departmentName}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Duration</p>
                    <p class="text-gray-800 font-medium">
                        ${formatDate(project.start_date)} - ${project.end_date ? formatDate(project.end_date) : 'Present'}
                    </p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Budget</p>
                    <p class="text-gray-800 font-medium">${project.budget ? formatCurrency(project.budget) : 'Not specified'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Principal Investigator</p>
                    <p class="text-gray-800 font-medium">${project.principal_investigator_id ? getFacultyName(project.principal_investigator_id) : 'Not specified'}</p>
                </div>
            </div>
        `;
        
        // Show faculty members
        const facultyMembersDiv = document.getElementById('faculty-members');
        if (project.faculty_members && project.faculty_members.length > 0) {
            facultyMembersDiv.innerHTML = project.faculty_members.map(f => `
                <div class="flex items-center p-2 hover:bg-gray-50 rounded">
                    <div class="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">
                        ${f.first_name.charAt(0)}${f.last_name.charAt(0)}
                    </div>
                    <div>
                        <p class="font-medium">${f.first_name} ${f.last_name}</p>
                    </div>
                </div>
            `).join('');
        } else {
            facultyMembersDiv.innerHTML = '<p class="text-gray-500">No faculty members assigned to this project</p>';
        }
        
        // Show student researchers
        const studentResearchersDiv = document.getElementById('student-researchers');
        if (project.students && project.students.length > 0) {
            studentResearchersDiv.innerHTML = project.students.map(s => `
                <div class="flex items-center p-2 hover:bg-gray-50 rounded">
                    <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3">
                        ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                    </div>
                    <div>
                        <p class="font-medium">${s.first_name} ${s.last_name}</p>
                    </div>
                </div>
            `).join('');
        } else {
            studentResearchersDiv.innerHTML = '<p class="text-gray-500">No students assigned to this project</p>';
        }
        
        detailModal.classList.remove('hidden');
    }

    // Utility functions
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return dateString;
        }
    }

    function formatCurrency(amount) {
        if (!amount) return 'N/A';
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch (error) {
            return `$${amount}`;
        }
    }
});
