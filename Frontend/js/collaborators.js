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
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const editCollaboratorBtn = document.getElementById('edit-collaborator-btn');
    
    const collaboratorSearchInput = document.getElementById('collaborator-search');
    const projectFilter = document.getElementById('project-filter');
    const typeFilter = document.getElementById('type-filter');
    const searchBtn = document.getElementById('search-btn');
    
    // Pagination
    const paginationSection = document.getElementById('pagination');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form fields
    const collaboratorIdInput = document.getElementById('collaborator-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const institutionInput = document.getElementById('institution');
    const typeSelect = document.getElementById('type');
    const websiteInput = document.getElementById('website');
    const expertiseInput = document.getElementById('expertise');
    const notesInput = document.getElementById('notes');
    const projectSelectionDiv = document.getElementById('project-selection');

    // State variables
    let allCollaborators = [];
    let filteredCollaborators = [];
    let projects = [];
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

    // Modal events
    addCollaboratorBtn.addEventListener('click', showAddCollaboratorModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    collaboratorForm.addEventListener('submit', saveCollaborator);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    editCollaboratorBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
        if (currentCollaboratorId) {
            showEditCollaboratorModal(currentCollaboratorId);
        }
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

    async function initPage() {
        try {
            // Load projects for filters
            projects = await fetchAPI(CONFIG.ENDPOINTS.PROJECTS);
            populateProjectFilter();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
        
        await loadCollaborators();
    }

    function populateProjectFilter() {
        // Clear existing options except the first one
        while (projectFilter.options.length > 1) {
            projectFilter.remove(1);
        }
        
        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.project_id;
            option.textContent = project.title;
            projectFilter.appendChild(option);
        });
    }

    function populateProjectSelection(selectedProjects = []) {
        // Populate project selection
        projectSelectionDiv.innerHTML = projects.length === 0 ? 
            '<div class="text-gray-500">No projects available</div>' : '';
        
        if (projects.length > 0) {
            // Group projects by department
            const projectsByDept = {};
            
            projects.forEach(project => {
                if (!projectsByDept[project.dept_id]) {
                    projectsByDept[project.dept_id] = [];
                }
                projectsByDept[project.dept_id].push(project);
            });
            
            // Get departments
            fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS)
                .then(departments => {
                    // Create project checkboxes by department
                    Object.keys(projectsByDept).forEach(deptId => {
                        const dept = departments.find(d => d.dept_id === parseInt(deptId));
                        const deptName = dept ? dept.dept_name : 'Unknown Department';
                        
                        const deptSection = document.createElement('div');
                        deptSection.className = 'mb-3';
                        deptSection.innerHTML = `<h5 class="font-medium text-indigo-800 mb-1">${deptName}</h5>`;
                        
                        const projectList = document.createElement('div');
                        projectList.className = 'space-y-1 pl-2';
                        
                        projectsByDept[deptId].forEach(project => {
                            const isChecked = selectedProjects.includes(project.project_id);
                            
                            projectList.innerHTML += `
                                <div class="flex items-center">
                                    <input type="checkbox" id="project-${project.project_id}" name="project" 
                                        value="${project.project_id}" class="form-checkbox h-4 w-4 text-indigo-600"
                                        ${isChecked ? 'checked' : ''}>
                                    <label for="project-${project.project_id}" class="ml-2 text-sm">
                                        ${project.title} 
                                        <span class="text-gray-500">${project.is_active ? '(Active)' : '(Completed)'}</span>
                                    </label>
                                </div>
                            `;
                        });
                        
                        deptSection.appendChild(projectList);
                        projectSelectionDiv.appendChild(deptSection);
                    });
                })
                .catch(error => {
                    console.error('Error loading departments:', error);
                    projectSelectionDiv.innerHTML = '<div class="text-red-500">Error loading project data</div>';
                });
        }
    }

    async function loadCollaborators() {
        showLoading(true);
        
        try {
            // Load all collaborators from API
            allCollaborators = await fetchAPI(CONFIG.ENDPOINTS.PROJECT_COLLABORATORS);
            
            // Apply initial filters
            filterCollaborators();
        } catch (error) {
            console.error('Error loading collaborators:', error);
            showNotification('Failed to load collaborators', 'error');
        } finally {
            showLoading(false);
        }
    }

    function filterCollaborators() {
        const searchTerm = collaboratorSearchInput.value.trim().toLowerCase();
        const projectId = projectFilter.value;
        const collaboratorType = typeFilter.value;
        
        // Apply filters
        filteredCollaborators = allCollaborators.filter(collaborator => {
            // Filter by search term
            const nameMatches = 
                `${collaborator.first_name} ${collaborator.last_name}`.toLowerCase().includes(searchTerm) ||
                (collaborator.institution && collaborator.institution.toLowerCase().includes(searchTerm));
                
            // Filter by project
            const projectMatches = !projectId || 
                (collaborator.projects && collaborator.projects.some(p => p.project_id === parseInt(projectId)));
                
            // Filter by type
            const typeMatches = !collaboratorType || collaborator.type === collaboratorType;
            
            return nameMatches && projectMatches && typeMatches;
        });
        
        renderCollaborators();
    }

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
            
            // Format projects list
            let projectsList = '';
            if (collaborator.projects && collaborator.projects.length > 0) {
                projectsList = collaborator.projects
                    .slice(0, 2)
                    .map(p => p.title)
                    .join(', ');
                
                if (collaborator.projects.length > 2) {
                    projectsList += ` +${collaborator.projects.length - 2} more`;
                }
            } else {
                projectsList = 'No projects';
            }
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div>
                            <div class="text-sm font-medium text-gray-900">${collaborator.first_name} ${collaborator.last_name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${collaborator.institution || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        ${collaborator.type || 'Unknown'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${projectsList}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${collaborator.email}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-id="${collaborator.id}" class="view-btn text-indigo-600 hover:text-indigo-900 mr-4">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button data-id="${collaborator.id}" class="edit-btn text-blue-600 hover:text-blue-900 mr-4">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${collaborator.id}" class="delete-btn text-red-600 hover:text-red-900">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            collaboratorsTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                showCollaboratorDetails(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                showEditCollaboratorModal(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                showDeleteConfirmation(id);
            });
        });
    }

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

    function showAddCollaboratorModal() {
        modalTitle.textContent = 'Add Project Collaborator';
        
        // Clear form fields
        collaboratorForm.reset();
        collaboratorIdInput.value = '';
        
        // Populate project selection with empty selection
        populateProjectSelection([]);
        
        // Show modal
        collaboratorModal.classList.remove('hidden');
    }

    function showEditCollaboratorModal(collaboratorId) {
        const collaborator = allCollaborators.find(c => c.id === collaboratorId);
        if (!collaborator) return;
        
        modalTitle.textContent = 'Edit Project Collaborator';
        currentCollaboratorId = collaboratorId;
        
        // Fill form fields
        collaboratorIdInput.value = collaborator.id;
        firstNameInput.value = collaborator.first_name;
        lastNameInput.value = collaborator.last_name;
        emailInput.value = collaborator.email;
        phoneInput.value = collaborator.phone || '';
        institutionInput.value = collaborator.institution || '';
        typeSelect.value = collaborator.type || '';
        websiteInput.value = collaborator.website || '';
        expertiseInput.value = collaborator.expertise || '';
        notesInput.value = collaborator.notes || '';
        
        // Get selected project IDs
        const selectedProjects = collaborator.projects ? 
            collaborator.projects.map(p => p.project_id) : [];
            
        // Populate project selection
        populateProjectSelection(selectedProjects);
        
        // Show modal
        collaboratorModal.classList.remove('hidden');
    }

    function closeModal() {
        collaboratorModal.classList.add('hidden');
    }

    async function saveCollaborator(event) {
        event.preventDefault();
        
        // Get selected projects
        const selectedProjects = Array.from(
            document.querySelectorAll('#project-selection input[type="checkbox"]:checked')
        ).map(checkbox => parseInt(checkbox.value));
        
        // Create collaborator object
        const collaboratorData = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim() || null,
            institution: institutionInput.value.trim() || null,
            type: typeSelect.value,
            website: websiteInput.value.trim() || null,
            expertise: expertiseInput.value.trim() || null,
            notes: notesInput.value.trim() || null,
            project_ids: selectedProjects
        };
        
        try {
            let response;
            const collaboratorId = collaboratorIdInput.value;
            
            if (collaboratorId) {
                // Update existing collaborator
                response = await fetchAPI(
                    `${CONFIG.ENDPOINTS.PROJECT_COLLABORATORS}/${collaboratorId}`, 
                    'PUT', 
                    collaboratorData
                );
                showNotification('Collaborator updated successfully', 'success');
            } else {
                // Create new collaborator
                response = await fetchAPI(
                    CONFIG.ENDPOINTS.PROJECT_COLLABORATORS, 
                    'POST', 
                    collaboratorData
                );
                showNotification('Collaborator added successfully', 'success');
            }
            
            // Reload collaborators
            await loadCollaborators();
            
            // Close modal
            closeModal();
        } catch (error) {
            console.error('Error saving collaborator:', error);
            showNotification('Failed to save collaborator: ' + (error.message || 'Unknown error'), 'error');
        }
    }

    function showDeleteConfirmation(collaboratorId) {
        currentCollaboratorId = collaboratorId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.PROJECT_COLLABORATORS}/${collaboratorId}`, 'DELETE');
                showNotification('Collaborator deleted successfully', 'success');
                
                // Reload collaborators
                await loadCollaborators();
            } catch (error) {
                console.error('Error deleting collaborator:', error);
                showNotification('Failed to delete collaborator', 'error');
            } finally {
                deleteModal.classList.add('hidden');
                currentCollaboratorId = null;
            }
        };
    }

    function showCollaboratorDetails(collaboratorId) {
        const collaborator = allCollaborators.find(c => c.id === collaboratorId);
        if (!collaborator) return;
        
        currentCollaboratorId = collaboratorId;
        
        // Build HTML for collaborator details
        const detailsDiv = document.getElementById('collaborator-details');
        
        detailsDiv.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-900 mb-4">${collaborator.first_name} ${collaborator.last_name}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Contact Information</p>
                    <p class="mb-1"><strong>Email:</strong> ${collaborator.email}</p>
                    <p class="mb-1"><strong>Phone:</strong> ${collaborator.phone || 'Not provided'}</p>
                    <p class="mb-1"><strong>Website:</strong> ${
                        collaborator.website ? 
                        `<a href="${collaborator.website}" target="_blank" class="text-indigo-600 hover:underline">${collaborator.website}</a>` : 
                        'Not provided'
                    }</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Organization</p>
                    <p class="mb-1"><strong>Institution:</strong> ${collaborator.institution || 'Not provided'}</p>
                    <p class="mb-1"><strong>Type:</strong> ${collaborator.type || 'Not specified'}</p>
                    <p class="mb-1"><strong>Expertise:</strong> ${collaborator.expertise || 'Not specified'}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <p class="text-sm text-gray-500">Notes</p>
                <p class="p-2 bg-gray-50 rounded">${collaborator.notes || 'No notes available'}</p>
            </div>
        `;
        
        // Build HTML for associated projects
        const projectsDiv = document.getElementById('associated-projects');
        
        if (!collaborator.projects || collaborator.projects.length === 0) {
            projectsDiv.innerHTML = '<p class="text-gray-500">No projects associated with this collaborator</p>';
        } else {
            projectsDiv.innerHTML = '';
            
            collaborator.projects.forEach(project => {
                projectsDiv.innerHTML += `
                    <div class="bg-white border rounded-lg p-3 hover:shadow-md">
                        <h5 class="font-semibold text-indigo-800">${project.title}</h5>
                        <p class="text-sm text-gray-600">${project.description ? project.description.substring(0, 100) + '...' : 'No description'}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            ${new Date(project.start_date).toLocaleDateString()} - 
                            ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Ongoing'}
                            <span class="ml-2 ${project.is_active ? 'text-green-600' : 'text-red-600'}">
                                ${project.is_active ? 'Active' : 'Completed'}
                            </span>
                        </p>
                    </div>
                `;
            });
        }
        
        // Show modal
        detailModal.classList.remove('hidden');
    }
});
