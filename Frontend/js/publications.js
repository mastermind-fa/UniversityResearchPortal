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
        loadPublications();
        
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
     * Setup event delegation for action buttons
     */
    function setupEventDelegation() {
        // Handle table actions: view, edit, delete
        publicationsTableBody.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            
            const pubId = target.dataset.id;
            
            if (target.classList.contains('view-btn')) {
                showPublicationDetails(pubId);
            } else if (target.classList.contains('edit-btn')) {
                showEditPublicationModal(pubId);
            } else if (target.classList.contains('delete-btn')) {
                showDeleteConfirmation(pubId);
            }
        });
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
            const response = await fetchAPI(endpoint);
            
            // Update state
            currentPublications = response.items || response;
            totalPages = response.total_pages || 1;
            
            // Render publications
            renderPublications();
        } catch (error) {
            console.error('Error loading publications:', error);
            showNotification('Error loading publications', 'error');
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Render publications table
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
        
        // Clear existing rows
        publicationsTableBody.innerHTML = '';
        
        // Add publication rows
        currentPublications.forEach(pub => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${pub.title}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${pub.publication_type}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${pub.journal_name || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${formatDate(pub.publication_date)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${pub.citation_count || '0'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="view-btn text-indigo-600 hover:text-indigo-900 mr-3" data-id="${pub.publication_id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${pub.publication_id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn text-red-600 hover:text-red-900" data-id="${pub.publication_id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            publicationsTableBody.appendChild(row);
        });
        
        // Update pagination
        renderPagination();
    }

    /**
     * Render pagination controls
     */
    function renderPagination() {
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        const pagination = createPagination(currentPage, totalPages, (page) => {
            currentPage = page;
            loadPublications();
        });
        
        paginationContainer.appendChild(pagination);
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
     * Show publication details in modal
     * @param {string} pubId - Publication ID
     */
    async function showPublicationDetails(pubId) {
        try {
            const publication = await fetchAPI(`${CONFIG.ENDPOINTS.PUBLICATIONS}/${pubId}`);
            const detailsContainer = document.getElementById('publication-details');
            const authorsList = document.getElementById('authors-list');
            
            // Populate details
            detailsContainer.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-indigo-800 mb-2">${publication.title}</h2>
                    <p class="text-gray-500">${publication.publication_type} - ${formatDate(publication.publication_date)}</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-gray-700"><span class="font-medium">Journal/Source:</span> ${publication.journal_name || 'N/A'}</p>
                        <p class="text-gray-700 mt-2"><span class="font-medium">Citation Count:</span> ${publication.citation_count || '0'}</p>
                        ${publication.doi ? `<p class="text-gray-700 mt-2"><span class="font-medium">DOI:</span> ${publication.doi}</p>` : ''}
                    </div>
                    <div>
                        ${publication.project_id ? `
                        <p class="text-gray-700"><span class="font-medium">Related Project:</span> 
                            <a href="projects.html?id=${publication.project_id}" class="text-indigo-600 hover:underline">
                                ${publication.project_title || `View Project #${publication.project_id}`}
                            </a>
                        </p>` : ''}
                    </div>
                </div>
            `;
            
            // Populate authors
            authorsList.innerHTML = '';
            
            if (publication.authors && publication.authors.length > 0) {
                const authorsList = document.createElement('ul');
                authorsList.className = 'divide-y divide-gray-200';
                
                publication.authors.forEach(author => {
                    const authorItem = document.createElement('li');
                    authorItem.className = 'py-3';
                    
                    authorItem.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-gray-900 font-medium">${author.first_name} ${author.last_name}</p>
                                <p class="text-gray-500 text-sm">${author.position || 'Faculty'}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-500 text-sm">Order: ${author.author_order}</p>
                                ${author.is_corresponding === 'Y' ? 
                                    '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Corresponding Author</span>' : ''}
                            </div>
                        </div>
                    `;
                    
                    authorsList.appendChild(authorItem);
                });
                
                document.getElementById('authors-list').appendChild(authorsList);
            } else {
                document.getElementById('authors-list').innerHTML = '<p class="text-gray-500">No authors found</p>';
            }
            
            // Show detail modal
            detailModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading publication details:', error);
            showNotification('Error loading publication details', 'error');
        }
    }
});
