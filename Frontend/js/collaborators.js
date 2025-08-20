// Collaborators page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const collaboratorsTable = document.getElementById('collaborators-table');
    const collaboratorsContainer = document.getElementById('collaborators-container');
    const loadingIndicator = document.getElementById('loading');
    const noCollaboratorsMessage = document.getElementById('no-collaborators');
    const addCollaboratorBtn = document.getElementById('add-collaborator-btn');
    const collaboratorModal = document.getElementById('collaborator-modal');
    const modalTitle = document.getElementById('modal-title');
    const collaboratorForm = document.getElementById('collaborator-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    // Statistics elements
    const totalCollaborations = document.getElementById('total-collaborations');
    const uniqueProjects = document.getElementById('unique-projects');
    const facultyInvolved = document.getElementById('faculty-involved');
    const principalInvestigators = document.getElementById('principal-investigators');
    
    // Search and filter elements
    const collaboratorSearchInput = document.getElementById('collaborator-search');
    const projectFilter = document.getElementById('project-filter');
    const roleFilter = document.getElementById('role-filter');
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
    const collaboratorIdInput = document.getElementById('collaborator-id');
    const facultyIdInput = document.getElementById('faculty-id');
    const projectIdInput = document.getElementById('project-id');
    const roleInput = document.getElementById('role');
    const involvementPercentageInput = document.getElementById('involvement-percentage');

    // State variables
    let allCollaborators = [];
    let filteredCollaborators = [];
    let projects = [];
    let faculty = [];
    let currentCollaboratorId = null;
    let currentPage = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        filterCollaborators();
    });

    clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal events
    addCollaboratorBtn.addEventListener('click', showAddCollaboratorModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    collaboratorForm.addEventListener('submit', saveCollaborator);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCollaborators();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredCollaborators.length) {
            currentPage++;
            renderCollaborators();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            collaboratorSearchInput.focus();
        }
    });

    // Search input events
    collaboratorSearchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        filterCollaborators();
    }, 300));

    // Filter change events
    projectFilter.addEventListener('change', () => {
        currentPage = 1;
        filterCollaborators();
    });

    roleFilter.addEventListener('change', () => {
        currentPage = 1;
        filterCollaborators();
    });

    // Close modals when clicking outside
    collaboratorModal.addEventListener('click', (e) => {
        if (e.target === collaboratorModal) {
            closeModal();
        }
    });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.add('hidden');
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!collaboratorModal.classList.contains('hidden')) {
                closeModal();
            }
            if (!deleteModal.classList.contains('hidden')) {
                deleteModal.classList.add('hidden');
            }
        }
    });

    /**
     * Initialize the page
     */
    async function initPage() {
        try {
            console.log('🚀 Initializing collaborators page...');
            
            // Load projects and faculty for filters
            await Promise.all([
                loadProjects(),
                loadFaculty()
            ]);
            
            // Populate filters
            populateProjectFilter();
            populateFacultyFilter();
            
            // Load collaborators
            await loadCollaborators();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
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
     * Populate project filter dropdown
     */
    function populateProjectFilter() {
        // Clear existing options except the first one
        while (projectFilter.options.length > 1) {
            projectFilter.remove(1);
        }
        
        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id;
            option.textContent = project.project_title;
            projectFilter.appendChild(option);
        });
    }

    /**
     * Populate faculty filter dropdown
     */
    function populateFacultyFilter() {
        // Clear existing options except the first one
        while (facultyIdInput.options.length > 1) {
            facultyIdInput.remove(1);
        }
        
        // Add faculty options
        faculty.forEach(facultyMember => {
            const option = document.createElement('option');
            option.value = facultyMember.faculty_id;
            option.textContent = `${facultyMember.first_name} ${facultyMember.last_name}`;
            facultyIdInput.appendChild(option);
        });
    }

    /**
     * Load collaborators from API
     */
    async function loadCollaborators() {
        showLoading(true);
        
        try {
            console.log('📡 Loading collaborators from API...');
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECT_COLLABORATORS);
            
            if (response.ok) {
                allCollaborators = await response.json();
                console.log('Collaborators loaded:', allCollaborators);
                
                // Apply initial filters
                filterCollaborators();
                
                // Load statistics
                loadStatistics();
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading collaborators:', error);
            showNotification('Failed to load collaborators', 'error');
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
            
            // Calculate statistics from collaborators data
            const totalCollabs = allCollaborators.length;
            const uniqueProjectIds = [...new Set(allCollaborators.map(c => c.project_id))];
            const uniqueFacultyIds = [...new Set(allCollaborators.map(c => c.faculty_id))];
            const principalInvestigatorCount = allCollaborators.filter(c => 
                c.role === 'Principal Investigator'
            ).length;
            
            console.log('Statistics calculated:', {
                totalCollabs,
                uniqueProjectIds: uniqueProjectIds.length,
                uniqueFacultyIds: uniqueFacultyIds.length,
                principalInvestigatorCount
            });
            
            // Update statistics display
            if (totalCollaborations) totalCollaborations.textContent = totalCollabs;
            if (uniqueProjects) uniqueProjects.textContent = uniqueProjectIds.length;
            if (facultyInvolved) facultyInvolved.textContent = uniqueFacultyIds.length;
            if (principalInvestigators) principalInvestigators.textContent = principalInvestigatorCount;
            
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    /**
     * Filter collaborators based on search and filters
     */
    function filterCollaborators() {
        const searchTerm = collaboratorSearchInput.value.trim().toLowerCase();
        const projectId = projectFilter.value;
        const roleFilterValue = roleFilter.value;
        
        console.log('🔍 Filtering collaborators:', { searchTerm, projectId, roleFilterValue });
        
        // Apply filters
        filteredCollaborators = allCollaborators.filter(collaborator => {
            // Filter by search term
            const nameMatches = collaborator.faculty_name.toLowerCase().includes(searchTerm) ||
                               collaborator.project_title.toLowerCase().includes(searchTerm) ||
                               collaborator.role.toLowerCase().includes(searchTerm);
                
            // Filter by project
            const projectMatches = !projectId || collaborator.project_id === parseInt(projectId);
                
            // Filter by role
            const roleMatches = !roleFilterValue || collaborator.role === roleFilterValue;
            
            return nameMatches && projectMatches && roleMatches;
        });
        
        console.log('Filtered collaborators:', filteredCollaborators);
        
        // Update results count
        updateResultsCount();
        
        // Render collaborators
        renderCollaborators();
    }

    /**
     * Update results count display
     */
    function updateResultsCount() {
        if (resultsCountEl) {
            const total = filteredCollaborators.length;
            const searchQuery = collaboratorSearchInput.value.trim();
            const projectFilterValue = projectFilter.value;
            const roleFilterValue = roleFilter.value;
            
            if (searchQuery || projectFilterValue || roleFilterValue) {
                resultsCountEl.textContent = `Showing ${total} filtered collaborations`;
            } else {
                resultsCountEl.textContent = `Showing all ${total} collaborations`;
            }
        }
    }

    /**
     * Clear all filters
     */
    function clearFilters() {
        collaboratorSearchInput.value = '';
        projectFilter.value = '';
        roleFilter.value = '';
        currentPage = 1;
        filterCollaborators();
    }

    /**
     * Render collaborators in the table
     */
    function renderCollaborators() {
        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredCollaborators.length);
        const pageCollaborators = filteredCollaborators.slice(startIndex, endIndex);
        
        // Update pagination UI
        showingStart.textContent = filteredCollaborators.length > 0 ? startIndex + 1 : 0;
        showingEnd.textContent = endIndex;
        totalItems.textContent = filteredCollaborators.length;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = endIndex >= filteredCollaborators.length;
        
        // Show/hide pagination
        paginationSection.classList.toggle('hidden', filteredCollaborators.length <= itemsPerPage);
        
        // Show appropriate UI based on results
        collaboratorsContainer.classList.toggle('hidden', pageCollaborators.length === 0);
        noCollaboratorsMessage.classList.toggle('hidden', pageCollaborators.length > 0);
        
        if (pageCollaborators.length === 0) {
            return;
        }
        
        // Clear the table
        collaboratorsTable.innerHTML = '';
        
        // Render each collaborator
        pageCollaborators.forEach(collaborator => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-200';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-user text-indigo-600"></i>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${collaborator.faculty_name}</div>
                            <div class="text-sm text-gray-500">ID: ${collaborator.faculty_id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 line-clamp-2">${collaborator.project_title}</div>
                    <div class="text-sm text-gray-500">ID: ${collaborator.project_id}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="role-badge ${getRoleBadgeClass(collaborator.role)}">${collaborator.role}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-semibold">${collaborator.involvement_percentage}%</div>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style="width: ${collaborator.involvement_percentage}%"></div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-id="${collaborator.project_id}" data-faculty="${collaborator.faculty_id}" class="edit-btn text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${collaborator.project_id}" data-faculty="${collaborator.faculty_id}" class="delete-btn text-red-600 hover:text-red-900 transition-colors">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            collaboratorsTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        setupEventDelegation();
    }

    /**
     * Setup event delegation for action buttons
     */
    function setupEventDelegation() {
        // Handle edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const projectId = parseInt(button.getAttribute('data-id'));
                const facultyId = parseInt(button.getAttribute('data-faculty'));
                showEditCollaboratorModal(projectId, facultyId);
            });
        });
        
        // Handle delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const projectId = parseInt(button.getAttribute('data-id'));
                const facultyId = parseInt(button.getAttribute('data-faculty'));
                showDeleteConfirmation(projectId, facultyId);
            });
        });
    }

    /**
     * Get role badge CSS class
     */
    function getRoleBadgeClass(role) {
        switch (role) {
            case 'Principal Investigator':
                return 'principal';
            case 'Co-Investigator':
                return 'co-investigator';
            case 'Consultant':
                return 'consultant';
            case 'Collaborator':
                return 'collaborator';
            case 'Data Science Consultant':
                return 'data-science';
            default:
                return 'collaborator';
        }
    }

    /**
     * Show loading state
     */
    function showLoading(isLoading) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            collaboratorsContainer.classList.add('hidden');
            noCollaboratorsMessage.classList.add('hidden');
            paginationSection.classList.add('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Show add collaborator modal
     */
    function showAddCollaboratorModal() {
        modalTitle.textContent = 'Add Project Collaborator';
        
        // Clear form fields
        collaboratorForm.reset();
        collaboratorIdInput.value = '';
        
        // Show modal
        collaboratorModal.classList.remove('hidden');
    }

    /**
     * Show edit collaborator modal
     */
    function showEditCollaboratorModal(projectId, facultyId) {
        const collaborator = allCollaborators.find(c => 
            c.project_id === projectId && c.faculty_id === facultyId
        );
        
        if (!collaborator) return;
        
        modalTitle.textContent = 'Edit Project Collaborator';
        currentCollaboratorId = { projectId, facultyId };
        
        // Fill form fields
        facultyIdInput.value = collaborator.faculty_id;
        projectIdInput.value = collaborator.project_id;
        roleInput.value = collaborator.role;
        involvementPercentageInput.value = collaborator.involvement_percentage;
        
        // Show modal
        collaboratorModal.classList.remove('hidden');
    }

    /**
     * Close collaborator modal
     */
    function closeModal() {
        collaboratorModal.classList.add('hidden');
        currentCollaboratorId = null;
    }

    /**
     * Save collaborator data
     */
    async function saveCollaborator(event) {
        event.preventDefault();
        
        // Validate form
        if (!collaboratorForm.checkValidity()) {
            collaboratorForm.reportValidity();
            return;
        }
        
        // Collect form data
        const formData = {
            project_id: parseInt(projectIdInput.value),
            faculty_id: parseInt(facultyIdInput.value),
            role: roleInput.value,
            involvement_percentage: parseFloat(involvementPercentageInput.value)
        };
        
        try {
            let response;
            
            if (currentCollaboratorId) {
                // Update existing collaborator
                console.log('Updating collaborator:', currentCollaboratorId);
                response = await fetchAPI(
                    `${CONFIG.ENDPOINTS.PROJECT_COLLABORATORS}/${currentCollaboratorId.projectId}/${currentCollaboratorId.facultyId}`, 
                    'PUT', 
                    formData
                );
                showNotification('Collaboration updated successfully', 'success');
            } else {
                // Create new collaborator
                console.log('Creating new collaborator:', formData);
                response = await fetchAPI(
                    CONFIG.ENDPOINTS.PROJECT_COLLABORATORS, 
                    'POST', 
                    formData
                );
                showNotification('Collaboration added successfully', 'success');
            }
            
            // Reload collaborators
            await loadCollaborators();
            
            // Close modal
            closeModal();
        } catch (error) {
            console.error('Error saving collaborator:', error);
            showNotification('Failed to save collaboration: ' + (error.message || 'Unknown error'), 'error');
        }
    }

    /**
     * Show delete confirmation modal
     */
    function showDeleteConfirmation(projectId, facultyId) {
        currentCollaboratorId = { projectId, facultyId };
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(
                    `${CONFIG.ENDPOINTS.PROJECT_COLLABORATORS}/${projectId}/${facultyId}`, 
                    'DELETE'
                );
                
                showNotification('Collaboration deleted successfully', 'success');
                
                // Reload collaborators
                await loadCollaborators();
            } catch (error) {
                console.error('Error deleting collaborator:', error);
                showNotification('Failed to delete collaboration', 'error');
            } finally {
                deleteModal.classList.add('hidden');
                currentCollaboratorId = null;
            }
        };
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
