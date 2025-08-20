// Departments page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const departmentsList = document.getElementById('departments-table-body');
    const totalDepartmentsEl = document.getElementById('total-departments');
    const totalFacultyEl = document.getElementById('total-faculty');
    const addDepartmentBtn = document.getElementById('add-department-btn');
    const departmentModal = document.getElementById('department-modal');
    const modalTitle = document.getElementById('modal-title');
    const departmentForm = document.getElementById('department-form');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // State variables
    let currentDepartments = [];
    
    // Initialize page
    initPage();

    // Event listeners
    if (addDepartmentBtn) addDepartmentBtn.addEventListener('click', showAddDepartmentModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (departmentForm) departmentForm.addEventListener('submit', saveDepartment);

    function initPage() {
        loadDepartments();
    }

    async function loadDepartments() {
        try {
            // Fetch departments from backend API
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.DEPARTMENTS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            currentDepartments = await response.json();
            console.log('Loaded departments:', currentDepartments);
            renderDepartments();
            loadStatistics();
        } catch (error) {
            console.error('Error loading departments:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to load departments', 'error');
            }
        }
    }

    function renderDepartments() {
        // Clear existing departments
        if (!departmentsList) return;
        departmentsList.innerHTML = '';
        
        if (!currentDepartments || currentDepartments.length === 0) {
            departmentsList.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No departments found
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render each department
        currentDepartments.forEach(dept => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${dept.dept_name || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.head_faculty_name || 'Not assigned'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.building || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${dept.budget ? '$' + dept.budget.toLocaleString() : 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        ID: ${dept.dept_id}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-900" onclick="viewDepartment(${dept.dept_id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-green-600 hover:text-green-900" onclick="editDepartment(${dept.dept_id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900" onclick="deleteDepartment(${dept.dept_id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            departmentsList.appendChild(row);
        });
    }

    async function loadStatistics() {
        try {
            // Update departments count
            if (totalDepartmentsEl) {
                totalDepartmentsEl.textContent = currentDepartments.length;
            }
            
            // Load faculty count
            const facultyResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.FACULTY);
            if (facultyResponse.ok) {
                const faculty = await facultyResponse.json();
                if (totalFacultyEl) {
                    totalFacultyEl.textContent = faculty.length;
                }
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
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
        console.log('View department:', deptId);
        const dept = currentDepartments.find(d => d.dept_id === deptId);
        if (dept) {
            alert(`Department: ${dept.dept_name}\nHead: ${dept.head_faculty_name || 'Not assigned'}\nBuilding: ${dept.building || 'N/A'}\nBudget: ${dept.budget ? '$' + dept.budget.toLocaleString() : 'N/A'}`);
        }
    };

    window.editDepartment = function(deptId) {
        console.log('Edit department:', deptId);
        // TODO: Implement edit functionality
        alert('Edit functionality to be implemented');
    };

    window.deleteDepartment = function(deptId) {
        console.log('Delete department:', deptId);
        // TODO: Implement delete functionality
        if (confirm('Are you sure you want to delete this department?')) {
            alert('Delete functionality to be implemented');
        }
    };
});
