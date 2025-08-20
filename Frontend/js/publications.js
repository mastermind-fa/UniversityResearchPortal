// Publications page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const publicationsList = document.getElementById('publications-list');
    const loadingIndicator = document.getElementById('loading');
    const noPublicationsMessage = document.getElementById('no-publications');
    const publicationsTableBody = document.getElementById('publications-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    const addPublicationBtn = document.getElementById('add-publication-btn');
    const publicationModal = document.getElementById('publication-modal');
    const modalTitle = document.getElementById('modal-title');
    const publicationForm = document.getElementById('publication-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const addAuthorBtn = document.getElementById('add-author-btn');
    const authorsContainer = document.getElementById('authors-container');
    
    const pubSearchInput = document.getElementById('pub-search');
    const filterTypeSelect = document.getElementById('filter-type');
    const filterYearSelect = document.getElementById('filter-year');
    const searchBtn = document.getElementById('search-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const resultsCountEl = document.getElementById('results-count');
    
    // Statistics elements
    const totalPublicationsCount = document.getElementById('total-publications-count');
    const journalArticlesCount = document.getElementById('journal-articles-count');
    const totalCitationsCount = document.getElementById('total-citations-count');
    const totalAuthorsCount = document.getElementById('total-authors-count');

    // Form fields
    const pubIdInput = document.getElementById('pub-id');
    const pubTitleInput = document.getElementById('pub-title');
    const pubTypeSelect = document.getElementById('pub-type');
    const journalNameInput = document.getElementById('journal-name');
    const pubDateInput = document.getElementById('pub-date');
    const doiInput = document.getElementById('doi');
    const citationCountInput = document.getElementById('citation-count');
    const projectIdSelect = document.getElementById('project-id');

    // State variables
    let currentPublications = [];
    let currentPublicationId = null;
    let currentPage = 1;
    let totalPages = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    let facultyList = []; // For populating author dropdown
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        loadPublications();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            pubSearchInput.focus();
        }
    });

    // Search input events
    pubSearchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        loadPublications();
    }, 300));

    // Filter change events
    filterTypeSelect.addEventListener('change', () => {
        currentPage = 1;
        loadPublications();
    });

    filterYearSelect.addEventListener('change', () => {
        currentPage = 1;
        loadPublications();
    });

    // Clear filters
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal events
    addPublicationBtn.addEventListener('click', showAddPublicationModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    publicationForm.addEventListener('submit', savePublication);
    addAuthorBtn.addEventListener('click', addAuthorField);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
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

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
            detailModal.classList.add('hidden');
        }
    });

    /**
     * Initialize the page
     */
    async function initPage() {
        // Populate years filter
        populateYearsFilter();
        
        // Load faculty for author dropdown
        await loadFaculty();
        
        // Load projects for project dropdown
        await loadProjects();
        
        // Load initial publications
        await loadPublications();
        await loadStatistics();
        
        // Setup event delegation for action buttons
        setupEventDelegation();
    }

    /**
     * Populate years filter dropdown
     */
    function populateYearsFilter() {
        const currentYear = new Date().getFullYear();
        const startYear = 2000; // Adjust as needed
        
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            filterYearSelect.appendChild(option);
        }
    }
    
    /**
     * Load faculty list for author dropdown
     */
    async function loadFaculty() {
        try {
            facultyList = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
        } catch (error) {
            console.error('Error loading faculty:', error);
            showNotification('Error loading faculty data', 'error');
        }
    }
    
    /**
     * Load projects for project dropdown
     */
    async function loadProjects() {
        try {
            const projects = await fetchAPI(CONFIG.ENDPOINTS.PROJECTS);
            
            // Clear existing options except the default one
            projectIdSelect.innerHTML = '<option value="">Select Project</option>';
            
            // Add project options
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.project_id;
                option.textContent = project.project_title;
                projectIdSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
            showNotification('Error loading projects data', 'error');
        }
    }

    /**
     * Load publication statistics
     */
    async function loadStatistics() {
        try {
            if (currentPublications.length > 0) {
                // Calculate statistics
                const totalPublications = currentPublications.length;
                const journalArticles = currentPublications.filter(pub => 
                    pub.publication_type === 'Journal Article'
                ).length;
                const totalCitations = currentPublications.reduce((sum, pub) => 
                    sum + (pub.citation_count || 0), 0
                );
                
                // Count unique authors (this would need to be calculated from author data)
                const uniqueAuthors = new Set();
                currentPublications.forEach(pub => {
                    if (pub.authors) {
                        pub.authors.forEach(author => {
                            uniqueAuthors.add(author.faculty_id);
                        });
                    }
                });
                const totalAuthors = uniqueAuthors.size;
                
                // Update statistics display
                if (totalPublicationsCount) totalPublicationsCount.textContent = totalPublications;
                if (journalArticlesCount) journalArticlesCount.textContent = journalArticles;
                if (totalCitationsCount) totalCitationsCount.textContent = totalCitations;
                if (totalAuthorsCount) totalAuthorsCount.textContent = totalAuthors;
                
                console.log('Statistics loaded:', { 
                    totalPublications, 
                    journalArticles, 
                    totalCitations, 
                    totalAuthors 
                });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    /**
     * Setup event delegation for action buttons
     */
    function setupEventDelegation() {
        // Handle card actions: view, edit, delete
        const publicationsGrid = document.getElementById('publications-grid');
        if (publicationsGrid) {
            console.log('🎯 Setting up event delegation for publications grid');
                    publicationsGrid.addEventListener('click', (e) => {
            console.log('🎯 Grid click event:', e.target.tagName, e.target.className);
            
            const target = e.target.closest('button');
            if (!target) {
                console.log('🎯 No button found in click target');
                return;
            }
            
            const pubId = target.dataset.id;
            console.log('🎯 Button clicked:', target.className, 'Publication ID:', pubId, 'Dataset:', target.dataset);
            
            if (target.classList.contains('view-btn')) {
                console.log('👁️ View button clicked for publication:', pubId);
                showPublicationDetails(pubId);
            } else if (target.classList.contains('edit-btn')) {
                console.log('✏️ Edit button clicked for publication:', pubId);
                showEditPublicationModal(pubId);
            } else if (target.classList.contains('delete-btn')) {
                console.log('🗑️ Delete button clicked for publication:', pubId);
                showDeleteConfirmation(pubId);
            }
        });
        } else {
            console.error('❌ Publications grid not found for event delegation');
        }
    }

    /**
     * Load publications with filtering
     */
    async function loadPublications() {
        // Show loading
        loadingIndicator.classList.remove('hidden');
        publicationsList.classList.add('hidden');
        noPublicationsMessage.classList.add('hidden');
        
        const searchQuery = pubSearchInput.value.trim();
        const typeFilter = filterTypeSelect.value;
        const yearFilter = filterYearSelect.value;
        
        try {
            // Construct query params
            let endpoint = CONFIG.ENDPOINTS.PUBLICATIONS;
            const queryParams = [];
            
            if (searchQuery) {
                queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
            }
            
            if (typeFilter) {
                queryParams.push(`type=${encodeURIComponent(typeFilter)}`);
            }
            
            if (yearFilter) {
                queryParams.push(`year=${yearFilter}`);
            }
            
            // Add pagination params
            queryParams.push(`page=${currentPage}`);
            queryParams.push(`limit=${itemsPerPage}`);
            
            if (queryParams.length > 0) {
                endpoint += `?${queryParams.join('&')}`;
            }
            
            // Fetch publications
            const response = await fetch(CONFIG.API_BASE_URL + endpoint);
            console.log('📡 Publications API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('📊 Publications data received:', data);
            
            // Update state
            currentPublications = data.items || data;
            totalPages = data.total_pages || 1;
            
            console.log('📋 Processed publications:', {
                count: currentPublications.length,
                totalPages: totalPages,
                firstPublication: currentPublications[0]
            });
            
            // Render publications
            renderPublications();
            
            // Load statistics
            await loadStatistics();
        } catch (error) {
            console.error('Error loading publications:', error);
            showNotification('Error loading publications', 'error');
            loadingIndicator.classList.add('hidden');
        }
    }

        /**
     * Render publications in card layout
     */
    function renderPublications() {
        // Hide loading
        loadingIndicator.classList.add('hidden');
        
        if (currentPublications.length === 0) {
            noPublicationsMessage.classList.remove('hidden');
            return;
        }
        
        // Show publications list
        publicationsList.classList.remove('hidden');
        
        // Clear existing cards
        const publicationsGrid = document.getElementById('publications-grid');
        publicationsGrid.innerHTML = '';
        
        // Add publication cards
        currentPublications.forEach((pub, index) => {
            const card = document.createElement('div');
            card.className = 'publication-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300';
            
            // Get type badge color
            const typeBadgeColor = getTypeBadgeColor(pub.publication_type);
            
            console.log(`🎨 Rendering publication card ${index + 1}:`, {
                id: pub.publication_id,
                title: pub.title,
                type: pub.publication_type
            });
            
            card.innerHTML = `
                <div class="flex items-start justify-between mb-4">
                    <span class="type-badge ${typeBadgeColor}">${pub.publication_type}</span>
                    <span class="citation-badge">${pub.citation_count || '0'} citations</span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">${pub.title}</h3>
                
                <div class="space-y-3 mb-4">
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-newspaper w-4 mr-2 text-indigo-500"></i>
                        <span>${pub.journal_name || 'Journal not specified'}</span>
                    </div>
                    
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-calendar w-4 mr-2 text-indigo-500"></i>
                        <span>${formatDate(pub.publication_date)}</span>
                    </div>
                    
                    ${pub.doi ? `
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-link w-4 mr-2 text-indigo-500"></i>
                        <span class="truncate">${pub.doi}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="border-t pt-4">
                    <div class="flex justify-between items-center">
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-user-edit mr-1"></i>
                            ${pub.authors ? pub.authors.length : 0} authors
                        </div>
                        
                        <div class="flex space-x-2">
                            <button class="view-btn action-btn text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-colors" data-id="${pub.publication_id}" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="edit-btn action-btn text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors" data-id="${pub.publication_id}" title="Edit Publication">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn action-btn text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors" data-id="${pub.publication_id}" title="Delete Publication">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            publicationsGrid.appendChild(card);
        });
        
        // Update pagination
        renderPagination();
        
        // Update results count
        updateResultsCount();
    }

    /**
     * Get type badge color class
     */
    function getTypeBadgeColor(type) {
        const colors = {
            'Journal Article': 'bg-green-100 text-green-800',
            'Conference Paper': 'bg-blue-100 text-blue-800',
            'Book Chapter': 'bg-purple-100 text-purple-800',
            'Book': 'bg-indigo-100 text-indigo-800',
            'Patent': 'bg-orange-100 text-orange-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Update results count display
     */
    function updateResultsCount() {
        if (resultsCountEl) {
            const total = currentPublications.length;
            const searchQuery = pubSearchInput.value.trim();
            const typeFilter = filterTypeSelect.value;
            const yearFilter = filterYearSelect.value;
            
            if (searchQuery || typeFilter || yearFilter) {
                resultsCountEl.textContent = `Showing ${total} filtered publications`;
            } else {
                resultsCountEl.textContent = `Showing all ${total} publications`;
            }
        }
    }

    /**
     * Render pagination controls
     */
    function renderPagination() {
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalItems = document.getElementById('total-items');
        
        if (!prevBtn || !nextBtn) return;
        
        // Update pagination info
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(currentPage * itemsPerPage, currentPublications.length);
        const total = currentPublications.length;
        
        if (showingStart) showingStart.textContent = start;
        if (showingEnd) showingEnd.textContent = end;
        if (totalItems) totalItems.textContent = total;
        
        // Update button states
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
        
        // Add event listeners
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadPublications();
            }
        };
        
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadPublications();
            }
        };
    }

    /**
     * Show add publication modal
     */
    function showAddPublicationModal() {
        // Reset form
        publicationForm.reset();
        pubIdInput.value = '';
        authorsContainer.innerHTML = '';
        
        // Add first author field
        addAuthorField();
        
        // Update modal title
        modalTitle.textContent = 'Add Publication';
        
        // Show modal
        publicationModal.classList.remove('hidden');
    }

    /**
     * Show edit publication modal
     * @param {string} pubId - Publication ID
     */
    async function showEditPublicationModal(pubId) {
        try {
            // Get publication details
            const publication = await fetchAPI(`${CONFIG.ENDPOINTS.PUBLICATIONS}/${pubId}`);
            
            // Populate form fields
            pubIdInput.value = publication.publication_id;
            pubTitleInput.value = publication.title;
            pubTypeSelect.value = publication.publication_type;
            journalNameInput.value = publication.journal_name || '';
            pubDateInput.value = publication.publication_date ? publication.publication_date.split('T')[0] : '';
            doiInput.value = publication.doi || '';
            citationCountInput.value = publication.citation_count || '';
            projectIdSelect.value = publication.project_id || '';
            
            // Clear authors container
            authorsContainer.innerHTML = '';
            
            // Populate authors
            if (publication.authors && publication.authors.length > 0) {
                publication.authors.forEach(author => {
                    addAuthorField(author);
                });
            } else {
                addAuthorField();
            }
            
            // Update modal title
            modalTitle.textContent = 'Edit Publication';
            
            // Show modal
            publicationModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading publication details:', error);
            showNotification('Error loading publication details', 'error');
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
     * Add author field to form
     * @param {Object} authorData - Existing author data for edit mode
     */
    function addAuthorField(authorData = null) {
        const authorIndex = document.querySelectorAll('.author-row').length;
        const authorRow = document.createElement('div');
        authorRow.className = 'author-row grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 border border-gray-200 rounded-lg';
        
        // Create faculty dropdown options
        const facultyOptions = facultyList.map(faculty => {
            const selected = authorData && authorData.faculty_id === faculty.faculty_id ? 'selected' : '';
            return `<option value="${faculty.faculty_id}" ${selected}>${faculty.first_name} ${faculty.last_name}</option>`;
        }).join('');
        
        authorRow.innerHTML = `
            <div>
                <label class="block text-gray-700 text-sm mb-1">Faculty*</label>
                <select name="author_faculty_${authorIndex}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500">
                    <option value="">Select Faculty</option>
                    ${facultyOptions}
                </select>
            </div>
            <div>
                <label class="block text-gray-700 text-sm mb-1">Author Order*</label>
                <input type="number" name="author_order_${authorIndex}" value="${authorData ? authorData.author_order : authorIndex + 1}" min="1" required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500">
            </div>
            <div class="flex items-center">
                <div class="flex-grow">
                    <label class="block text-gray-700 text-sm mb-1">Corresponding Author?</label>
                    <div class="mt-1">
                        <label class="inline-flex items-center">
                            <input type="radio" name="is_corresponding_${authorIndex}" value="Y" ${authorData && authorData.is_corresponding === 'Y' ? 'checked' : ''} 
                                class="form-radio h-4 w-4 text-indigo-600">
                            <span class="ml-2 text-sm">Yes</span>
                        </label>
                        <label class="inline-flex items-center ml-4">
                            <input type="radio" name="is_corresponding_${authorIndex}" value="N" ${!authorData || authorData.is_corresponding !== 'Y' ? 'checked' : ''} 
                                class="form-radio h-4 w-4 text-red-600">
                            <span class="ml-2 text-sm">No</span>
                        </label>
                    </div>
                </div>
                ${authorIndex > 0 ? `
                <button type="button" class="remove-author-btn ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 focus:outline-none mt-6">
                    <i class="fas fa-times"></i>
                </button>` : ''}
            </div>
        `;
        
        authorsContainer.appendChild(authorRow);
        
        // Add event listener to remove button
        const removeBtn = authorRow.querySelector('.remove-author-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                authorRow.remove();
            });
        }
    }

    /**
     * Close publication modal
     */
    function closeModal() {
        publicationModal.classList.add('hidden');
    }

    /**
     * Save publication data
     * @param {Event} e - Form submission event
     */
    async function savePublication(e) {
        e.preventDefault();
        
        // Validate form
        if (!publicationForm.checkValidity()) {
            publicationForm.reportValidity();
            return;
        }
        
        // Collect form data
        const formData = {
            title: pubTitleInput.value.trim(),
            publication_type: pubTypeSelect.value,
            journal_name: journalNameInput.value.trim(),
            publication_date: pubDateInput.value,
            doi: doiInput.value.trim() || null,
            citation_count: citationCountInput.value ? parseInt(citationCountInput.value) : 0,
            project_id: projectIdSelect.value || null
        };
        
        // Collect authors data
        const authorRows = document.querySelectorAll('.author-row');
        const authors = Array.from(authorRows).map((row, index) => {
            const facultySelect = row.querySelector(`[name="author_faculty_${index}"]`);
            const orderInput = row.querySelector(`[name="author_order_${index}"]`);
            const isCorrespondingInput = row.querySelector(`[name="is_corresponding_${index}"]:checked`);
            
            return {
                faculty_id: facultySelect.value,
                author_order: parseInt(orderInput.value),
                is_corresponding: isCorrespondingInput.value
            };
        });
        
        formData.authors = authors;
        
        try {
            // Determine if it's an add or update operation
            const pubId = pubIdInput.value;
            let response;
            
            if (pubId) {
                // Update publication
                response = await fetchAPI(`${CONFIG.ENDPOINTS.PUBLICATIONS}/${pubId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                showNotification('Publication updated successfully', 'success');
            } else {
                // Add new publication
                response = await fetchAPI(CONFIG.ENDPOINTS.PUBLICATIONS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                showNotification('Publication added successfully', 'success');
            }
            
            // Close modal and reload data
            closeModal();
            loadPublications();
            
        } catch (error) {
            console.error('Error saving publication:', error);
            showNotification('Error saving publication data', 'error');
        }
    }

    /**
     * Show delete confirmation modal
     * @param {string} pubId - Publication ID
     */
    function showDeleteConfirmation(pubId) {
        currentPublicationId = pubId;
        deleteModal.classList.remove('hidden');
        
        // Set up confirm delete button
        confirmDeleteBtn.onclick = async () => {
            try {
                await fetchAPI(`${CONFIG.ENDPOINTS.PUBLICATIONS}/${pubId}`, {
                    method: 'DELETE'
                });
                
                showNotification('Publication deleted successfully', 'success');
                deleteModal.classList.add('hidden');
                loadPublications();
            } catch (error) {
                console.error('Error deleting publication:', error);
                showNotification('Error deleting publication', 'error');
            }
        };
    }

    /**
     * Clear all filters and search
     */
    function clearFilters() {
        pubSearchInput.value = '';
        filterTypeSelect.value = '';
        filterYearSelect.value = '';
        currentPage = 1;
        loadPublications();
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
     * Show publication details in modal
     * @param {string} pubId - Publication ID
     */
    async function showPublicationDetails(pubId) {
        try {
            console.log('🔍 Fetching publication details for ID:', pubId);
            
            // Fetch publication details from the correct endpoint
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PUBLICATIONS}/${pubId}`);
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const publication = await response.json();
            console.log('✅ Publication data received:', publication);
            
            const detailsContainer = document.getElementById('publication-details');
            const authorsList = document.getElementById('authors-list');
            
            console.log('🔍 Modal elements found:', {
                detailsContainer: !!detailsContainer,
                authorsList: !!authorsList,
                detailModal: !!detailModal
            });
            
            if (!detailsContainer || !authorsList) {
                console.error('❌ Modal elements not found');
                return;
            }
            
            // Populate details with enhanced styling
            detailsContainer.innerHTML = `
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-2xl font-bold text-indigo-800 line-clamp-2">${publication.title || 'Untitled Publication'}</h2>
                        <span class="type-badge ${getTypeBadgeColor(publication.publication_type)}">${publication.publication_type || 'Unknown Type'}</span>
                    </div>
                    <div class="flex items-center space-x-4 text-gray-600">
                        <div class="flex items-center">
                            <i class="fas fa-calendar mr-2 text-indigo-500"></i>
                            <span>${formatDate(publication.publication_date)}</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-quote-right mr-2 text-orange-500"></i>
                            <span>${publication.citation_count || '0'} citations</span>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="space-y-3">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-gray-800 mb-2">Publication Information</h3>
                            <div class="space-y-2">
                                <p class="text-gray-700">
                                    <span class="font-medium">Journal/Source:</span> 
                                    <span class="ml-2">${publication.journal_name || 'Not specified'}</span>
                                </p>
                                ${publication.doi ? `
                                <p class="text-gray-700">
                                    <span class="font-medium">DOI:</span> 
                                    <span class="ml-2 font-mono text-sm">${publication.doi}</span>
                                </p>
                                ` : ''}
                                ${publication.description ? `
                                <p class="text-gray-700">
                                    <span class="font-medium">Description:</span> 
                                    <span class="ml-2">${publication.description}</span>
                                </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-gray-800 mb-2">Project Information</h3>
                            ${publication.project_id ? `
                            <div class="space-y-2">
                                <p class="text-gray-700">
                                    <span class="font-medium">Related Project:</span> 
                                    <a href="projects.html?id=${publication.project_id}" class="ml-2 text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                                        ${publication.project_title || `View Project #${publication.project_id}`}
                                    </a>
                                </p>
                                <p class="text-gray-700">
                                    <span class="font-medium">Project ID:</span> 
                                    <span class="ml-2">${publication.project_id}</span>
                                </p>
                            </div>
                            ` : '<p class="text-gray-500 italic">No related project</p>'}
                        </div>
                    </div>
                </div>
            `;
            
            // Populate authors with enhanced styling
            authorsList.innerHTML = '';
            
            if (publication.authors && publication.authors.length > 0) {
                const authorsContainer = document.createElement('div');
                authorsContainer.className = 'space-y-3';
                
                publication.authors.forEach((author, index) => {
                    const authorCard = document.createElement('div');
                    authorCard.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors';
                    
                    authorCard.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span class="text-indigo-600 font-semibold">${index + 1}</span>
                                </div>
                                <div>
                                    <p class="text-gray-900 font-semibold">${author.name || 'Unknown Author'}</p>
                                    <p class="text-gray-500 text-sm">Faculty ID: ${author.faculty_id}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-500 text-sm mb-1">Order: ${author.author_order || index + 1}</p>
                                ${author.is_corresponding === 'Y' ? 
                                    '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Corresponding Author</span>' : 
                                    '<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Co-Author</span>'}
                            </div>
                        </div>
                    `;
                    
                    authorsContainer.appendChild(authorCard);
                });
                
                authorsList.appendChild(authorsContainer);
            } else {
                authorsList.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-user-edit text-gray-300 text-4xl mb-3"></i>
                        <p class="text-gray-500">No authors found for this publication</p>
                        <p class="text-gray-400 text-sm">Authors information may not be available</p>
                    </div>
                `;
            }
            
            // Show detail modal
            console.log('🎭 Showing detail modal...');
            detailModal.classList.remove('hidden');
            console.log('✅ Publication details modal displayed successfully');
            
            // Verify modal is visible
            setTimeout(() => {
                const isVisible = !detailModal.classList.contains('hidden');
                console.log('👁️ Modal visibility check:', isVisible);
                console.log('🎭 Modal classes:', detailModal.className);
            }, 100);
            
        } catch (error) {
            console.error('❌ Error loading publication details:', error);
            showNotification('Error loading publication details. Please try again.', 'error');
        }
    }
});
