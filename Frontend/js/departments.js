// Departments page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const departmentsList = document.getElementById('departments-table-body');
    const totalDepartmentsEl = document.getElementById('total-departments');
    const totalFacultyEl = document.getElementById('total-faculty');
    const avgBudgetEl = document.getElementById('avg-budget');
    const oldestYearEl = document.getElementById('oldest-year');
    const addDepartmentBtn = document.getElementById('add-department-btn');
    const departmentModal = document.getElementById('department-modal');
    const modalTitle = document.getElementById('modal-title');
    const departmentForm = document.getElementById('department-form');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const resultsCountEl = document.getElementById('results-count');
    
    // State variables
    let currentDepartments = [];
    let filteredDepartments = [];
    
    // Initialize page
    initPage();

    // Event listeners
    if (addDepartmentBtn) addDepartmentBtn.addEventListener('click', showAddDepartmentModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (departmentForm) departmentForm.addEventListener('submit', saveDepartment);
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (sortSelect) sortSelect.addEventListener('change', handleSort);

    function initPage() {
        loadDepartments();
    }

    async function loadDepartments() {
        try {
            console.log('🔄 Loading departments...');
            
            // Show loading state
            showLoadingState();
            
            // Fetch departments from backend API
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.DEPARTMENTS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            currentDepartments = await response.json();
            console.log('📊 Loaded departments:', currentDepartments);
            
            filteredDepartments = [...currentDepartments];
            renderDepartments();
            loadStatistics();
        } catch (error) {
            console.error('❌ Error loading departments:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to load departments', 'error');
            }
            // Show error state
            if (departmentsList) {
                departmentsList.innerHTML = `
                    <tr>
                        <td colspan="6" class="px-6 py-8 text-center text-red-500">
                            <div class="flex flex-col items-center space-y-2">
                                <i class="fas fa-exclamation-triangle text-4xl text-red-300"></i>
                                <p class="text-lg font-medium">Error loading departments</p>
                                <p class="text-sm text-red-400">Please try refreshing the page</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }

    function renderDepartments() {
        // Clear existing departments
        if (!departmentsList) return;
        departmentsList.innerHTML = '';
        
        if (!filteredDepartments || filteredDepartments.length === 0) {
            departmentsList.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500 empty-state">
                        <div class="flex flex-col items-center space-y-2">
                            <i class="fas fa-building text-4xl text-gray-300"></i>
                            <p class="text-lg font-medium">No departments found</p>
                            <p class="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render each department
        filteredDepartments.forEach(dept => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-200';
            
            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-blue-100 rounded-full p-2">
                            <i class="fas fa-building text-blue-600"></i>
                        </div>
                        <div>
                            <div class="text-sm font-semibold text-gray-900">${dept.dept_name || 'N/A'}</div>
                            <div class="text-xs text-gray-500">ID: ${dept.dept_id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                        ${dept.dept_head || 'Not assigned'}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="max-w-xs">
                        <div class="text-sm text-gray-900 line-clamp-2">
                            ${dept.research_focus || 'N/A'}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${dept.budget ? formatCurrency(dept.budget) : 'N/A'}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ${dept.established_year || 'N/A'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded action-btn" 
                                onclick="viewDepartment(${dept.dept_id})" 
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-green-600 hover:text-green-900 transition-colors p-1 rounded action-btn" 
                                onclick="editDepartment(${dept.dept_id})" 
                                title="Edit Department">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900 transition-colors p-1 rounded action-btn" 
                                onclick="deleteDepartment(${dept.dept_id})" 
                                title="Delete Department">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            departmentsList.appendChild(row);
        });
        
        // Update results count after rendering
        updateResultsCount();
    }

    function showLoadingState() {
        if (!departmentsList) return;
        departmentsList.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center space-y-3">
                        <div class="loading-spinner">
                            <i class="fas fa-circle-notch text-2xl text-blue-600"></i>
                        </div>
                        <p class="text-lg font-medium">Loading departments...</p>
                        <p class="text-sm text-gray-400">Please wait while we fetch the data</p>
                    </div>
                </td>
            </tr>
        `;
    }

    async function loadStatistics() {
        try {
            console.log('📊 Loading department statistics...');
            
            // Update departments count
            if (totalDepartmentsEl) {
                totalDepartmentsEl.textContent = currentDepartments.length;
            }
            
            // Calculate average budget
            if (avgBudgetEl && currentDepartments.length > 0) {
                const totalBudget = currentDepartments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
                const avgBudget = totalBudget / currentDepartments.length;
                avgBudgetEl.textContent = formatCurrency(avgBudget);
                console.log('💰 Average budget calculated:', avgBudget);
            }
            
            // Find oldest department
            if (oldestYearEl && currentDepartments.length > 0) {
                const oldestDept = currentDepartments.reduce((oldest, current) => {
                    if (!oldest.established_year) return current;
                    if (!current.established_year) return oldest;
                    return current.established_year < oldest.established_year ? current : oldest;
                });
                
                if (oldestDept.established_year) {
                    oldestYearEl.textContent = oldestDept.established_year;
                    console.log('🏛️ Oldest department:', oldestDept.dept_name, 'established in', oldestDept.established_year);
                } else {
                    oldestYearEl.textContent = 'N/A';
                }
            }
            
            // Load faculty count
            const facultyResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY);
            if (facultyResponse.ok) {
                const faculty = await facultyResponse.json();
                if (totalFacultyEl) {
                    totalFacultyEl.textContent = faculty.length;
                    console.log('👥 Total faculty count:', faculty.length);
                }
            }
            
            console.log('✅ Statistics loaded successfully');
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
        }
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            filteredDepartments = [...currentDepartments];
        } else {
            filteredDepartments = currentDepartments.filter(dept => 
                dept.dept_name?.toLowerCase().includes(searchTerm) ||
                dept.dept_head?.toLowerCase().includes(searchTerm) ||
                dept.research_focus?.toLowerCase().includes(searchTerm) ||
                dept.established_year?.toString().includes(searchTerm)
            );
        }
        
        updateResultsCount();
        renderDepartments();
    }

    function handleSort() {
        const sortBy = sortSelect.value;
        
        filteredDepartments.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.dept_name || '').localeCompare(b.dept_name || '');
                case 'established':
                    return (a.established_year || 0) - (b.established_year || 0);
                case 'budget':
                    return (b.budget || 0) - (a.budget || 0);
                case 'faculty_count':
                    // For now, sort by ID as a proxy for faculty count
                    return a.dept_id - b.dept_id;
                default:
                    return 0;
            }
        });
        
        renderDepartments();
    }

    function updateResultsCount() {
        if (resultsCountEl) {
            if (filteredDepartments.length === currentDepartments.length) {
                resultsCountEl.textContent = `Showing all ${currentDepartments.length} departments`;
            } else {
                resultsCountEl.textContent = `Showing ${filteredDepartments.length} of ${currentDepartments.length} departments`;
            }
        }
    }

    function showAddDepartmentModal() {
        if (modalTitle) modalTitle.textContent = 'Add Department';
        if (departmentForm) departmentForm.reset();
        if (departmentModal) departmentModal.classList.remove('hidden');
    }

    function closeModal() {
        if (departmentModal) departmentModal.classList.add('hidden');
    }

    function saveDepartment(e) {
        e.preventDefault();
        // TODO: Implement save functionality
        console.log('Save department functionality to be implemented');
        closeModal();
    }

    // Global functions for button clicks
    window.viewDepartment = function(deptId) {
        console.log('👁️ View department:', deptId);
        const dept = currentDepartments.find(d => d.dept_id === deptId);
        if (dept) {
            const details = `
Department: ${dept.dept_name}
Head: ${dept.dept_head || 'Not assigned'}
Research Focus: ${dept.research_focus || 'N/A'}
Established: ${dept.established_year || 'N/A'}
Budget: ${dept.budget ? formatCurrency(dept.budget) : 'N/A'}
            `;
            alert(details);
        }
    };

    window.editDepartment = function(deptId) {
        console.log('✏️ Edit department:', deptId);
        // TODO: Implement edit functionality
        alert('Edit functionality to be implemented');
    };

    window.deleteDepartment = function(deptId) {
        console.log('🗑️ Delete department:', deptId);
        // TODO: Implement delete functionality
        if (confirm('Are you sure you want to delete this department?')) {
            alert('Delete functionality to be implemented');
        }
    };
});

// Utility function for currency formatting
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
