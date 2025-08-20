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
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const refreshStatsBtn = document.getElementById('refresh-stats-btn');
    const resultsCountEl = document.getElementById('results-count');
    
    // Statistics elements
    const totalSourcesCount = document.getElementById('total-sources-count');
    const totalAllocationsCount = document.getElementById('total-allocations-count');
    const totalFundingAmount = document.getElementById('total-funding-amount');
    const governmentSourcesCount = document.getElementById('government-sources-count');

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

    // Clear filters
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Refresh statistics
    refreshStatsBtn.addEventListener('click', async () => {
        console.log('🔄 Manual refresh of statistics requested...');
        
        // Show loading state
        const originalText = refreshStatsBtn.innerHTML;
        refreshStatsBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
        refreshStatsBtn.disabled = true;
        
        try {
            await loadStatistics();
        } finally {
            // Restore button state
            refreshStatsBtn.innerHTML = originalText;
            refreshStatsBtn.disabled = false;
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            fundingSearchInput.focus();
        }
    });

    // Search input events
    fundingSearchInput.addEventListener('input', debounce(() => {
        if (activeTab === 'sources') {
            loadFundingSources();
        } else {
            loadFundingAllocations();
        }
    }, 300));

    // Filter change events
    filterTypeSelect.addEventListener('change', () => {
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
    
    // Close modals when clicking outside
    fundingModal.addEventListener('click', (e) => {
        if (e.target === fundingModal) {
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
            if (!fundingModal.classList.contains('hidden')) {
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
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.classList.add('hidden');
        }
    });

    /**
     * Initialize the page
     */
    function initPage() {
        console.log('🚀 Initializing funding page...');
        
        // Setup event delegation for action buttons
        setupEventDelegation();
        
        // Load initial funding sources and then statistics
        loadFundingSources();
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
     * Clear all filters and search
     */
    function clearFilters() {
        fundingSearchInput.value = '';
        filterTypeSelect.value = '';
        if (activeTab === 'sources') {
            loadFundingSources();
        } else {
            loadFundingAllocations();
        }
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
        
        // Refresh statistics when switching tabs
        setTimeout(() => {
            loadStatistics();
        }, 100);
    }

    /**
     * Load funding statistics
     */
    async function loadStatistics() {
        try {
            console.log('📊 Loading funding statistics...');
            
            // Show loading state
            if (totalAllocationsCount) totalAllocationsCount.textContent = '...';
            if (totalFundingAmount) totalFundingAmount.textContent = '...';
            
            console.log('Current funding sources:', currentFundingSources);
            
            // Calculate basic statistics from funding sources
            const totalSources = currentFundingSources.length;
            const governmentSources = currentFundingSources.filter(source => 
                source.source_type === 'Government'
            ).length;
            
            console.log('Basic stats calculated:', { totalSources, governmentSources });
            
            // Update basic statistics
            if (totalSourcesCount) {
                totalSourcesCount.textContent = totalSources;
                console.log('✅ Updated total sources count:', totalSources);
            } else {
                console.warn('❌ totalSourcesCount element not found');
            }
            
            if (governmentSourcesCount) {
                governmentSourcesCount.textContent = governmentSources;
                console.log('✅ Updated government sources count:', governmentSources);
            } else {
                console.warn('❌ governmentSourcesCount element not found');
            }
            
            // For now, let's set default values for allocations and funding amount
            // We'll implement the full calculation in the next step
            if (totalAllocationsCount) {
                totalAllocationsCount.textContent = '0';
                console.log('✅ Set default total allocations count: 0');
            }
            
            if (totalFundingAmount) {
                totalFundingAmount.textContent = '$0';
                console.log('✅ Set default total funding amount: $0');
            }
            
            console.log('🎉 Basic statistics loaded successfully:', { 
                totalSources, 
                governmentSources
            });
            
            // Test the display first
            console.log('🧪 Testing statistics display...');
            testStatisticsDisplay();
            
            // Now load detailed statistics
            await loadDetailedStatistics();
            
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
            // Set default values on error
            if (totalSourcesCount) totalSourcesCount.textContent = '0';
            if (governmentSourcesCount) governmentSourcesCount.textContent = '0';
            if (totalAllocationsCount) totalAllocationsCount.textContent = '0';
            if (totalFundingAmount) totalFundingAmount.textContent = '$0';
        }
    }

    /**
     * Test function to verify statistics display (temporary)
     */
    function testStatisticsDisplay() {
        console.log('🧪 Testing statistics display...');
        
        if (totalAllocationsCount) {
            totalAllocationsCount.textContent = '5';
            console.log('✅ Set test allocations count: 5');
        }
        
        if (totalFundingAmount) {
            totalFundingAmount.textContent = formatCurrency(1250000);
            console.log('✅ Set test funding amount: $1,250,000');
        }
    }

    /**
     * Load detailed funding statistics (allocations and funding amounts)
     */
    async function loadDetailedStatistics() {
        try {
            console.log('🔍 Loading detailed funding statistics...');
            
            // First try to get data from the project-funding endpoint
            try {
                console.log('📡 Fetching from project-funding endpoint...');
                const url = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECT_FUNDING;
                console.log('🔗 Project funding URL:', url);
                const allocationsResponse = await fetch(url);
                console.log('Project funding response status:', allocationsResponse.status);
                
                if (allocationsResponse.ok) {
                    const allocationsData = await allocationsResponse.json();
                    const allocations = allocationsData.items || allocationsData || [];
                    
                    console.log('Project funding data received:', allocations);
                    console.log('Raw allocations data structure:', allocationsData);
                    
                    // Calculate allocation statistics
                    const totalAllocations = allocations.length;
                    const calculatedFundingAmount = allocations.reduce((sum, allocation) => {
                        console.log('Processing allocation:', allocation);
                        const amount = allocation.amount || 0;
                        console.log(`Amount: ${amount}, Running sum: ${sum}`);
                        return sum + amount;
                    }, 0);
                    
                    console.log('Allocation stats calculated:', { totalAllocations, calculatedFundingAmount });
                    
                    // Update allocation statistics
                    if (totalAllocationsCount) {
                        totalAllocationsCount.textContent = totalAllocations;
                        console.log('✅ Updated total allocations count:', totalAllocations);
                    }
                    
                    if (totalFundingAmount) {
                        totalFundingAmount.textContent = formatCurrency(calculatedFundingAmount);
                        console.log('✅ Updated total funding amount:', formatCurrency(calculatedFundingAmount));
                    }
                    
                    console.log('🎉 Detailed statistics loaded from project-funding endpoint');
                    return; // Success, exit early
                } else {
                    console.warn('❌ Project funding endpoint failed. Status:', allocationsResponse.status);
                }
            } catch (endpointError) {
                console.warn('❌ Error fetching from project-funding endpoint:', endpointError);
            }
            
            // Fallback: calculate from individual funding source details
            console.log('🔄 Fallback: calculating from individual funding sources...');
            let calculatedTotalFunding = 0;
            let calculatedTotalAllocations = 0;
            
            if (currentFundingSources.length > 0) {
                for (const source of currentFundingSources) {
                    try {
                        console.log(`🔍 Fetching details for funding source ${source.funding_id}...`);
                        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.FUNDING_SOURCES}${source.funding_id}`;
                        console.log('🔗 Constructed URL:', url);
                        const sourceResponse = await fetch(url);
                        
                        if (sourceResponse.ok) {
                            const sourceData = await sourceResponse.json();
                            console.log(`Funding source ${source.funding_id} data:`, sourceData);
                            
                            if (sourceData.total_funding) {
                                calculatedTotalFunding += sourceData.total_funding;
                                console.log(`Added ${sourceData.total_funding} to total funding`);
                            }
                            
                            if (sourceData.projects && Array.isArray(sourceData.projects)) {
                                calculatedTotalAllocations += sourceData.projects.length;
                                console.log(`Added ${sourceData.projects.length} projects to total allocations`);
                            }
                        } else {
                            console.warn(`❌ Failed to fetch funding source ${source.funding_id}. Status:`, sourceResponse.status);
                        }
                    } catch (sourceError) {
                        console.warn(`❌ Error fetching funding source ${source.funding_id}:`, sourceError);
                    }
                }
            }
            
            // Update with calculated values
            if (totalAllocationsCount) {
                totalAllocationsCount.textContent = calculatedTotalAllocations;
                console.log('✅ Updated total allocations count (calculated):', calculatedTotalAllocations);
            }
            
            if (totalFundingAmount) {
                totalFundingAmount.textContent = formatCurrency(calculatedTotalFunding);
                console.log('✅ Updated total funding amount (calculated):', formatCurrency(calculatedTotalFunding));
            }
            
            console.log('🎉 Detailed statistics loaded from fallback method');
            
        } catch (error) {
            console.error('❌ Error loading detailed statistics:', error);
            // Keep the default values we set earlier
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
            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            currentFundingSources = await response.json();
            
            // Render funding sources
            renderFundingSources();
            
            // Update results count
            updateResultsCount();
            
            // Load statistics after funding sources are loaded
            console.log('📊 Loading statistics after funding sources...');
            await loadStatistics();
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
            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Update state
            currentAllocations = data.items || data;
            totalPages = data.total_pages || 1;
            
            // Render funding allocations
            renderFundingAllocations();
            
            // Update statistics with allocation data
            await loadStatistics();
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
        currentFundingSources.forEach((source, index) => {
            const card = document.createElement('div');
            card.className = 'funding-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300';
            
            console.log(`🎨 Rendering funding source card ${index + 1}:`, {
                id: source.funding_id,
                name: source.source_name,
                type: source.source_type
            });
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-indigo-800 mb-2 line-clamp-2">${source.source_name}</h2>
                        <span class="type-badge ${getSourceTypeBadgeColor(source.source_type)}">${source.source_type}</span>
                    </div>
                    <div class="dropdown relative ml-4">
                        <button class="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu hidden absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-10 w-40 border border-gray-200">
                            <button class="view-btn block w-full text-left px-4 py-3 hover:bg-indigo-50 text-indigo-700 transition-colors" data-id="${source.funding_id}">
                                <i class="fas fa-eye mr-2"></i> View Details
                            </button>
                            <button class="edit-btn block w-full text-left px-4 py-3 hover:bg-blue-50 text-blue-700 transition-colors" data-id="${source.funding_id}">
                                <i class="fas fa-edit mr-2"></i> Edit Source
                            </button>
                            <button class="delete-btn block w-full text-left px-4 py-3 hover:bg-red-50 text-red-700 transition-colors" data-id="${source.funding_id}">
                                <i class="fas fa-trash mr-2"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
                
                ${source.contact_info ? `
                <div class="mb-4">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-address-card text-indigo-500 mt-1 w-4"></i>
                        <p class="text-gray-600 text-sm line-clamp-3">${source.contact_info}</p>
                    </div>
                </div>
                ` : ''}
                
                <div class="border-t pt-4">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-info-circle mr-1"></i>
                            Funding Source ID: ${source.funding_id}
                        </div>
                        
                        <button class="view-more-btn text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors" data-id="${source.funding_id}">
                            View Details <i class="fas fa-chevron-right ml-1"></i>
                        </button>
                    </div>
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
     * Update results count display
     */
    function updateResultsCount() {
        if (resultsCountEl) {
            const total = currentFundingSources.length;
            const searchQuery = fundingSearchInput.value.trim();
            const typeFilter = filterTypeSelect.value;
            
            if (searchQuery || typeFilter) {
                resultsCountEl.textContent = `Showing ${total} filtered funding sources`;
            } else {
                resultsCountEl.textContent = `Showing all ${total} funding sources`;
            }
        }
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
            await loadFundingSources();
            
            // Refresh statistics
            await loadStatistics();
            
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
                await loadFundingSources();
                
                // Refresh statistics
                await loadStatistics();
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
                await loadFundingAllocations();
                
                // Refresh statistics
                await loadStatistics();
            } catch (error) {
                console.error('Error deleting funding allocation:', error);
                showNotification('Error deleting funding allocation', 'error');
            }
        };
    }

    /**
     * Format currency for display
     */
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

    /**
     * Format date for display
     */
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

    /**
     * Show funding source details in modal
     * @param {string} fundingId - Funding source ID
     */
    async function showFundingDetails(fundingId) {
        try {
            console.log('🔍 Loading funding source details for ID:', fundingId);
            
            // Use the correct API endpoint for funding source details
            const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.FUNDING_SOURCES}${fundingId}`;
            console.log('🔗 Constructed URL for funding source details:', url);
            const response = await fetch(url);
            console.log('Funding source response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const fundingSource = await response.json();
            console.log('Funding source data received:', fundingSource);
            
            const detailsContainer = document.getElementById('funding-details');
            const fundedProjectsContainer = document.getElementById('funded-projects');
            
            // Populate funding source details
            detailsContainer.innerHTML = `
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-indigo-800 mb-2">${fundingSource.source_name}</h2>
                            <span class="type-badge ${getSourceTypeBadgeColor(fundingSource.source_type)}">${fundingSource.source_type}</span>
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-500 mb-1">Funding Source ID</div>
                            <div class="text-lg font-mono text-indigo-600">#${fundingSource.funding_id}</div>
                        </div>
                    </div>
                </div>
                
                ${fundingSource.contact_info ? `
                <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-6 border border-indigo-100">
                    <div class="flex items-center mb-3">
                        <i class="fas fa-address-card text-indigo-600 mr-3 text-lg"></i>
                        <h3 class="text-lg font-semibold text-indigo-800">Contact Information</h3>
                    </div>
                    <p class="text-gray-700 whitespace-pre-line leading-relaxed">${fundingSource.contact_info}</p>
                </div>` : ''}
                
                ${fundingSource.total_funding ? `
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 border border-green-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="flex items-center mb-2">
                                <i class="fas fa-dollar-sign text-green-600 mr-3 text-lg"></i>
                                <h3 class="text-lg font-semibold text-green-800">Total Funding Provided</h3>
                            </div>
                            <p class="text-sm text-gray-600">Combined funding across all projects</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-bold text-green-700">${formatCurrency(fundingSource.total_funding)}</p>
                        </div>
                    </div>
                </div>` : ''}
            `;
            
            // Populate funded projects section
            if (fundingSource.projects && fundingSource.projects.length > 0) {
                const projectsList = document.createElement('div');
                projectsList.className = 'space-y-4';
                
                // Add projects header
                const projectsHeader = document.createElement('div');
                projectsHeader.className = 'mb-4';
                projectsHeader.innerHTML = `
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-project-diagram text-indigo-600 mr-3"></i>
                            Funded Projects (${fundingSource.projects.length})
                        </h3>
                        <div class="text-sm text-gray-500">
                            Total Projects: <span class="font-semibold text-indigo-600">${fundingSource.projects.length}</span>
                        </div>
                    </div>
                `;
                projectsList.appendChild(projectsHeader);
                
                // Add each project
                fundingSource.projects.forEach((project, index) => {
                    const projectItem = document.createElement('div');
                    projectItem.className = 'bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-indigo-200';
                    
                    projectItem.innerHTML = `
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex-1">
                                <div class="flex items-center mb-2">
                                    <span class="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full mr-3">
                                        #${index + 1}
                                    </span>
                                    <h4 class="text-lg font-semibold text-gray-900 line-clamp-2">${project.project_title}</h4>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-dollar-sign text-green-600 w-4"></i>
                                        <div>
                                            <p class="text-sm text-gray-500">Funding Amount</p>
                                            <p class="font-semibold text-green-700">${formatCurrency(project.amount)}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-calendar text-blue-600 w-4"></i>
                                        <div>
                                            <p class="text-sm text-gray-500">Project Duration</p>
                                            <p class="font-semibold text-blue-700">${formatDate(project.start_date)} - ${formatDate(project.end_date)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                ${project.grant_number ? `
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-hashtag text-purple-600 w-4"></i>
                                    <div>
                                        <p class="text-sm text-gray-500">Grant Number</p>
                                        <p class="font-mono font-semibold text-purple-700">${project.grant_number}</p>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="ml-4 flex flex-col items-end space-y-2">
                                <a href="projects.html?id=${project.project_id}" 
                                   class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2">
                                    <i class="fas fa-external-link-alt"></i>
                                    <span class="text-sm font-medium">View Project</span>
                                </a>
                            </div>
                        </div>
                    `;
                    
                    projectsList.appendChild(projectItem);
                });
                
                fundedProjectsContainer.innerHTML = '';
                fundedProjectsContainer.appendChild(projectsList);
            } else {
                fundedProjectsContainer.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-folder-open text-gray-300 text-4xl mb-4"></i>
                        <p class="text-lg text-gray-600 mb-2">No Projects Currently Funded</p>
                        <p class="text-gray-500">This funding source hasn't been allocated to any projects yet.</p>
                    </div>
                `;
            }
            
            // Show detail modal
            detailModal.classList.remove('hidden');
            console.log('✅ Funding source details modal displayed successfully');
            
        } catch (error) {
            console.error('❌ Error loading funding source details:', error);
            showNotification('Error loading funding source details. Please try again.', 'error');
        }
    }
});
