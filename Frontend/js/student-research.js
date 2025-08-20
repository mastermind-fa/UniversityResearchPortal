// Student Research page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const researchTable = document.getElementById('research-table');
    const researchContainer = document.getElementById('research-container');
    const loadingIndicator = document.getElementById('loading');
    const noResearchMessage = document.getElementById('no-research');
    const addResearchBtn = document.getElementById('add-research-btn');
    const researchModal = document.getElementById('research-modal');
    const modalTitle = document.getElementById('modal-title');
    const researchForm = document.getElementById('research-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const editResearchBtn = document.getElementById('edit-research-btn');
    
    // Statistics elements
    const totalResearchActivities = document.getElementById('total-research-activities');
    const activeStudents = document.getElementById('active-students');
    const completedProjects = document.getElementById('completed-projects');
    const facultyAdvisors = document.getElementById('faculty-advisors');
    
    // Search and filter elements
    const researchSearchInput = document.getElementById('research-search');
    const studentFilter = document.getElementById('student-filter');
    const facultyFilter = document.getElementById('faculty-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchBtn = document.getElementById('search-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const resultsCountEl = document.getElementById('results-count');
    
    // Pagination
    const paginationSection = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form fields
    const researchIdInput = document.getElementById('research-id');
    const titleInput = document.getElementById('research-title');
    const studentSelect = document.getElementById('student-select');
    const facultySelect = document.getElementById('faculty-select');
    const typeSelect = document.getElementById('research-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const statusSelect = document.getElementById('status');
    const descriptionInput = document.getElementById('description');
    const urlInput = document.getElementById('research-url');
    const keywordsInput = document.getElementById('keywords');
    const projectSelect = document.getElementById('project-select');

    // State variables
    let allResearch = [];
    let filteredResearch = [];
    let students = [];
    let faculty = [];
    let projects = [];
    let currentResearchId = null;
    let currentPage = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        filterResearch();
    });

    clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal events
    addResearchBtn.addEventListener('click', showAddResearchModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    researchForm.addEventListener('submit', saveResearch);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    editResearchBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
        if (currentResearchId) {
            showEditResearchModal(currentResearchId);
        }
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderResearch();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredResearch.length) {
            currentPage++;
            renderResearch();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            researchSearchInput.focus();
        }
    });

    // Search input events
    researchSearchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        filterResearch();
    }, 300));

    // Filter change events
    studentFilter.addEventListener('change', () => {
        currentPage = 1;
        filterResearch();
    });

    facultyFilter.addEventListener('change', () => {
        currentPage = 1;
        filterResearch();
    });

    typeFilter.addEventListener('change', () => {
        currentPage = 1;
        filterResearch();
    });

    // Close modals when clicking outside
    researchModal.addEventListener('click', (e) => {
        if (e.target === researchModal) {
            closeModal();
        }
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.add('hidden');
        }
    });
    
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.classList.add('hidden');
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!researchModal.classList.contains('hidden')) {
                closeModal();
            }
            if (!deleteModal.classList.contains('hidden')) {
                deleteModal.classList.add('hidden');
            }
            if (!detailModal.classList.contains('hidden')) {
                detailModal.classList.add('hidden');
            }
        }
    });

    /**
     * Initialize the page
     */
    async function initPage() {
        try {
            console.log('🚀 Initializing student research page...');
            
            // Load students, faculty, and projects for filters
            await Promise.all([
                loadStudents(),
                loadFaculty(),
                loadProjects()
            ]);
            
            // Populate filters and form selects
            populateFilters();
            populateFormSelects();
            
            // Load research activities
            await loadResearch();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
    }

    /**
     * Load students for filters
     */
    async function loadStudents() {
        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.STUDENTS);
            if (response.ok) {
                students = await response.json();
                console.log('Students loaded:', students);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    /**
     * Load faculty for filters
     */
    async function loadFaculty() {
        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY);
            if (response.ok) {
                faculty = await response.json();
                console.log('Faculty loaded:', faculty);
            }
        } catch (error) {
            console.error('Error loading faculty:', error);
        }
    }

    /**
     * Load projects for filters
     */
    async function loadProjects() {
        try {
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
            if (response.ok) {
                projects = await response.json();
                console.log('Projects loaded:', projects);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    /**
     * Populate filter dropdowns
     */
    function populateFilters() {
        // Populate project filter
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id;
            option.textContent = project.project_title;
            studentFilter.appendChild(option);
        });
        
        // Populate student filter
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = `${student.first_name} ${student.last_name}`;
            facultyFilter.appendChild(option);
        });
    }

    /**
     * Populate form select dropdowns
     */
    function populateFormSelects() {
        // Populate student select
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = `${student.first_name} ${student.last_name} (${student.program_type || 'Student'})`;
            studentSelect.appendChild(option);
        });
        
        // Populate faculty select
        faculty.forEach(f => {
            const option = document.createElement('option');
            option.value = f.faculty_id;
            option.textContent = `${f.first_name} ${f.last_name} (${f.position || 'Faculty'})`;
            facultySelect.appendChild(option);
        });
        
        // Populate project select
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id;
            option.textContent = project.project_title;
            projectSelect.appendChild(option);
        });
    }

    /**
     * Load research activities from API
     */
    async function loadResearch() {
        showLoading(true);
        
        try {
            console.log('📡 Loading research activities from API...');
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.STUDENT_RESEARCH);
            
            if (response.ok) {
                allResearch = await response.json();
                console.log('Research activities loaded:', allResearch);
                
                // Apply initial filters
                filterResearch();
                
                // Load statistics
                loadStatistics();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading research activities:', error);
            showNotification('Failed to load research activities', 'error');
        } finally {
            showLoading(false);
        }
    }

    /**
     * Load and display statistics
     */
    function loadStatistics() {
        try {
            console.log('📊 Loading statistics...');
            
            // Calculate statistics from student research data
            const totalActivities = allResearch.length;
            const uniqueStudents = [...new Set(allResearch.map(r => r.student_id))];
            const uniqueProjects = [...new Set(allResearch.map(r => r.project_id))];
            const activeResearchCount = allResearch.filter(r => !r.end_date).length;
            
            console.log('Statistics calculated:', {
                totalActivities,
                uniqueStudents: uniqueStudents.length,
                uniqueProjects: uniqueProjects.length,
                activeResearchCount
            });
            
            // Update statistics display
            if (totalResearchActivities) totalResearchActivities.textContent = totalActivities;
            if (activeStudents) activeStudents.textContent = uniqueStudents.length;
            if (completedProjects) completedProjects.textContent = uniqueProjects.length;
            if (facultyAdvisors) facultyAdvisors.textContent = activeResearchCount;
            
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    /**
     * Filter research activities based on search and filters
     */
    function filterResearch() {
        const searchTerm = researchSearchInput.value.trim().toLowerCase();
        const projectId = studentFilter.value;
        const facultyId = facultyFilter.value;
        const researchType = typeFilter.value;
        
        console.log('🔍 Filtering research activities:', { searchTerm, projectId, facultyId, researchType });
        
        // Apply filters for student research data structure
        filteredResearch = allResearch.filter(research => {
            // Find project and student details for search
            const project = projects.find(p => p.project_id === research.project_id) || {};
            const student = students.find(s => s.student_id === research.student_id) || {};
            
            // Filter by search term
            const titleMatches = project.project_title && project.project_title.toLowerCase().includes(searchTerm);
            const studentMatches = student.first_name && student.last_name && 
                `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm);
            const roleMatches = research.role && research.role.toLowerCase().includes(searchTerm);
            
            // Filter by project
            const projectIdMatches = !projectId || research.project_id === parseInt(projectId);
            
            // Filter by student
            const studentIdMatches = !facultyId || research.student_id === parseInt(facultyId);
            
            // Filter by type (using role instead)
            const typeMatches = !researchType || research.role === researchType;
            
            return (titleMatches || studentMatches || roleMatches) && projectIdMatches && studentIdMatches && typeMatches;
        });
        
        console.log('Filtered research activities:', filteredResearch);
        
        // Update results count
        updateResultsCount();
        
        // Render research activities
        renderResearch();
    }

    /**
     * Update results count display
     */
    function updateResultsCount() {
        if (resultsCountEl) {
            const total = filteredResearch.length;
            const searchQuery = researchSearchInput.value.trim();
            const projectFilterValue = studentFilter.value;
            const studentFilterValue = facultyFilter.value;
            const typeFilterValue = typeFilter.value;
            
            if (searchQuery || projectFilterValue || studentFilterValue || typeFilterValue) {
                resultsCountEl.textContent = `Showing ${total} filtered research activities`;
            } else {
                resultsCountEl.textContent = `Showing all ${total} research activities`;
            }
        }
    }

    /**
     * Clear all filters
     */
    function clearFilters() {
        researchSearchInput.value = '';
        studentFilter.value = '';
        facultyFilter.value = '';
        typeFilter.value = '';
        currentPage = 1;
        filterResearch();
    }

    /**
     * Render research activities in the table
     */
    function renderResearch() {
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredResearch.length);
        const pageResearch = filteredResearch.slice(startIndex, endIndex);
        
        // Update pagination UI
        showingStart.textContent = filteredResearch.length > 0 ? startIndex + 1 : 0;
        showingEnd.textContent = endIndex;
        totalItems.textContent = filteredResearch.length;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = endIndex >= filteredResearch.length;
        
        // Show/hide pagination
        paginationSection.classList.toggle('hidden', filteredResearch.length <= itemsPerPage);
        
        // Show appropriate UI based on results
        researchContainer.classList.toggle('hidden', pageResearch.length === 0);
        noResearchMessage.classList.toggle('hidden', pageResearch.length > 0);
        
        if (pageResearch.length === 0) {
            return;
        }
        
        // Clear the table
        researchTable.innerHTML = '';
        
        // Render each research activity
        pageResearch.forEach(research => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-200';
            
            // Find student and project details
            const student = students.find(s => s.student_id === research.student_id) || {};
            const project = projects.find(p => p.project_id === research.project_id) || {};
            
            // Format dates
            const startDate = research.start_date ? new Date(research.start_date).toLocaleDateString() : 'N/A';
            const endDate = research.end_date ? new Date(research.end_date).toLocaleDateString() : 'Present';
            
            row.innerHTML = `
                <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <div class="flex items-start">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 flex-shrink-0">
                            <i class="fas fa-project-diagram text-indigo-600 text-sm sm:text-base"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2">${project.project_title || 'Untitled Project'}</div>
                            <div class="text-xs sm:text-sm text-gray-500">ID: ${research.project_id || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <i class="fas fa-user-graduate text-green-600 text-xs sm:text-sm"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-xs sm:text-sm font-medium text-gray-900">${student.first_name || ''} ${student.last_name || ''}</div>
                            <div class="text-xs text-gray-500">ID: ${research.student_id || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span class="type-badge ${getTypeBadgeClass(research.role)} text-xs">${research.role || 'N/A'}</span>
                </td>
                <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <div>${startDate}</div>
                    <div class="text-xs text-gray-400">to ${endDate}</div>
                </td>
                <td class="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-student-id="${research.student_id}" data-project-id="${research.project_id}" class="delete-btn text-red-600 hover:text-red-900 transition-colors p-1 sm:p-2 rounded hover:bg-red-50">
                        <i class="fas fa-trash-alt text-sm sm:text-base"></i>
                    </button>
                </td>
            `;
            
            researchTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        setupEventDelegation();
    }

    /**
     * Setup event delegation for action buttons
     */
    function setupEventDelegation() {
        // Handle delete buttons only
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const studentId = parseInt(button.getAttribute('data-student-id'));
                const projectId = parseInt(button.getAttribute('data-project-id'));
                showDeleteConfirmation(studentId, projectId);
            });
        });
    }

    /**
     * Get status badge CSS class
     */
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Completed':
                return 'completed';
            case 'In Progress':
                return 'in-progress';
            case 'On Hold':
                return 'on-hold';
            case 'Abandoned':
                return 'abandoned';
            default:
                return 'in-progress';
        }
    }

    /**
     * Get type badge CSS class
     */
    function getTypeBadgeClass(type) {
        switch (type) {
            case 'Principal Investigator':
                return 'thesis';
            case 'Co-Investigator':
                return 'dissertation';
            case 'Consultant':
                return 'independent-study';
            case 'Collaborator':
                return 'research-project';
            case 'Data Science Consultant':
                return 'conference-paper';
            default:
                return 'research-project';
        }
    }

    /**
     * Show loading state
     */
    function showLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            researchContainer.classList.add('hidden');
            noResearchMessage.classList.add('hidden');
            paginationSection.classList.add('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Show add research modal
     */
    function showAddResearchModal() {
        modalTitle.textContent = 'Add Student Research Activity';
        
        // Clear form fields
        researchForm.reset();
        researchIdInput.value = '';
        
        // Default to current date
        startDateInput.value = new Date().toISOString().split('T')[0];
        
        // Show modal
        researchModal.classList.remove('hidden');
    }

    /**
     * Show edit research modal
     */
    function showEditResearchModal(researchId) {
        const research = allResearch.find(r => r.id === researchId);
        if (!research) return;
        
        modalTitle.textContent = 'Edit Student Research Activity';
        currentResearchId = researchId;
        
        // Fill form fields
        researchIdInput.value = research.id;
        titleInput.value = research.title || '';
        studentSelect.value = research.student_id || '';
        facultySelect.value = research.faculty_id || '';
        typeSelect.value = research.research_type || '';
        startDateInput.value = research.start_date ? new Date(research.start_date).toISOString().split('T')[0] : '';
        endDateInput.value = research.end_date ? new Date(research.end_date).toISOString().split('T')[0] : '';
        statusSelect.value = research.status || '';
        descriptionInput.value = research.description || '';
        urlInput.value = research.url || '';
        keywordsInput.value = research.keywords || '';
        projectSelect.value = research.project_id || '';
        
        // Show modal
        researchModal.classList.remove('hidden');
    }

    /**
     * Close research modal
     */
    function closeModal() {
        researchModal.classList.add('hidden');
        currentResearchId = null;
    }

    /**
     * Save research activity data
     */
    async function saveResearch(event) {
        event.preventDefault();
        
        // Validate form
        if (!researchForm.checkValidity()) {
            researchForm.reportValidity();
            return;
        }
        
        // Create research activity object
        const researchData = {
            title: titleInput.value.trim(),
            student_id: parseInt(studentSelect.value),
            faculty_id: parseInt(facultySelect.value),
            research_type: typeSelect.value,
            start_date: startDateInput.value,
            end_date: endDateInput.value || null,
            status: statusSelect.value,
            description: descriptionInput.value.trim() || null,
            url: urlInput.value.trim() || null,
            keywords: keywordsInput.value.trim() || null,
            project_id: projectSelect.value ? parseInt(projectSelect.value) : null
        };
        
        try {
            let response;
            const researchId = researchIdInput.value;
            
            if (researchId) {
                // Update existing research activity
                console.log('Updating research activity:', researchId);
                response = await fetchAPI(
                    `${CONFIG.ENDPOINTS.STUDENT_RESEARCH}/${researchId}`, 
                    'PUT', 
                    researchData
                );
                showNotification('Research activity updated successfully', 'success');
            } else {
                // Create new research activity
                console.log('Creating new research activity:', researchData);
                response = await fetchAPI(
                    CONFIG.ENDPOINTS.STUDENT_RESEARCH, 
                    'POST', 
                    researchData
                );
                showNotification('Research activity added successfully', 'success');
            }
            
            // Reload research activities
            await loadResearch();
            
            // Close modal
            closeModal();
        } catch (error) {
            console.error('Error saving research activity:', error);
            showNotification('Failed to save research activity: ' + (error.message || 'Unknown error'), 'error');
        }
    }

    /**
     * Show delete confirmation modal
     */
    function showDeleteConfirmation(studentId, projectId) {
        currentResearchId = { studentId, projectId };
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.STUDENT_RESEARCH}/${studentId}/${projectId}`, 'DELETE');
                showNotification('Student research activity deleted successfully', 'success');
                
                // Reload research activities
                await loadResearch();
            } catch (error) {
                console.error('Error deleting student research activity:', error);
                showNotification('Failed to delete student research activity', 'error');
            } finally {
                deleteModal.classList.add('hidden');
                currentResearchId = null;
            }
        };
    }

    /**
     * Show research activity details
     */
    function showResearchDetails(researchId) {
        const research = allResearch.find(r => r.id === researchId);
        if (!research) return;
        
        currentResearchId = researchId;
        
        // Find related entities
        const student = students.find(s => s.student_id === research.student_id) || {};
        const facultyMember = faculty.find(f => f.faculty_id === research.faculty_id) || {};
        const project = research.project_id ? 
            projects.find(p => p.project_id === research.project_id) : null;
        
        // Format dates
        const startDate = research.start_date ? new Date(research.start_date).toLocaleDateString() : 'Not specified';
        const endDate = research.end_date ? new Date(research.end_date).toLocaleDateString() : 'Ongoing';
        
        // Build HTML for research details
        const detailsDiv = document.getElementById('research-details');
        
        detailsDiv.innerHTML = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${research.title || 'Untitled Research'}</h2>
                <div class="flex items-center space-x-4">
                    <span class="status-badge ${getStatusBadgeClass(research.status)}">${research.status || 'Unknown Status'}</span>
                    <span class="type-badge ${getTypeBadgeClass(research.research_type)}">${research.research_type || 'Research Activity'}</span>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                    <h3 class="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <i class="fas fa-user-graduate mr-2"></i>Student
                    </h3>
                    <p class="text-lg font-medium text-gray-900 mb-1">${student.first_name || ''} ${student.last_name || ''}</p>
                    <p class="text-sm text-gray-600">${student.program_type || 'Student'}</p>
                    <p class="text-sm text-gray-500">${student.email || ''}</p>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                        <i class="fas fa-chalkboard-teacher mr-2"></i>Faculty Advisor
                    </h3>
                    <p class="text-lg font-medium text-gray-900 mb-1">${facultyMember.first_name || ''} ${facultyMember.last_name || ''}</p>
                    <p class="text-sm text-gray-600">${facultyMember.position || 'Faculty'}</p>
                    <p class="text-sm text-gray-500">${facultyMember.email || ''}</p>
                </div>
            </div>
            
            ${research.description ? `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p class="text-gray-700 leading-relaxed">${research.description}</p>
                </div>
            </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Start Date</h4>
                    <p class="text-gray-900">${startDate}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Completion Date</h4>
                    <p class="text-gray-900">${endDate}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">Keywords</h4>
                    <p class="text-gray-900">${research.keywords || 'None'}</p>
                </div>
            </div>
            
            ${research.url ? `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Research URL</h3>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <a href="${research.url}" target="_blank" class="text-indigo-600 hover:underline flex items-center">
                        <i class="fas fa-external-link-alt mr-2"></i>
                        ${research.url}
                    </a>
                </div>
            </div>
            ` : ''}
            
            ${project ? `
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Related Project</h3>
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <h4 class="text-lg font-medium text-purple-800 mb-2">${project.project_title}</h4>
                    <p class="text-gray-700">${project.description ? project.description.substring(0, 150) + '...' : 'No description available'}</p>
                    <div class="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        <span><i class="fas fa-calendar mr-1"></i>${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
                        <span><i class="fas fa-dollar-sign mr-1"></i>${project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</span>
                        <span><i class="fas fa-chart-line mr-1"></i>${project.status || 'N/A'}</span>
                    </div>
                </div>
            </div>
            ` : ''}
        `;
        
        // Show modal
        detailModal.classList.remove('hidden');
    }

    /**
     * Debounce function for search input
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
