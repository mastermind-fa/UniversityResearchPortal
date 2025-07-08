// Funding page script

document.addEventListener('DOMContentLoaded', function() {
    // Tab Elements
    const tabSources = document.getElementById('tab-sources');
    const tabAllocations = document.getElementById('tab-allocations');
    const sourcesContent = document.getElementById('sources-content');
    const allocationsContent = document.getElementById('allocations-content');
    
    // Elements for Sources tab
    const fundingList = document.getElementById('funding-list');
    const noSources = document.getElementById('no-sources');
    
    // Elements for Allocations tab
    const allocationsList = document.getElementById('allocations-list');
    const noAllocations = document.getElementById('no-allocations');
    const allocationsTableBody = document.getElementById('allocations-table-body');
    const allocationsPagination = document.getElementById('allocations-pagination');
    
    // Shared elements
    const loadingIndicator = document.getElementById('loading');
    const addFundingBtn = document.getElementById('add-funding-btn');
    const fundingModal = document.getElementById('funding-modal');
    const modalTitle = document.getElementById('modal-title');
    const fundingForm = document.getElementById('funding-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    
    const fundingSearchInput = document.getElementById('funding-search');
    const filterTypeSelect = document.getElementById('filter-type');
    const searchBtn = document.getElementById('search-btn');

    // Form fields
    const fundingIdInput = document.getElementById('funding-id');
    const sourceNameInput = document.getElementById('source-name');
    const sourceTypeInput = document.getElementById('source-type');
    const contactInfoInput = document.getElementById('contact-info');

    // State variables
    let currentFundingSources = [];
    let currentAllocations = [];
    let currentFundingId = null;
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    let activeTab = 'sources';
    
    // Initialize page
    initPage();

    // Tab switching
    tabSources.addEventListener('click', () => {
        switchTab('sources');
    });
    
    tabAllocations.addEventListener('click', () => {
        switchTab('allocations');
    });

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        if (activeTab === 'sources') {
            loadFundingSources();
        } else {
            loadFundingAllocations();
        }
    });

    // Modal events
    addFundingBtn.addEventListener('click', showAddFundingModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    fundingForm.addEventListener('submit', saveFundingSource);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });

    /**
     * Initialize the page
     */
    function initPage() {
        // Load initial funding sources
        loadFundingSources();
        
        // Setup event delegation for action buttons
        setupEventDelegation();
    }

    /**
     * Setup event delegation for action buttons
     */
    function setupEventDelegation() {
        // Handle source card actions
        fundingList.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-more-btn, .view-btn');
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (!viewBtn && !editBtn && !deleteBtn) return;
            
            const fundingId = viewBtn?.dataset.id || editBtn?.dataset.id || deleteBtn?.dataset.id;
            
            if (viewBtn) {
                showFundingDetails(fundingId);
            } else if (editBtn) {
                showEditFundingModal(fundingId);
            } else if (deleteBtn) {
                showDeleteConfirmation(fundingId);
            }
        });
        
        // Handle allocations table actions
        allocationsTableBody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (!viewBtn && !deleteBtn) return;
            
            const allocationId = viewBtn?.dataset.id || deleteBtn?.dataset.id;
            const projectId = viewBtn?.dataset.project || deleteBtn?.dataset.project;
            const fundingId = viewBtn?.dataset.funding || deleteBtn?.dataset.funding;
            
            if (viewBtn) {
                window.location.href = `projects.html?id=${projectId}`;
            } else if (deleteBtn) {
                showDeleteAllocationConfirmation(projectId, fundingId);
            }
        });
        
        // Handle dropdown toggles
        document.addEventListener('click', (e) => {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target) && !e.target.closest('.dropdown button')) {
                    dropdown.classList.add('hidden');
                }
            });
        });
    }

    /**
     * Switch between tabs
     * @param {string} tab - Tab to switch to
     */
    function switchTab(tab) {
        activeTab = tab;
        
        // Update tab styling
        if (tab === 'sources') {
            tabSources.classList.add('active', 'text-indigo-600');
            tabSources.classList.remove('text-gray-500');
            tabAllocations.classList.remove('active', 'text-indigo-600');
            tabAllocations.classList.add('text-gray-500');
            
            sourcesContent.classList.remove('hidden');
            allocationsContent.classList.add('hidden');
            
            loadFundingSources();
        } else {
            tabAllocations.classList.add('active', 'text-indigo-600');
            tabAllocations.classList.remove('text-gray-500');
            tabSources.classList.remove('active', 'text-indigo-600');
            tabSources.classList.add('text-gray-500');
            
            allocationsContent.classList.remove('hidden');
            sourcesContent.classList.add('hidden');
            
            loadFundingAllocations();
        }
    }

    /**
     * Load funding sources with filtering
     */
    async function loadFundingSources() {
        // Show loading
        loadingIndicator.classList.remove('hidden');
        fundingList.classList.add('hidden');
        noSources.classList.add('hidden');
        
        const searchQuery = fundingSearchInput.value.trim();
        const typeFilter = filterTypeSelect.value;
        
        try {
            // Construct query params
            let endpoint = CONFIG.ENDPOINTS.FUNDING_SOURCES;
            const queryParams = [];
            
            if (searchQuery) {
                queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
            }
            
            if (typeFilter) {
                queryParams.push(`type=${encodeURIComponent(typeFilter)}`);
            }
            
            if (queryParams.length > 0) {
                endpoint += `?${queryParams.join('&')}`;
            }
            
            // Fetch funding sources
            currentFundingSources = await fetchAPI(endpoint);
            
            // Render funding sources
            renderFundingSources();
        } catch (error) {
            console.error('Error loading funding sources:', error);
            showNotification('Error loading funding sources', 'error');
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Load funding allocations with filtering
     */
    async function loadFundingAllocations() {
        // Show loading
        loadingIndicator.classList.remove('hidden');
        allocationsList.classList.add('hidden');
        noAllocations.classList.add('hidden');
        
        const searchQuery = fundingSearchInput.value.trim();
        const typeFilter = filterTypeSelect.value;
        
        try {
            // Construct query params
            let endpoint = CONFIG.ENDPOINTS.PROJECT_FUNDING;
            const queryParams = [];
            
            if (searchQuery) {
                queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
            }
            
            if (typeFilter) {
                queryParams.push(`type=${encodeURIComponent(typeFilter)}`);
            }
            
            // Add pagination params
            queryParams.push(`page=${currentPage}`);
            queryParams.push(`limit=${itemsPerPage}`);
            
            if (queryParams.length > 0) {
                endpoint += `?${queryParams.join('&')}`;
            }
            
            // Fetch funding allocations
            const response = await fetchAPI(endpoint);
            
            // Update state
            currentAllocations = response.items || response;
            totalPages = response.total_pages || 1;
            
            // Render funding allocations
            renderFundingAllocations();
        } catch (error) {
            console.error('Error loading funding allocations:', error);
            showNotification('Error loading funding allocations', 'error');
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Render funding sources
     */
    function renderFundingSources() {
        // Hide loading
        loadingIndicator.classList.add('hidden');
        
        if (currentFundingSources.length === 0) {
            noSources.classList.remove('hidden');
            return;
        }
        
        // Show funding sources list
        fundingList.classList.remove('hidden');
        
        // Clear existing cards
        fundingList.innerHTML = '';
        
        // Add funding source cards
        currentFundingSources.forEach(source => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-6 card-hover';
            
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <h2 class="text-xl font-semibold text-indigo-800">${source.source_name}</h2>
                    <div class="dropdown relative">
                        <button class="text-gray-500 hover:text-gray-700 focus:outline-none">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu hidden absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-10 w-32">
                            <button class="view-btn block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${source.funding_id}">
                                <i class="fas fa-eye mr-2"></i> View
                            </button>
                            <button class="edit-btn block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${source.funding_id}">
                                <i class="fas fa-edit mr-2"></i> Edit
                            </button>
                            <button class="delete-btn block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" data-id="${source.funding_id}">
                                <i class="fas fa-trash mr-2"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    <span class="badge ${getSourceTypeBadgeColor(source.source_type)}">${source.source_type}</span>
                </div>
                ${source.contact_info ? `<p class="text-gray-600 mt-3 line-clamp-2">${source.contact_info}</p>` : ''}
                <div class="mt-4">
                    <button class="view-more-btn text-indigo-600 hover:text-indigo-800 text-sm font-medium" data-id="${source.funding_id}">
                        View Details <i class="fas fa-chevron-right ml-1"></i>
                    </button>
                </div>
            `;
            
            fundingList.appendChild(card);
            
            // Dropdown toggle
            const dropdownBtn = card.querySelector('.dropdown button');
            const dropdownMenu = card.querySelector('.dropdown-menu');
            
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('hidden');
            });
        });
    }

    /**
     * Render funding allocations table
     */
    function renderFundingAllocations() {
        // Hide loading
        loadingIndicator.classList.add('hidden');
        
        if (currentAllocations.length === 0) {
            noAllocations.classList.remove('hidden');
            return;
        }
        
        // Show allocations list
        allocationsList.classList.remove('hidden');
        
        // Clear existing rows
        allocationsTableBody.innerHTML = '';
        
        // Add allocation rows
        currentAllocations.forEach(allocation => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${allocation.project_title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${allocation.source_name}</div>
                    <span class="badge ${getSourceTypeBadgeColor(allocation.source_type)} text-xs">${allocation.source_type}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${formatCurrency(allocation.amount)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${formatDate(allocation.start_date)} to ${formatDate(allocation.end_date)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${allocation.grant_number || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="view-btn text-indigo-600 hover:text-indigo-900 mr-3" 
                        data-id="${allocation.id}" data-project="${allocation.project_id}" data-funding="${allocation.funding_id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-900" 
                        data-id="${allocation.id}" data-project="${allocation.project_id}" data-funding="${allocation.funding_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            allocationsTableBody.appendChild(row);
        });
        
        // Update pagination
        renderPagination();
    }

    /**
     * Render pagination controls for allocations tab
     */
    function renderPagination() {
        allocationsPagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        const pagination = createPagination(currentPage, totalPages, (page) => {
            currentPage = page;
            loadFundingAllocations();
        });
        
        allocationsPagination.appendChild(pagination);
    }

    /**
     * Get badge color class based on source type
     * @param {string} sourceType - Source type
     * @returns {string} - Badge color class
     */
    function getSourceTypeBadgeColor(sourceType) {
        switch (sourceType) {
            case 'Government':
                return 'bg-blue-100 text-blue-800';
            case 'Private':
                return 'bg-purple-100 text-purple-800';
            case 'University':
                return 'bg-green-100 text-green-800';
            case 'International':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Show add funding source modal
     */
    function showAddFundingModal() {
        // Reset form
        fundingForm.reset();
        fundingIdInput.value = '';
        
        // Update modal title
        modalTitle.textContent = 'Add Funding Source';
        
        // Show modal
        fundingModal.classList.remove('hidden');
    }

    /**
     * Show edit funding source modal
     * @param {string} fundingId - Funding source ID
     */
    async function showEditFundingModal(fundingId) {
        try {
            // Get funding source details
            const fundingSource = await fetchAPI(`${CONFIG.ENDPOINTS.FUNDING_SOURCES}/${fundingId}`);
            
            // Populate form fields
            fundingIdInput.value = fundingSource.funding_id;
            sourceNameInput.value = fundingSource.source_name;
            sourceTypeInput.value = fundingSource.source_type;
            contactInfoInput.value = fundingSource.contact_info || '';
            
            // Update modal title
            modalTitle.textContent = 'Edit Funding Source';
            
            // Show modal
            fundingModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading funding source details:', error);
            showNotification('Error loading funding source details', 'error');
        }
    }

    /**
     * Close funding source modal
     */
    function closeModal() {
        fundingModal.classList.add('hidden');
    }

    /**
     * Save funding source data
     * @param {Event} e - Form submission event
     */
    async function saveFundingSource(e) {
        e.preventDefault();
        
        // Validate form
        if (!fundingForm.checkValidity()) {
            fundingForm.reportValidity();
            return;
        }
        
        // Collect form data
        const formData = {
            source_name: sourceNameInput.value.trim(),
            source_type: sourceTypeInput.value,
            contact_info: contactInfoInput.value.trim() || null
        };
        
        try {
            // Determine if it's an add or update operation
            const fundingId = fundingIdInput.value;
            let response;
            
            if (fundingId) {
                // Update funding source
                response = await fetchAPI(`${CONFIG.ENDPOINTS.FUNDING_SOURCES}/${fundingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                showNotification('Funding source updated successfully', 'success');
            } else {
                // Add new funding source
                response = await fetchAPI(CONFIG.ENDPOINTS.FUNDING_SOURCES, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                showNotification('Funding source added successfully', 'success');
            }
            
            // Close modal and reload data
            closeModal();
            loadFundingSources();
            
        } catch (error) {
            console.error('Error saving funding source:', error);
            showNotification('Error saving funding source data', 'error');
        }
    }

    /**
     * Show delete confirmation modal
     * @param {string} fundingId - Funding source ID
     */
    function showDeleteConfirmation(fundingId) {
        currentFundingId = fundingId;
        deleteModal.classList.remove('hidden');
        
        // Set up confirm delete button
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.FUNDING_SOURCES}/${fundingId}`, {
                    method: 'DELETE'
                });
                
                showNotification('Funding source deleted successfully', 'success');
                deleteModal.classList.add('hidden');
                loadFundingSources();
            } catch (error) {
                console.error('Error deleting funding source:', error);
                showNotification('Error deleting funding source', 'error');
            }
        };
    }

    /**
     * Show delete allocation confirmation modal
     * @param {string} projectId - Project ID
     * @param {string} fundingId - Funding source ID
     */
    function showDeleteAllocationConfirmation(projectId, fundingId) {
        deleteModal.classList.remove('hidden');
        
        // Set up confirm delete button
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.PROJECT_FUNDING}/${projectId}/${fundingId}`, {
                    method: 'DELETE'
                });
                
                showNotification('Funding allocation deleted successfully', 'success');
                deleteModal.classList.add('hidden');
                loadFundingAllocations();
            } catch (error) {
                console.error('Error deleting funding allocation:', error);
                showNotification('Error deleting funding allocation', 'error');
            }
        };
    }

    /**
     * Show funding source details in modal
     * @param {string} fundingId - Funding source ID
     */
    async function showFundingDetails(fundingId) {
        try {
            const fundingSource = await fetchAPI(`${CONFIG.ENDPOINTS.FUNDING_SOURCES}/${fundingId}`);
            const detailsContainer = document.getElementById('funding-details');
            const fundedProjectsContainer = document.getElementById('funded-projects');
            
            // Populate details
            detailsContainer.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-indigo-800 mb-2">${fundingSource.source_name}</h2>
                    <span class="badge ${getSourceTypeBadgeColor(fundingSource.source_type)}">${fundingSource.source_type}</span>
                </div>
                
                ${fundingSource.contact_info ? `
                <div class="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 class="text-sm font-medium text-gray-500 mb-2">CONTACT INFORMATION</h3>
                    <p class="text-gray-700 whitespace-pre-line">${fundingSource.contact_info}</p>
                </div>` : ''}
                
                ${fundingSource.total_funding ? `
                <div class="bg-indigo-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-gray-500 mb-1">TOTAL FUNDING PROVIDED</h3>
                    <p class="text-2xl font-bold text-indigo-700">${formatCurrency(fundingSource.total_funding)}</p>
                </div>` : ''}
            `;
            
            // Populate funded projects
            if (fundingSource.projects && fundingSource.projects.length > 0) {
                const projectsList = document.createElement('div');
                projectsList.className = 'space-y-4';
                
                fundingSource.projects.forEach(project => {
                    const projectItem = document.createElement('div');
                    projectItem.className = 'bg-gray-50 p-4 rounded-lg';
                    
                    projectItem.innerHTML = `
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="font-medium text-gray-900">${project.project_title}</h4>
                                <p class="text-sm text-gray-500">${formatCurrency(project.amount)} • ${formatDate(project.start_date)} to ${formatDate(project.end_date)}</p>
                                ${project.grant_number ? `<p class="text-sm text-gray-500">Grant #: ${project.grant_number}</p>` : ''}
                            </div>
                            <a href="projects.html?id=${project.project_id}" class="text-indigo-600 hover:text-indigo-800">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `;
                    
                    projectsList.appendChild(projectItem);
                });
                
                fundedProjectsContainer.innerHTML = '';
                fundedProjectsContainer.appendChild(projectsList);
            } else {
                fundedProjectsContainer.innerHTML = '<p class="text-gray-500">No projects currently funded by this source</p>';
            }
            
            // Show detail modal
            detailModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading funding source details:', error);
            showNotification('Error loading funding source details', 'error');
        }
    }
});
