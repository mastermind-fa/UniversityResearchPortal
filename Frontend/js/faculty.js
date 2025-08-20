// Faculty page script - Professional & Feature-Rich

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const facultyList = document.getElementById('faculty-list');
    const facultyData = document.getElementById('faculty-data');
    const loadingIndicator = document.getElementById('loading');
    const noFacultyMessage = document.getElementById('no-faculty');
    const addFacultyBtn = document.getElementById('add-faculty-btn');
    const facultyModal = document.getElementById('faculty-modal');
    const modalTitle = document.getElementById('modal-title');
    const facultyForm = document.getElementById('faculty-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    
    const facultySearchInput = document.getElementById('faculty-search');
    const departmentFilter = document.getElementById('department-filter');
    const searchBtn = document.getElementById('search-btn');
    const resultsCountEl = document.getElementById('results-count');
    
    // Statistics elements
    const totalFacultyCountEl = document.getElementById('total-faculty-count');
    const activeProjectsCountEl = document.getElementById('active-projects-count');
    const departmentsCountEl = document.getElementById('departments-count');
    const avgExperienceEl = document.getElementById('avg-experience');
    
    // Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form fields
    const facultyIdInput = document.getElementById('faculty-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const positionInput = document.getElementById('position');
    const departmentSelect = document.getElementById('department');
    const hireDateInput = document.getElementById('hire-date');
    const salaryInput = document.getElementById('salary');
    const researchInterestsInput = document.getElementById('research-interests');

    // State variables
    let allFaculty = [];
    let filteredFaculty = [];
    let departments = [];
    let currentFacultyId = null;
    let currentPage = 1;
    let itemsPerPage = 10; // Default items per page
    
    // Initialize page
    initPage();

    // Event listeners
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (facultySearchInput) facultySearchInput.addEventListener('input', handleSearch);
    if (departmentFilter) departmentFilter.addEventListener('change', handleSearch);
    
    if (addFacultyBtn) addFacultyBtn.addEventListener('click', showAddFacultyModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (facultyForm) facultyForm.addEventListener('submit', saveFaculty);
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => {
        console.log('🔄 Closing faculty detail modal...');
        detailModal.classList.add('hidden');
    });
    
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => {
        console.log('🔄 Closing faculty detail modal...');
        detailModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                console.log('🔄 Closing faculty detail modal (clicked outside)...');
                detailModal.classList.add('hidden');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (detailModal && !detailModal.classList.contains('hidden')) {
                console.log('🔄 Closing faculty detail modal (Escape key)...');
                detailModal.classList.add('hidden');
            }
            if (facultyModal && !facultyModal.classList.contains('hidden')) {
                console.log('🔄 Closing faculty form modal (Escape key)...');
                facultyModal.classList.add('hidden');
            }
            if (deleteModal && !deleteModal.classList.contains('hidden')) {
                console.log('🔄 Closing delete modal (Escape key)...');
                deleteModal.classList.add('hidden');
            }
        }
    });
    
    // Pagination
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderFaculty();
        }
    });
    
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredFaculty.length) {
            currentPage++;
            renderFaculty();
        }
    });

    function debugElementStates() {
        console.log('🔍 Debugging element states...');
        console.log('Loading indicator:', {
            element: loadingIndicator,
            hidden: loadingIndicator ? loadingIndicator.classList.contains('hidden') : 'N/A',
            visible: loadingIndicator ? !loadingIndicator.classList.contains('hidden') : 'N/A'
        });
        console.log('Faculty list:', {
            element: facultyList,
            hidden: facultyList ? facultyList.classList.contains('hidden') : 'N/A',
            visible: facultyList ? !facultyList.classList.contains('hidden') : 'N/A'
        });
        console.log('No faculty message:', {
            element: noFacultyMessage,
            hidden: noFacultyMessage ? noFacultyMessage.classList.contains('hidden') : 'N/A',
            visible: noFacultyMessage ? !noFacultyMessage.classList.contains('hidden') : 'N/A'
        });
        console.log('Faculty data:', {
            element: facultyData,
            children: facultyData ? facultyData.children.length : 'N/A'
        });
    }

    async function initPage() {
        console.log('🚀 Initializing faculty page...');
        
        // Ensure loading indicator is hidden initially
        hideLoadingState();
        
        try {
            // Load departments first
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            console.log('🏢 Loaded departments:', departments);
            populateDepartmentFilters();
            
            // Load faculty data
            await loadFaculty();
        } catch (error) {
            console.error('❌ Error initializing page:', error);
            showNotification('Failed to initialize page', 'error');
        }
    }

    function populateDepartmentFilters() {
        console.log('🔧 Populating department filters...');
        
        // Clear existing options except the first one
        if (departmentFilter) {
            while (departmentFilter.options.length > 1) {
                departmentFilter.remove(1);
            }
        }
        
        if (departmentSelect) {
            departmentSelect.innerHTML = '<option value="">Select Department</option>';
        }
        
        // Add department options
        departments.forEach(dept => {
            if (departmentFilter) {
                const option1 = document.createElement('option');
                option1.value = dept.dept_id;
                option1.textContent = dept.dept_name;
                departmentFilter.appendChild(option1);
            }
            
            if (departmentSelect) {
                const option2 = document.createElement('option');
                option2.value = dept.dept_id;
                option2.textContent = dept.dept_name;
                departmentSelect.appendChild(option2);
            }
        });
        
        console.log('✅ Department filters populated');
    }

    async function loadFaculty() {
        console.log('👥 Loading faculty data...');
        
        // Show loading state
        showLoadingState();
        debugElementStates();
        
        try {
            // Fetch faculty from backend API
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allFaculty = await response.json();
            console.log('📊 Loaded faculty:', allFaculty);
            
            // Load statistics
            await loadStatistics();
            
            // Apply initial filtering
            filterFaculty();
            
            // Hide loading state after successful load
            hideLoadingState();
            debugElementStates();
            
        } catch (error) {
            console.error('❌ Error loading faculty:', error);
            showNotification('Failed to load faculty members', 'error');
            showErrorState();
        }
    }

    async function loadStatistics() {
        try {
            console.log('📊 Loading faculty statistics...');
            
            // Update faculty count
            if (totalFacultyCountEl) {
                totalFacultyCountEl.textContent = allFaculty.length;
            }
            
            // Update departments count
            if (departmentsCountEl) {
                departmentsCountEl.textContent = departments.length;
            }
            
            // Calculate average experience
            if (avgExperienceEl && allFaculty.length > 0) {
                const currentYear = new Date().getFullYear();
                const totalExperience = allFaculty.reduce((sum, faculty) => {
                    if (faculty.hire_date) {
                        const hireYear = new Date(faculty.hire_date).getFullYear();
                        return sum + (currentYear - hireYear);
                    }
                    return sum;
                }, 0);
                const avgExperience = totalExperience / allFaculty.length;
                avgExperienceEl.textContent = avgExperience.toFixed(1);
                console.log('⏰ Average experience calculated:', avgExperience);
            }
            
            // Load active projects count
            await loadActiveProjectsCount();
            
            console.log('✅ Statistics loaded successfully');
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
        }
    }

    async function loadActiveProjectsCount() {
        try {
            const projectsResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
            if (projectsResponse.ok) {
                const allProjects = await projectsResponse.json();
                const activeProjects = allProjects.filter(project => project.status === 'Active');
                
                if (activeProjectsCountEl) {
                    activeProjectsCountEl.textContent = activeProjects.length;
                    console.log('🔬 Active projects count:', activeProjects.length);
                }
            }
        } catch (error) {
            console.error('❌ Error loading active projects count:', error);
            if (activeProjectsCountEl) {
                activeProjectsCountEl.textContent = 'N/A';
            }
        }
    }

    function showLoadingState() {
        console.log('🔄 Showing loading state...');
        if (facultyList) facultyList.classList.add('hidden');
        if (noFacultyMessage) noFacultyMessage.classList.add('hidden');
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
        console.log('✅ Loading state shown');
    }

    function hideLoadingState() {
        console.log('🔄 Hiding loading state...');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        console.log('✅ Loading state hidden');
    }

    function showErrorState() {
        hideLoadingState();
        if (facultyList) facultyList.classList.add('hidden');
        if (noFacultyMessage) {
            noFacultyMessage.innerHTML = `
                <div class="text-center py-10">
                    <i class="fas fa-exclamation-triangle text-red-300 text-5xl mb-4"></i>
                    <p class="text-xl text-gray-600">Failed to load faculty data</p>
                    <p class="text-gray-500 mb-4">Please try refreshing the page</p>
                    <button onclick="location.reload()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-redo mr-2"></i>Refresh Page
                    </button>
                </div>
            `;
            noFacultyMessage.classList.remove('hidden');
        }
    }

    function handleSearch() {
        console.log('🔍 Handling search...');
        currentPage = 1;
        filterFaculty();
    }

    function filterFaculty() {
        const searchTerm = facultySearchInput ? facultySearchInput.value.trim().toLowerCase() : '';
        const deptId = departmentFilter && departmentFilter.value ? parseInt(departmentFilter.value) : null;
        
        console.log('🔍 Filtering faculty with:', { searchTerm, deptId });
        
        filteredFaculty = allFaculty.filter(faculty => {
            const fullName = `${faculty.first_name || ''} ${faculty.last_name || ''}`.toLowerCase();
            const expertise = (faculty.expertise || '').toLowerCase();
            const researchInterests = (faculty.research_interests || '').toLowerCase();
            const position = (faculty.position || '').toLowerCase();
            const email = (faculty.email || '').toLowerCase();
            
            const matchesSearch = !searchTerm || 
                fullName.includes(searchTerm) || 
                expertise.includes(searchTerm) ||
                researchInterests.includes(searchTerm) ||
                position.includes(searchTerm) ||
                email.includes(searchTerm);
            
            const matchesDepartment = !deptId || faculty.dept_id === deptId;
            
            return matchesSearch && matchesDepartment;
        });
        
        console.log(`✅ Filtered to ${filteredFaculty.length} faculty members`);
        updateResultsCount();
        renderFaculty();
    }

    function updateResultsCount() {
        if (resultsCountEl) {
            if (filteredFaculty.length === allFaculty.length) {
                resultsCountEl.textContent = `Showing all ${allFaculty.length} faculty members`;
            } else {
                resultsCountEl.textContent = `Showing ${filteredFaculty.length} of ${allFaculty.length} faculty members`;
            }
        }
    }

    function renderFaculty() {
        console.log('🎨 Rendering faculty table...');
        
        // Clear existing faculty
        if (!facultyData) return;
        facultyData.innerHTML = '';
        
        if (!filteredFaculty || filteredFaculty.length === 0) {
            if (facultyList) facultyList.classList.add('hidden');
            if (noFacultyMessage) {
                noFacultyMessage.innerHTML = `
                    <div class="text-center py-10">
                        <i class="fas fa-user-tie text-indigo-300 text-5xl mb-4"></i>
                        <p class="text-xl text-gray-600">No faculty members found</p>
                        <p class="text-gray-500 mb-4">Try adjusting your search filters</p>
                        <button onclick="clearFilters()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <i class="fas fa-times mr-2"></i>Clear Filters
                        </button>
                    </div>
                `;
                noFacultyMessage.classList.remove('hidden');
            }
            // Hide loading state when no results
            hideLoadingState();
            return;
        }
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredFaculty.length);
        const pageData = filteredFaculty.slice(start, end);
        
        // Update pagination UI
        if (showingStart) showingStart.textContent = start + 1;
        if (showingEnd) showingEnd.textContent = end;
        if (totalItems) totalItems.textContent = filteredFaculty.length;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = end >= filteredFaculty.length;
        
        // Render each faculty member
        pageData.forEach(faculty => {
            const departmentName = getDepartmentName(faculty.dept_id);
            
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50 transition-colors duration-200';
            
            row.innerHTML = `
                <td class="py-4 px-6">
                    <div class="flex items-center space-x-3">
                        <div class="bg-indigo-100 rounded-full p-2">
                            <i class="fas fa-user-tie text-indigo-600"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-indigo-800">${faculty.first_name || ''} ${faculty.last_name || ''}</div>
                            <div class="text-sm text-gray-500">${faculty.email || 'N/A'}</div>
                            <div class="text-xs text-gray-400">ID: ${faculty.faculty_id}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="text-sm">
                        <span class="font-medium text-gray-800">${faculty.position || 'Not specified'}</span>
                        ${faculty.hire_date ? `<div class="text-xs text-gray-500">Hired: ${formatDate(faculty.hire_date)}</div>` : ''}
                    </div>
                </td>
                <td class="py-4 px-6">
                    <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${departmentName}
                    </span>
                </td>
                <td class="py-4 px-6">
                    <div class="max-w-xs">
                        <div class="text-sm text-gray-900 line-clamp-2">
                            ${faculty.research_interests || faculty.expertise || 'No research interests specified'}
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="flex space-x-2">
                        <button class="view-btn text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded hover:bg-indigo-50" 
                                data-id="${faculty.faculty_id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn text-green-600 hover:text-green-800 transition-colors p-2 rounded hover:bg-green-50" 
                                data-id="${faculty.faculty_id}" title="Edit Faculty">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50" 
                                data-id="${faculty.faculty_id}" title="Delete Faculty">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            facultyData.appendChild(row);
            
            // Action buttons
            const viewBtn = row.querySelector('.view-btn');
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            if (viewBtn) viewBtn.addEventListener('click', () => viewFaculty(faculty.faculty_id));
            if (editBtn) editBtn.addEventListener('click', () => showEditFacultyModal(faculty.faculty_id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => showDeleteConfirmation(faculty.faculty_id));
        });
        
        if (facultyList) facultyList.classList.remove('hidden');
        if (noFacultyMessage) noFacultyMessage.classList.add('hidden');
        
        // Update results count
        updateResultsCount();
        
        // Ensure loading state is hidden after rendering
        hideLoadingState();
        
        console.log(`✅ Rendered ${pageData.length} faculty members`);
    }

    function getDepartmentName(deptId) {
        const department = departments.find(dept => dept.dept_id === deptId);
        return department ? department.dept_name : 'Unknown Department';
    }

    function clearFilters() {
        if (facultySearchInput) facultySearchInput.value = '';
        if (departmentFilter) departmentFilter.value = '';
        currentPage = 1;
        filterFaculty();
    }

    function showAddFacultyModal() {
        console.log('➕ Showing add faculty modal...');
        
        // Reset form
        facultyForm.reset();
        facultyIdInput.value = '';
        modalTitle.textContent = 'Add Faculty Member';
        
        // Set default hire date to today
        const today = new Date().toISOString().split('T')[0];
        hireDateInput.value = today;
        
        // Show modal
        facultyModal.classList.remove('hidden');
    }

    function showEditFacultyModal(facultyId) {
        console.log('✏️ Showing edit faculty modal for ID:', facultyId);
        
        const faculty = allFaculty.find(f => f.faculty_id === facultyId);
        if (!faculty) {
            showNotification('Faculty member not found', 'error');
            return;
        }
        
        // Set form values
        facultyIdInput.value = faculty.faculty_id;
        firstNameInput.value = faculty.first_name || '';
        lastNameInput.value = faculty.last_name || '';
        emailInput.value = faculty.email || '';
        phoneInput.value = faculty.phone || '';
        positionInput.value = faculty.position || '';
        departmentSelect.value = faculty.dept_id || '';
        hireDateInput.value = faculty.hire_date || '';
        salaryInput.value = faculty.salary || '';
        researchInterestsInput.value = faculty.research_interests || faculty.expertise || '';
        
        modalTitle.textContent = 'Edit Faculty Member';
        
        // Show modal
        facultyModal.classList.remove('hidden');
    }

    function closeModal() {
        facultyModal.classList.add('hidden');
    }

    async function saveFaculty(e) {
        e.preventDefault();
        console.log('💾 Saving faculty data...');
        
        const facultyData = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim() || null,
            hire_date: hireDateInput.value,
            position: positionInput.value.trim() || null,
            dept_id: parseInt(departmentSelect.value),
            salary: salaryInput.value ? parseFloat(salaryInput.value) : null,
            research_interests: researchInterestsInput.value.trim() || null
        };
        
        const isEditing = facultyIdInput.value;
        
        try {
            let endpoint = CONFIG.ENDPOINTS.FACULTY;
            let method = 'POST';
            
            if (isEditing) {
                endpoint = `${endpoint}/${facultyIdInput.value}`;
                method = 'PUT';
            }
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(facultyData)
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification(
                `Faculty member ${isEditing ? 'updated' : 'created'} successfully`, 
                'success'
            );
            
            closeModal();
            await loadFaculty();
        } catch (error) {
            console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} faculty:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} faculty member`, 'error');
        }
    }

    function showDeleteConfirmation(facultyId) {
        console.log('🗑️ Showing delete confirmation for faculty ID:', facultyId);
        currentFacultyId = facultyId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = deleteFaculty;
    }

    async function deleteFaculty() {
        if (!currentFacultyId) return;
        
        console.log('🗑️ Deleting faculty ID:', currentFacultyId);
        
        try {
            const endpoint = `${CONFIG.ENDPOINTS.FACULTY}/${currentFacultyId}`;
            const options = {
                method: 'DELETE'
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification('Faculty member deleted successfully', 'success');
            deleteModal.classList.add('hidden');
            await loadFaculty();
        } catch (error) {
            console.error('❌ Error deleting faculty:', error);
            showNotification('Failed to delete faculty member', 'error');
        } finally {
            currentFacultyId = null;
        }
    }

    async function viewFaculty(facultyId) {
        console.log('👁️ Viewing faculty ID:', facultyId);
        
        const faculty = allFaculty.find(f => f.faculty_id === facultyId);
        if (!faculty) {
            showNotification('Faculty member not found', 'error');
            return;
        }
        
        const departmentName = getDepartmentName(faculty.dept_id);
        
        // Show faculty details
        const facultyDetails = document.getElementById('faculty-details');
        facultyDetails.innerHTML = `
            <!-- Faculty Header -->
            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 mb-4">
                <div class="flex items-center space-x-4">
                    <div class="bg-indigo-100 rounded-full p-3">
                        <i class="fas fa-user-tie text-indigo-600 text-2xl"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-indigo-800">${faculty.first_name} ${faculty.last_name}</h2>
                        <p class="text-indigo-600 font-medium">${faculty.position || 'Faculty Member'}</p>
                        <p class="text-indigo-500 text-sm">${departmentName}</p>
                    </div>
                </div>
            </div>
            
            <!-- Faculty Information Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex items-center mb-1">
                        <i class="fas fa-envelope text-blue-500 mr-2"></i>
                        <p class="text-gray-600 text-sm font-medium">Email</p>
                    </div>
                    <p class="text-gray-800 font-semibold text-sm">${faculty.email}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex items-center mb-1">
                        <i class="fas fa-phone text-green-500 mr-2"></i>
                        <p class="text-gray-600 text-sm font-medium">Phone</p>
                    </div>
                    <p class="text-gray-800 font-semibold text-sm">${faculty.phone || 'Not specified'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex items-center mb-1">
                        <i class="fas fa-calendar text-orange-500 mr-2"></i>
                        <p class="text-gray-600 text-sm font-medium">Hire Date</p>
                    </div>
                    <p class="text-gray-800 font-semibold text-sm">${formatDate(faculty.hire_date)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="flex items-center mb-1">
                        <i class="fas fa-dollar-sign text-purple-500 mr-2"></i>
                        <p class="text-gray-600 text-sm font-medium">Annual Salary</p>
                    </div>
                    <p class="text-gray-800 font-semibold text-sm">${faculty.salary ? formatCurrency(faculty.salary) : 'Not specified'}</p>
                </div>
            </div>
            
            <!-- Research Interests -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center mb-2">
                    <i class="fas fa-microscope text-indigo-500 mr-2"></i>
                    <p class="text-gray-600 text-sm font-medium">Research Interests</p>
                </div>
                <p class="text-gray-800 text-sm leading-relaxed">${faculty.research_interests || faculty.expertise || 'No research interests specified'}</p>
            </div>
        `;
        
        // Show and load projects
        const projectsSection = document.getElementById('faculty-projects');
        const projectsLoading = document.getElementById('faculty-projects-loading');
        const noProjects = document.getElementById('no-projects');
        
        projectsSection.classList.add('hidden');
        noProjects.classList.add('hidden');
        projectsLoading.classList.remove('hidden');
        
        detailModal.classList.remove('hidden');
        
        try {
            // Fetch faculty projects
            const projects = await loadFacultyProjects(faculty.faculty_id);
            
            if (projects && projects.length > 0) {
                // Render projects
                projectsSection.innerHTML = `
                    <div class="space-y-3">
                        ${projects.map(project => `
                            <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-semibold text-indigo-700 text-sm">${project.project_title || project.title}</h4>
                                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }">
                                        ${project.status || 'Unknown'}
                                    </span>
                                </div>
                                <p class="text-xs text-gray-600 mb-3 line-clamp-2">${project.description || 'No description available'}</p>
                                <div class="flex justify-between items-center text-xs">
                                    <div class="flex items-center space-x-4">
                                        <span class="text-gray-500">
                                            <i class="fas fa-calendar mr-1"></i>${formatDate(project.start_date)}
                                        </span>
                                        <span class="text-gray-500">
                                            <i class="fas fa-building mr-1"></i>${getDepartmentName(project.dept_id)}
                                        </span>
                                    </div>
                                    <span class="text-indigo-600 font-medium">
                                        <i class="fas fa-dollar-sign mr-1"></i>${project.budget ? formatCurrency(project.budget) : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                projectsLoading.classList.add('hidden');
                projectsSection.classList.remove('hidden');
            } else {
                projectsLoading.classList.add('hidden');
                noProjects.classList.remove('hidden');
            }
        } catch (error) {
            console.error('❌ Error loading faculty projects:', error);
            projectsLoading.classList.add('hidden');
            projectsSection.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load projects data</p>';
            projectsSection.classList.remove('hidden');
        }
    }

    async function loadFacultyProjects(facultyId) {
        try {
            // Try to get projects where faculty is principal investigator
            const projectsResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
            if (projectsResponse.ok) {
                const allProjects = await projectsResponse.json();
                const facultyProjects = allProjects.filter(project => 
                    project.principal_investigator_id === facultyId
                );
                console.log(`📊 Found ${facultyProjects.length} projects for faculty ${facultyId}`);
                return facultyProjects;
            }
            return [];
        } catch (error) {
            console.error('❌ Error fetching faculty projects:', error);
            return [];
        }
    }
});

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Global function for clearing filters
window.clearFilters = function() {
    const facultySearchInput = document.getElementById('faculty-search');
    const departmentFilter = document.getElementById('department-filter');
    
    if (facultySearchInput) facultySearchInput.value = '';
    if (departmentFilter) departmentFilter.value = '';
    
    // Trigger search to refresh results
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.click();
};
