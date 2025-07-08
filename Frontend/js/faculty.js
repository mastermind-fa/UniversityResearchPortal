// Faculty page script

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
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        filterFaculty();
    });

    // Modal events
    addFacultyBtn.addEventListener('click', showAddFacultyModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    facultyForm.addEventListener('submit', saveFaculty);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderFaculty();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredFaculty.length) {
            currentPage++;
            renderFaculty();
        }
    });

    async function initPage() {
        // Load departments first
        try {
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            populateDepartmentFilters();
        } catch (error) {
            console.error('Error loading departments:', error);
            showNotification('Failed to load departments', 'error');
        }
        
        await loadFaculty();
    }

    function populateDepartmentFilters() {
        // Clear existing options except the first one
        while (departmentFilter.options.length > 1) {
            departmentFilter.remove(1);
        }
        
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        
        // Add department options
        departments.forEach(dept => {
            const option1 = document.createElement('option');
            option1.value = dept.dept_id;
            option1.textContent = dept.dept_name;
            departmentFilter.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = dept.dept_id;
            option2.textContent = dept.dept_name;
            departmentSelect.appendChild(option2);
        });
    }

    async function loadFaculty() {
        // Show loading
        facultyList.classList.add('hidden');
        noFacultyMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Fetch faculty
            allFaculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
            
            // Apply initial filtering
            filterFaculty();
        } catch (error) {
            console.error('Error loading faculty:', error);
            showNotification('Failed to load faculty members', 'error');
            noFacultyMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function filterFaculty() {
        const searchTerm = facultySearchInput.value.trim().toLowerCase();
        const deptId = departmentFilter.value ? parseInt(departmentFilter.value) : null;
        
        filteredFaculty = allFaculty.filter(faculty => {
            const fullName = `${faculty.first_name} ${faculty.last_name}`.toLowerCase();
            const researchInterests = faculty.research_interests ? faculty.research_interests.toLowerCase() : '';
            
            const matchesSearch = !searchTerm || 
                fullName.includes(searchTerm) || 
                researchInterests.includes(searchTerm);
            
            const matchesDepartment = !deptId || faculty.dept_id === deptId;
            
            return matchesSearch && matchesDepartment;
        });
        
        renderFaculty();
    }

    function renderFaculty() {
        // Clear existing faculty
        facultyData.innerHTML = '';
        
        if (filteredFaculty.length === 0) {
            facultyList.classList.add('hidden');
            noFacultyMessage.classList.remove('hidden');
            return;
        }
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredFaculty.length);
        const pageData = filteredFaculty.slice(start, end);
        
        // Update pagination UI
        showingStart.textContent = start + 1;
        showingEnd.textContent = end;
        totalItems.textContent = filteredFaculty.length;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = end >= filteredFaculty.length;
        
        // Render each faculty member
        pageData.forEach(faculty => {
            const departmentName = getDepartmentName(faculty.dept_id);
            
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="font-medium text-indigo-800">${faculty.first_name} ${faculty.last_name}</div>
                    <div class="text-sm text-gray-500">${faculty.email}</div>
                </td>
                <td class="py-3 px-4">
                    ${faculty.position || '<span class="text-gray-400">Not specified</span>'}
                </td>
                <td class="py-3 px-4">
                    ${departmentName}
                </td>
                <td class="py-3 px-4">
                    <div class="truncate max-w-xs" title="${faculty.research_interests || ''}">
                        ${faculty.research_interests || '<span class="text-gray-400">None specified</span>'}
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        <button class="view-btn text-indigo-600 hover:text-indigo-800" data-id="${faculty.faculty_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn text-gray-600 hover:text-gray-800" data-id="${faculty.faculty_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${faculty.faculty_id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            facultyData.appendChild(row);
            
            // Action buttons
            row.querySelector('.view-btn').addEventListener('click', () => viewFaculty(faculty.faculty_id));
            row.querySelector('.edit-btn').addEventListener('click', () => showEditFacultyModal(faculty.faculty_id));
            row.querySelector('.delete-btn').addEventListener('click', () => showDeleteConfirmation(faculty.faculty_id));
        });
        
        facultyList.classList.remove('hidden');
    }

    function getDepartmentName(deptId) {
        const department = departments.find(dept => dept.dept_id === deptId);
        return department ? department.dept_name : 'Unknown Department';
    }

    function showAddFacultyModal() {
        // Reset form
        facultyForm.reset();
        facultyIdInput.value = '';
        modalTitle.textContent = 'Add Faculty';
        
        // Set default hire date to today
        const today = new Date().toISOString().split('T')[0];
        hireDateInput.value = today;
        
        // Show modal
        facultyModal.classList.remove('hidden');
    }

    function showEditFacultyModal(facultyId) {
        const faculty = allFaculty.find(f => f.faculty_id === facultyId);
        if (!faculty) return;
        
        // Set form values
        facultyIdInput.value = faculty.faculty_id;
        firstNameInput.value = faculty.first_name;
        lastNameInput.value = faculty.last_name;
        emailInput.value = faculty.email;
        phoneInput.value = faculty.phone || '';
        positionInput.value = faculty.position || '';
        departmentSelect.value = faculty.dept_id;
        hireDateInput.value = faculty.hire_date;
        salaryInput.value = faculty.salary || '';
        researchInterestsInput.value = faculty.research_interests || '';
        
        modalTitle.textContent = 'Edit Faculty';
        
        // Show modal
        facultyModal.classList.remove('hidden');
    }

    function closeModal() {
        facultyModal.classList.add('hidden');
    }

    async function saveFaculty(e) {
        e.preventDefault();
        
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
            console.error(`Error ${isEditing ? 'updating' : 'creating'} faculty:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} faculty member`, 'error');
        }
    }

    function showDeleteConfirmation(facultyId) {
        currentFacultyId = facultyId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = deleteFaculty;
    }

    async function deleteFaculty() {
        if (!currentFacultyId) return;
        
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
            console.error('Error deleting faculty:', error);
            showNotification('Failed to delete faculty member', 'error');
        } finally {
            currentFacultyId = null;
        }
    }

    async function viewFaculty(facultyId) {
        const faculty = allFaculty.find(f => f.faculty_id === facultyId);
        if (!faculty) return;
        
        const departmentName = getDepartmentName(faculty.dept_id);
        
        // Show faculty details
        const facultyDetails = document.getElementById('faculty-details');
        facultyDetails.innerHTML = `
            <h2 class="text-2xl font-bold text-indigo-800 mb-4">${faculty.first_name} ${faculty.last_name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                    <p class="text-gray-500 text-sm">Email</p>
                    <p class="text-gray-800 font-medium">${faculty.email}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Phone</p>
                    <p class="text-gray-800 font-medium">${faculty.phone || 'Not specified'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Position</p>
                    <p class="text-gray-800 font-medium">${faculty.position || 'Not specified'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Department</p>
                    <p class="text-gray-800 font-medium">${departmentName}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Hire Date</p>
                    <p class="text-gray-800 font-medium">${formatDate(faculty.hire_date)}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Annual Salary</p>
                    <p class="text-gray-800 font-medium">${faculty.salary ? formatCurrency(faculty.salary) : 'Not specified'}</p>
                </div>
            </div>
            <div>
                <p class="text-gray-500 text-sm">Research Interests</p>
                <p class="text-gray-800">${faculty.research_interests || 'No research interests specified'}</p>
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
            // Fetch faculty reports to get projects
            const facultyReport = await fetchAPI(`${CONFIG.ENDPOINTS.REPORTS_FACULTY}/${faculty.faculty_id}`);
            
            if (facultyReport.projects && facultyReport.projects.length > 0) {
                // Render projects
                projectsSection.innerHTML = `
                    <div class="space-y-4">
                        ${facultyReport.projects.map(project => `
                            <div class="border rounded-lg p-4">
                                <h4 class="font-semibold text-indigo-700">${project.title}</h4>
                                <p class="text-sm text-gray-600 mb-2">${project.description || ''}</p>
                                <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span class="text-gray-500">Status:</span> 
                                        <span class="badge ${project.is_active ? 'badge-success' : 'badge-info'}">
                                            ${project.is_active ? 'Active' : 'Completed'}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Department:</span> 
                                        ${getDepartmentName(project.dept_id)}
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Dates:</span> 
                                        ${formatDate(project.start_date)} - ${project.end_date ? formatDate(project.end_date) : 'Present'}
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Budget:</span> 
                                        ${project.budget ? formatCurrency(project.budget) : 'Not specified'}
                                    </div>
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
            console.error('Error loading faculty projects:', error);
            projectsLoading.classList.add('hidden');
            projectsSection.innerHTML = '<p class="text-red-500">Failed to load projects data</p>';
            projectsSection.classList.remove('hidden');
        }
    }
});
