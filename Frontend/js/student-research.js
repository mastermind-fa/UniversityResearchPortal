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
    
    const researchSearchInput = document.getElementById('research-search');
    const studentFilter = document.getElementById('student-filter');
    const facultyFilter = document.getElementById('faculty-filter');
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

    async function initPage() {
        try {
            // Load students and faculty for filters
            students = await fetchAPI(CONFIG.ENDPOINTS.STUDENTS);
            faculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
            projects = await fetchAPI(CONFIG.ENDPOINTS.PROJECTS);
            
            populateFilters();
            populateFormSelects();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
        
        await loadResearch();
    }

    function populateFilters() {
        // Populate student filter
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.student_id;
            option.textContent = `${student.first_name} ${student.last_name}`;
            studentFilter.appendChild(option);
        });
        
        // Populate faculty filter
        faculty.forEach(f => {
            const option = document.createElement('option');
            option.value = f.faculty_id;
            option.textContent = `${f.first_name} ${f.last_name}`;
            facultyFilter.appendChild(option);
        });
    }

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
            option.textContent = project.title;
            projectSelect.appendChild(option);
        });
    }

    async function loadResearch() {
        showLoading(true);
        
        try {
            // Load all research activities from API
            allResearch = await fetchAPI(CONFIG.ENDPOINTS.STUDENT_RESEARCH);
            
            // Apply initial filters
            filterResearch();
        } catch (error) {
            console.error('Error loading research activities:', error);
            showNotification('Failed to load research activities', 'error');
        } finally {
            showLoading(false);
        }
    }

    function filterResearch() {
        const searchTerm = researchSearchInput.value.trim().toLowerCase();
        const studentId = studentFilter.value;
        const facultyId = facultyFilter.value;
        const researchType = typeFilter.value;
        
        // Apply filters
        filteredResearch = allResearch.filter(research => {
            // Filter by search term
            const titleMatches = research.title.toLowerCase().includes(searchTerm);
            const descriptionMatches = research.description && research.description.toLowerCase().includes(searchTerm);
            
            // Filter by student
            const studentMatches = !studentId || research.student_id === parseInt(studentId);
            
            // Filter by faculty
            const facultyMatches = !facultyId || research.faculty_id === parseInt(facultyId);
            
            // Filter by type
            const typeMatches = !researchType || research.research_type === researchType;
            
            return (titleMatches || descriptionMatches) && studentMatches && facultyMatches && typeMatches;
        });
        
        renderResearch();
    }

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
            
            // Find student and faculty details
            const student = students.find(s => s.student_id === research.student_id) || {};
            const facultyMember = faculty.find(f => f.faculty_id === research.faculty_id) || {};
            
            // Format dates
            const startDate = research.start_date ? new Date(research.start_date).toLocaleDateString() : 'N/A';
            const endDate = research.end_date ? new Date(research.end_date).toLocaleDateString() : '';
            
            // Generate status badge class
            let statusClass = '';
            switch (research.status) {
                case 'Completed':
                    statusClass = 'bg-green-100 text-green-800';
                    break;
                case 'In Progress':
                    statusClass = 'bg-blue-100 text-blue-800';
                    break;
                case 'On Hold':
                    statusClass = 'bg-yellow-100 text-yellow-800';
                    break;
                case 'Abandoned':
                    statusClass = 'bg-red-100 text-red-800';
                    break;
                default:
                    statusClass = 'bg-gray-100 text-gray-800';
            }
            
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">${research.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${student.first_name || ''} ${student.last_name || ''}</div>
                    <div class="text-xs text-gray-500">${student.program_type || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${facultyMember.first_name || ''} ${facultyMember.last_name || ''}</div>
                    <div class="text-xs text-gray-500">${facultyMember.position || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${research.research_type || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${research.status || 'Unknown'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${startDate}${endDate ? ' to ' + endDate : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button data-id="${research.id}" class="view-btn text-indigo-600 hover:text-indigo-900 mr-4">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button data-id="${research.id}" class="edit-btn text-blue-600 hover:text-blue-900 mr-4">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-id="${research.id}" class="delete-btn text-red-600 hover:text-red-900">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            researchTable.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                showResearchDetails(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                showEditResearchModal(id);
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
            researchContainer.classList.add('hidden');
            noResearchMessage.classList.add('hidden');
            paginationSection.classList.add('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }

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

    function showEditResearchModal(researchId) {
        const research = allResearch.find(r => r.id === researchId);
        if (!research) return;
        
        modalTitle.textContent = 'Edit Student Research Activity';
        currentResearchId = researchId;
        
        // Fill form fields
        researchIdInput.value = research.id;
        titleInput.value = research.title;
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

    function closeModal() {
        researchModal.classList.add('hidden');
    }

    async function saveResearch(event) {
        event.preventDefault();
        
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
                response = await fetchAPI(
                    `${CONFIG.ENDPOINTS.STUDENT_RESEARCH}/${researchId}`, 
                    'PUT', 
                    researchData
                );
                showNotification('Research activity updated successfully', 'success');
            } else {
                // Create new research activity
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

    function showDeleteConfirmation(researchId) {
        currentResearchId = researchId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.STUDENT_RESEARCH}/${researchId}`, 'DELETE');
                showNotification('Research activity deleted successfully', 'success');
                
                // Reload research activities
                await loadResearch();
            } catch (error) {
                console.error('Error deleting research activity:', error);
                showNotification('Failed to delete research activity', 'error');
            } finally {
                deleteModal.classList.add('hidden');
                currentResearchId = null;
            }
        };
    }

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
        
        // Generate status badge class
        let statusClass = '';
        switch (research.status) {
            case 'Completed':
                statusClass = 'bg-green-100 text-green-800';
                break;
            case 'In Progress':
                statusClass = 'bg-blue-100 text-blue-800';
                break;
            case 'On Hold':
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
            case 'Abandoned':
                statusClass = 'bg-red-100 text-red-800';
                break;
            default:
                statusClass = 'bg-gray-100 text-gray-800';
        }
        
        // Build HTML for research details
        const detailsDiv = document.getElementById('research-details');
        
        detailsDiv.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-900 mb-2">${research.title}</h2>
            
            <div class="mb-4">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${research.status || 'Unknown Status'}
                </span>
                <span class="ml-2 text-sm text-gray-500">${research.research_type || 'Research Activity'}</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Student</h3>
                    <p class="mb-1">${student.first_name || ''} ${student.last_name || ''}</p>
                    <p class="text-sm text-gray-500">${student.program_type || 'Student'}</p>
                    <p class="text-sm text-gray-500">${student.email || ''}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Faculty Advisor</h3>
                    <p class="mb-1">${facultyMember.first_name || ''} ${facultyMember.last_name || ''}</p>
                    <p class="text-sm text-gray-500">${facultyMember.position || 'Faculty'}</p>
                    <p class="text-sm text-gray-500">${facultyMember.email || ''}</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="text-md font-semibold text-gray-700 mb-2">Description</h3>
                <p class="bg-gray-50 p-4 rounded-lg">${research.description || 'No description provided.'}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Start Date</h3>
                    <p>${startDate}</p>
                </div>
                <div>
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Completion Date</h3>
                    <p>${endDate}</p>
                </div>
                <div>
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Keywords</h3>
                    <p>${research.keywords || 'None'}</p>
                </div>
            </div>
            
            ${research.url ? `
                <div class="mb-4">
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Research URL</h3>
                    <a href="${research.url}" target="_blank" class="text-indigo-600 hover:underline">
                        ${research.url}
                        <i class="fas fa-external-link-alt ml-1 text-xs"></i>
                    </a>
                </div>
            ` : ''}
            
            ${project ? `
                <div class="mb-4">
                    <h3 class="text-md font-semibold text-gray-700 mb-2">Related Project</h3>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-medium">${project.title}</h4>
                        <p class="text-sm">${project.description ? project.description.substring(0, 100) + '...' : 'No description'}</p>
                    </div>
                </div>
            ` : ''}
        `;
        
        // Show modal
        detailModal.classList.remove('hidden');
    }
});
