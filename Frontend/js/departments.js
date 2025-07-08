// Departments page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const departmentsList = document.getElementById('departments-list');
    const loadingIndicator = document.getElementById('loading');
    const noDepartmentsMessage = document.getElementById('no-departments');
    const addDepartmentBtn = document.getElementById('add-department-btn');
    const departmentModal = document.getElementById('department-modal');
    const modalTitle = document.getElementById('modal-title');
    const departmentForm = document.getElementById('department-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    
    const deptSearchInput = document.getElementById('dept-search');
    const filterYearSelect = document.getElementById('filter-year');
    const searchBtn = document.getElementById('search-btn');

    // Form fields
    const deptIdInput = document.getElementById('dept-id');
    const deptNameInput = document.getElementById('dept-name');
    const deptHeadInput = document.getElementById('dept-head');
    const researchFocusInput = document.getElementById('research-focus');
    const establishedYearInput = document.getElementById('established-year');
    const budgetInput = document.getElementById('budget');

    // State variables
    let currentDepartments = [];
    let currentDepartmentId = null;
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', loadDepartments);

    // Modal events
    addDepartmentBtn.addEventListener('click', showAddDepartmentModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    departmentForm.addEventListener('submit', saveDepartment);
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });
    
    closeDetailsBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });

    async function initPage() {
        await loadDepartments();
        populateYearFilter();
    }

    function populateYearFilter() {
        // Get unique years from departments
        const years = [...new Set(currentDepartments
            .map(dept => dept.established_year)
            .filter(year => year !== null && year !== undefined))]
            .sort((a, b) => a - b);
        
        // Clear existing options except the first one
        while (filterYearSelect.options.length > 1) {
            filterYearSelect.remove(1);
        }
        
        // Add year options
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            filterYearSelect.appendChild(option);
        });
    }

    async function loadDepartments() {
        // Show loading
        departmentsList.classList.add('hidden');
        noDepartmentsMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            const searchTerm = deptSearchInput.value.trim();
            if (searchTerm) {
                params.append('dept_name', searchTerm);
            }
            
            const year = filterYearSelect.value;
            if (year) {
                params.append('established_year', year);
            }
            
            // Fetch departments
            let endpoint = CONFIG.ENDPOINTS.DEPARTMENTS;
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
            
            currentDepartments = await fetchAPI(endpoint);
            renderDepartments();
        } catch (error) {
            console.error('Error loading departments:', error);
            showNotification('Failed to load departments', 'error');
            noDepartmentsMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function renderDepartments() {
        // Clear existing departments
        departmentsList.innerHTML = '';
        
        if (currentDepartments.length === 0) {
            noDepartmentsMessage.classList.remove('hidden');
            return;
        }
        
        // Render each department
        currentDepartments.forEach(dept => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md p-6 card-hover';
            
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <h2 class="text-xl font-semibold text-indigo-800">${dept.dept_name}</h2>
                    <div class="dropdown relative">
                        <button class="text-gray-500 hover:text-gray-700 focus:outline-none">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu hidden absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-10 w-32">
                            <button class="view-btn block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${dept.dept_id}">
                                <i class="fas fa-eye mr-2"></i> View
                            </button>
                            <button class="edit-btn block w-full text-left px-4 py-2 hover:bg-gray-100" data-id="${dept.dept_id}">
                                <i class="fas fa-edit mr-2"></i> Edit
                            </button>
                            <button class="delete-btn block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" data-id="${dept.dept_id}">
                                <i class="fas fa-trash mr-2"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-2">
                    ${dept.dept_head ? `<p class="text-gray-600"><span class="font-medium">Head:</span> ${dept.dept_head}</p>` : ''}
                    ${dept.established_year ? `<p class="text-gray-600"><span class="font-medium">Established:</span> ${dept.established_year}</p>` : ''}
                    ${dept.budget ? `<p class="text-gray-600"><span class="font-medium">Budget:</span> ${formatCurrency(dept.budget)}</p>` : ''}
                </div>
                <div class="mt-4">
                    <button class="view-more-btn text-indigo-600 hover:text-indigo-800 text-sm font-medium" data-id="${dept.dept_id}">
                        View Details <i class="fas fa-chevron-right ml-1"></i>
                    </button>
                </div>
            `;
            
            departmentsList.appendChild(card);
            
            // Dropdown toggle
            const dropdownBtn = card.querySelector('.dropdown button');
            const dropdownMenu = card.querySelector('.dropdown-menu');
            
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.add('hidden');
            });
            
            // Action buttons
            card.querySelector('.view-btn').addEventListener('click', () => viewDepartment(dept.dept_id));
            card.querySelector('.edit-btn').addEventListener('click', () => showEditDepartmentModal(dept.dept_id));
            card.querySelector('.delete-btn').addEventListener('click', () => showDeleteConfirmation(dept.dept_id));
            card.querySelector('.view-more-btn').addEventListener('click', () => viewDepartment(dept.dept_id));
        });
        
        departmentsList.classList.remove('hidden');
    }

    function showAddDepartmentModal() {
        // Reset form
        departmentForm.reset();
        deptIdInput.value = '';
        modalTitle.textContent = 'Add Department';
        
        // Show modal
        departmentModal.classList.remove('hidden');
    }

    function showEditDepartmentModal(deptId) {
        const department = currentDepartments.find(dept => dept.dept_id === deptId);
        if (!department) return;
        
        // Set form values
        deptIdInput.value = department.dept_id;
        deptNameInput.value = department.dept_name || '';
        deptHeadInput.value = department.dept_head || '';
        researchFocusInput.value = department.research_focus || '';
        establishedYearInput.value = department.established_year || '';
        budgetInput.value = department.budget || '';
        
        modalTitle.textContent = 'Edit Department';
        
        // Show modal
        departmentModal.classList.remove('hidden');
    }

    function closeModal() {
        departmentModal.classList.add('hidden');
    }

    async function saveDepartment(e) {
        e.preventDefault();
        
        const departmentData = {
            dept_name: deptNameInput.value.trim(),
            dept_head: deptHeadInput.value.trim() || null,
            research_focus: researchFocusInput.value.trim() || null,
            established_year: establishedYearInput.value ? parseInt(establishedYearInput.value) : null,
            budget: budgetInput.value ? parseFloat(budgetInput.value) : null
        };
        
        const isEditing = deptIdInput.value;
        
        try {
            let endpoint = CONFIG.ENDPOINTS.DEPARTMENTS;
            let method = 'POST';
            
            if (isEditing) {
                endpoint = `${endpoint}/${deptIdInput.value}`;
                method = 'PUT';
            }
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(departmentData)
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification(
                `Department ${isEditing ? 'updated' : 'created'} successfully`, 
                'success'
            );
            
            closeModal();
            await loadDepartments();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} department:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} department`, 'error');
        }
    }

    function showDeleteConfirmation(deptId) {
        currentDepartmentId = deptId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = deleteDepartment;
    }

    async function deleteDepartment() {
        if (!currentDepartmentId) return;
        
        try {
            const endpoint = `${CONFIG.ENDPOINTS.DEPARTMENTS}/${currentDepartmentId}`;
            const options = {
                method: 'DELETE'
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification('Department deleted successfully', 'success');
            deleteModal.classList.add('hidden');
            await loadDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
            showNotification('Failed to delete department', 'error');
        } finally {
            currentDepartmentId = null;
        }
    }

    async function viewDepartment(deptId) {
        const department = currentDepartments.find(dept => dept.dept_id === deptId);
        if (!department) return;
        
        // Show department details
        const departmentDetails = document.getElementById('department-details');
        departmentDetails.innerHTML = `
            <h2 class="text-2xl font-bold text-indigo-800 mb-4">${department.dept_name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                    <p class="text-gray-500 text-sm">Department Head</p>
                    <p class="text-gray-800 font-medium">${department.dept_head || 'Not specified'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Established Year</p>
                    <p class="text-gray-800 font-medium">${department.established_year || 'Not specified'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Annual Budget</p>
                    <p class="text-gray-800 font-medium">${department.budget ? formatCurrency(department.budget) : 'Not specified'}</p>
                </div>
            </div>
            <div>
                <p class="text-gray-500 text-sm">Research Focus</p>
                <p class="text-gray-800">${department.research_focus || 'No research focus specified'}</p>
            </div>
        `;
        
        // Show and populate analytics
        const analyticsSection = document.getElementById('dept-analytics');
        const analyticsLoading = document.getElementById('dept-analytics-loading');
        
        analyticsSection.classList.add('hidden');
        analyticsLoading.classList.remove('hidden');
        
        detailModal.classList.remove('hidden');
        
        try {
            const analyticsData = await fetchAPI(`${CONFIG.ENDPOINTS.ANALYTICS_DEPARTMENT}/${department.dept_id}`);
            
            // Update analytics UI
            document.getElementById('faculty-count').textContent = analyticsData.faculty_count;
            document.getElementById('student-count').textContent = analyticsData.student_count;
            document.getElementById('project-count').textContent = analyticsData.project_count;
            
            // Projects details
            const projectDetails = document.getElementById('project-details');
            projectDetails.innerHTML = analyticsData.active_projects ? 
                `<p>${analyticsData.active_projects} active projects</p>` : '';
            
            if (analyticsData.total_project_budget) {
                projectDetails.innerHTML += `<p>Total budget: ${formatCurrency(analyticsData.total_project_budget)}</p>`;
            }
            
            // Render student programs chart
            if (analyticsData.student_program_distribution) {
                renderProgramChart(analyticsData.student_program_distribution);
            }
            
            analyticsLoading.classList.add('hidden');
            analyticsSection.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading department analytics:', error);
            analyticsLoading.classList.add('hidden');
            document.getElementById('dept-analytics').innerHTML = 
                '<p class="text-red-500">Failed to load analytics data</p>';
        }
    }

    function renderProgramChart(programData) {
        const programChartEl = document.getElementById('program-chart');
        programChartEl.innerHTML = '';
        
        const programs = Object.keys(programData);
        if (programs.length === 0) {
            programChartEl.innerHTML = '<p class="text-gray-500">No student data available</p>';
            return;
        }
        
        const options = {
            series: Object.values(programData),
            labels: programs,
            chart: {
                type: 'donut',
                height: 200
            },
            colors: CONFIG.CHART_COLORS,
            legend: {
                position: 'bottom',
                fontSize: '14px'
            },
            dataLabels: {
                enabled: false
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '55%'
                    }
                }
            }
        };
        
        const chart = new ApexCharts(programChartEl, options);
        chart.render();
    }
});
