// Students Management System - Professional & Responsive
// Enhanced with advanced search, filtering, statistics, and professional UI

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Students Management System...');
    
    // DOM Elements
    const studentsList = document.getElementById('students-list');
    const studentsData = document.getElementById('students-data');
    const loadingIndicator = document.getElementById('loading');
    const noStudentsMessage = document.getElementById('no-students');
    const addStudentBtn = document.getElementById('add-student-btn');
    const studentModal = document.getElementById('student-modal');
    const modalTitle = document.getElementById('modal-title');
    const studentForm = document.getElementById('student-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-btn');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    
    // Search and Filter Elements
    const studentSearchInput = document.getElementById('student-search');
    const departmentFilter = document.getElementById('department-filter');
    const programFilter = document.getElementById('program-filter');
    const searchBtn = document.getElementById('search-btn');
    const resultsCount = document.getElementById('results-count');
    
    // Pagination Elements
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form Fields
    const studentIdInput = document.getElementById('student-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const programTypeSelect = document.getElementById('program-type');
    const departmentSelect = document.getElementById('department');
    const advisorSelect = document.getElementById('advisor');
    const enrollmentDateInput = document.getElementById('enrollment-date');
    const graduationDateInput = document.getElementById('graduation-date');

    // Statistics Elements
    const totalStudentsCount = document.getElementById('total-students-count');
    const phdStudentsCount = document.getElementById('phd-students-count');
    const researchProjectsCount = document.getElementById('research-projects-count');
    const departmentsCount = document.getElementById('departments-count');

    // State Variables
    let allStudents = [];
    let filteredStudents = [];
    let departments = [];
    let faculty = [];
    let currentStudentId = null;
    let currentPage = 1;
    let itemsPerPage = 10; // Changed from CONFIG.PAGINATION.ITEMS_PER_PAGE
    
    // Initialize page
    initPage();

    // Event Listeners
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (studentSearchInput) studentSearchInput.addEventListener('input', handleSearch);
    if (departmentFilter) departmentFilter.addEventListener('change', handleSearch);
    if (programFilter) programFilter.addEventListener('change', handleSearch);
    
    // Modal Events
    if (addStudentBtn) addStudentBtn.addEventListener('click', showAddStudentModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (studentForm) studentForm.addEventListener('submit', saveStudent);
    
    // Department change event - to load faculty of that department
    if (departmentSelect) departmentSelect.addEventListener('change', updateAdvisorOptions);
    
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('hidden');
    });
    
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => {
        console.log('🔄 Closing student detail modal...');
        detailModal.classList.add('hidden');
    });
    
    if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => {
        console.log('🔄 Closing student detail modal...');
        detailModal.classList.add('hidden');
    });
    
    // Pagination
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderStudents();
        }
    });
    
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredStudents.length) {
            currentPage++;
            renderStudents();
        }
    });

    // Close modal when clicking outside
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) {
                console.log('🔄 Closing student detail modal (clicked outside)...');
                detailModal.classList.add('hidden');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (detailModal && !detailModal.classList.contains('hidden')) {
                console.log('🔄 Closing student detail modal (Escape key)...');
                detailModal.classList.add('hidden');
            }
            if (studentModal && !studentModal.classList.contains('hidden')) {
                console.log('🔄 Closing student form modal (Escape key)...');
                studentModal.classList.add('hidden');
            }
            if (deleteModal && !deleteModal.classList.contains('hidden')) {
                console.log('🔄 Closing delete modal (Escape key)...');
                deleteModal.classList.add('hidden');
            }
        }
    });

    // Functions
    async function initPage() {
        console.log('🚀 Initializing students page...');
        
        // Ensure loading indicator is hidden initially
        hideLoadingState();
        
        try {
            // Load departments first
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            console.log('🏢 Loaded departments:', departments);
            populateDepartmentFilters();
            
            // Load faculty for advisor selection
            faculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
            console.log('👨‍🏫 Loaded faculty:', faculty);
            
            // Load students data
            await loadStudents();
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

    function updateAdvisorOptions() {
        const selectedDeptId = parseInt(departmentSelect.value);
        
        // Clear existing options except the first one
        if (advisorSelect) {
            advisorSelect.innerHTML = '<option value="">No Advisor</option>';
        }
        
        if (!selectedDeptId) return;
        
        // Add faculty options from the selected department
        const departmentFaculty = faculty.filter(f => f.dept_id === selectedDeptId);
        departmentFaculty.forEach(f => {
            if (advisorSelect) {
                const option = document.createElement('option');
                option.value = f.faculty_id;
                option.textContent = `${f.first_name} ${f.last_name}`;
                advisorSelect.appendChild(option);
            }
        });
    }

    function showLoadingState() {
        console.log('🔄 Showing loading state...');
        if (studentsList) studentsList.classList.add('hidden');
        if (noStudentsMessage) noStudentsMessage.classList.add('hidden');
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
        if (studentsList) studentsList.classList.add('hidden');
        if (noStudentsMessage) {
            noStudentsMessage.innerHTML = `
                <div class="text-center py-10">
                    <i class="fas fa-exclamation-triangle text-red-300 text-5xl mb-4"></i>
                    <p class="text-xl text-gray-600">Failed to load students data</p>
                    <p class="text-gray-500 mb-4">Please try refreshing the page</p>
                    <button onclick="location.reload()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-redo mr-2"></i>Refresh Page
                    </button>
                </div>
            `;
            noStudentsMessage.classList.remove('hidden');
        }
    }

    async function loadStudents() {
        console.log('👥 Loading students data...');
        
        // Show loading state
        showLoadingState();
        
        try {
            // Fetch students from backend API
            const response = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.STUDENTS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            allStudents = await response.json();
            console.log('📊 Loaded students:', allStudents);
            
            // Load statistics
            await loadStatistics();
            
            // Apply initial filtering
            filterStudents();
            
            // Hide loading state after successful load
            hideLoadingState();
            
        } catch (error) {
            console.error('❌ Error loading students:', error);
            showNotification('Failed to load students', 'error');
            showErrorState();
        }
    }

    async function loadStatistics() {
        console.log('📊 Loading student statistics...');
        
        try {
            // Calculate statistics
            const totalStudents = allStudents.length;
            const phdStudents = allStudents.filter(s => s.program_type === 'PhD').length;
            const uniqueDepartments = new Set(allStudents.map(s => s.dept_id)).size;
            
            // Load research projects count
            const projectsResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
            let researchProjects = 0;
            if (projectsResponse.ok) {
                const projects = await projectsResponse.json();
                researchProjects = projects.filter(p => p.status === 'Active').length;
            }
            
            // Update statistics display
            if (totalStudentsCount) totalStudentsCount.textContent = totalStudents;
            if (phdStudentsCount) phdStudentsCount.textContent = phdStudents;
            if (researchProjectsCount) researchProjectsCount.textContent = researchProjects;
            if (departmentsCount) departmentsCount.textContent = uniqueDepartments;
            
            console.log('✅ Statistics loaded:', { totalStudents, phdStudents, researchProjects, uniqueDepartments });
            
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
        }
    }

    function handleSearch() {
        currentPage = 1;
        filterStudents();
    }

    function filterStudents() {
        const searchTerm = studentSearchInput ? studentSearchInput.value.trim().toLowerCase() : '';
        const deptId = departmentFilter && departmentFilter.value ? parseInt(departmentFilter.value) : null;
        const program = programFilter && programFilter.value ? programFilter.value : '';
        
        console.log('🔍 Filtering students with:', { searchTerm, deptId, program });
        
        filteredStudents = allStudents.filter(student => {
            const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
            const email = student.email.toLowerCase();
            const programType = student.program_type ? student.program_type.toLowerCase() : '';
            
            const matchesSearch = !searchTerm || 
                fullName.includes(searchTerm) || 
                email.includes(searchTerm) ||
                programType.includes(searchTerm);
            
            const matchesDepartment = !deptId || student.dept_id === deptId;
            const matchesProgram = !program || student.program_type === program;
            
            return matchesSearch && matchesDepartment && matchesProgram;
        });
        
        console.log(`✅ Filtered to ${filteredStudents.length} students`);
        renderStudents();
    }

    function renderStudents() {
        console.log('🎨 Rendering students table...');
        
        // Clear existing students
        if (!studentsData) return;
        studentsData.innerHTML = '';
        
        if (!filteredStudents || filteredStudents.length === 0) {
            if (studentsList) studentsList.classList.add('hidden');
            if (noStudentsMessage) {
                noStudentsMessage.innerHTML = `
                    <div class="text-center py-10">
                        <i class="fas fa-user-graduate text-indigo-300 text-5xl mb-4"></i>
                        <p class="text-xl text-gray-600">No students found</p>
                        <p class="text-gray-500 mb-4">Try adjusting your search filters</p>
                        <button onclick="clearFilters()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <i class="fas fa-times mr-2"></i>Clear Filters
                        </button>
                    </div>
                `;
                noStudentsMessage.classList.remove('hidden');
            }
            // Hide loading state when no results
            hideLoadingState();
            return;
        }
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredStudents.length);
        const pageData = filteredStudents.slice(start, end);
        
        // Update pagination UI
        if (showingStart) showingStart.textContent = start + 1;
        if (showingEnd) showingEnd.textContent = end;
        if (totalItems) totalItems.textContent = filteredStudents.length;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = end >= filteredStudents.length;
        
        // Render each student
        pageData.forEach(student => {
            const departmentName = getDepartmentName(student.dept_id);
            const advisorName = getAdvisorName(student.advisor_id);
            
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50 transition-colors duration-200';
            
            row.innerHTML = `
                <td class="py-4 px-6">
                    <div class="flex items-center space-x-3">
                        <div class="bg-indigo-100 rounded-full p-2">
                            <i class="fas fa-user-graduate text-indigo-600"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-indigo-800">${student.first_name || ''} ${student.last_name || ''}</div>
                            <div class="text-sm text-gray-500">${student.email || 'N/A'}</div>
                            <div class="text-xs text-gray-400">ID: ${student.student_id}</div>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="text-sm">
                        <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getProgramClass(student.program_type)}">
                            ${student.program_type || 'Not specified'}
                        </span>
                        ${student.enrollment_date ? `<div class="text-xs text-gray-500 mt-1">Enrolled: ${formatDate(student.enrollment_date)}</div>` : ''}
                    </div>
                </td>
                <td class="py-4 px-6">
                    <span class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${departmentName}
                    </span>
                </td>
                <td class="py-4 px-6">
                    <div class="text-sm">
                        ${advisorName ? 
                            `<span class="text-gray-800 font-medium">${advisorName}</span>` : 
                            '<span class="text-gray-400 italic">Not assigned</span>'
                        }
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="flex space-x-2">
                        <button class="view-btn text-indigo-600 hover:text-indigo-800 transition-colors p-2 rounded hover:bg-indigo-50" 
                                data-id="${student.student_id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn text-green-600 hover:text-green-800 transition-colors p-2 rounded hover:bg-green-50" 
                                data-id="${student.student_id}" title="Edit Student">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50" 
                                data-id="${student.student_id}" title="Delete Student">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            studentsData.appendChild(row);
            
            // Action buttons
            const viewBtn = row.querySelector('.view-btn');
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            if (viewBtn) viewBtn.addEventListener('click', () => viewStudent(student.student_id));
            if (editBtn) editBtn.addEventListener('click', () => showEditStudentModal(student.student_id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => showDeleteConfirmation(student.student_id));
        });
        
        if (studentsList) studentsList.classList.remove('hidden');
        if (noStudentsMessage) noStudentsMessage.classList.add('hidden');
        
        // Update results count
        updateResultsCount();
        
        // Ensure loading state is hidden after rendering
        hideLoadingState();
        
        console.log(`✅ Rendered ${pageData.length} students`);
    }

    function updateResultsCount() {
        if (resultsCount) {
            if (filteredStudents.length === allStudents.length) {
                resultsCount.textContent = 'Showing all students';
            } else {
                resultsCount.textContent = `Showing ${filteredStudents.length} of ${allStudents.length} students`;
            }
        }
    }

    function clearFilters() {
        if (studentSearchInput) studentSearchInput.value = '';
        if (departmentFilter) departmentFilter.value = '';
        if (programFilter) programFilter.value = '';
        currentPage = 1;
        filterStudents();
    }

    function getProgramClass(programType) {
        switch(programType) {
            case 'PhD':
                return 'bg-indigo-100 text-indigo-800';
            case 'Masters':
                return 'bg-green-100 text-green-800';
            case 'Undergraduate':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    function getDepartmentName(deptId) {
        const department = departments.find(dept => dept.dept_id === deptId);
        return department ? department.dept_name : 'Unknown Department';
    }

    function getAdvisorName(advisorId) {
        if (!advisorId) return null;
        const advisor = faculty.find(f => f.faculty_id === advisorId);
        return advisor ? `${advisor.first_name} ${advisor.last_name}` : 'Unknown';
    }

    function showAddStudentModal() {
        console.log('➕ Showing add student modal...');
        
        // Reset form
        if (studentForm) studentForm.reset();
        if (studentIdInput) studentIdInput.value = '';
        if (modalTitle) modalTitle.textContent = 'Add Student';
        
        // Set default enrollment date to today
        const today = new Date().toISOString().split('T')[0];
        if (enrollmentDateInput) enrollmentDateInput.value = today;
        
        // Reset advisor options
        if (advisorSelect) advisorSelect.innerHTML = '<option value="">No Advisor</option>';
        
        // Show modal
        if (studentModal) studentModal.classList.remove('hidden');
    }

    function showEditStudentModal(studentId) {
        console.log(`✏️ Showing edit student modal for ID: ${studentId}`);
        
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
        
        // Set form values
        if (studentIdInput) studentIdInput.value = student.student_id;
        if (firstNameInput) firstNameInput.value = student.first_name;
        if (lastNameInput) lastNameInput.value = student.last_name;
        if (emailInput) emailInput.value = student.email;
        if (programTypeSelect) programTypeSelect.value = student.program_type;
        if (departmentSelect) departmentSelect.value = student.dept_id;
        if (enrollmentDateInput) enrollmentDateInput.value = student.enrollment_date;
        if (graduationDateInput) graduationDateInput.value = student.graduation_date || '';
        
        // Update advisor options based on department
        updateAdvisorOptions();
        
        // Set advisor if exists
        if (student.advisor_id && advisorSelect) {
            advisorSelect.value = student.advisor_id;
        }
        
        if (modalTitle) modalTitle.textContent = 'Edit Student';
        
        // Show modal
        if (studentModal) studentModal.classList.remove('hidden');
    }

    function closeModal() {
        if (studentModal) studentModal.classList.add('hidden');
    }

    async function saveStudent(e) {
        e.preventDefault();
        
        const studentData = {
            first_name: firstNameInput ? firstNameInput.value.trim() : '',
            last_name: lastNameInput ? lastNameInput.value.trim() : '',
            email: emailInput ? emailInput.value.trim() : '',
            enrollment_date: enrollmentDateInput ? enrollmentDateInput.value : '',
            program_type: programTypeSelect ? programTypeSelect.value : '',
            dept_id: departmentSelect ? parseInt(departmentSelect.value) : null,
            advisor_id: advisorSelect && advisorSelect.value ? parseInt(advisorSelect.value) : null,
            graduation_date: graduationDateInput && graduationDateInput.value ? graduationDateInput.value : null
        };

        // Ensure program_type aligns with backend constraint
        if (!['Masters', 'PhD'].includes(studentData.program_type)) {
            showNotification('Program Type must be either "Masters" or "PhD"', 'error');
            return;
        }
        
        const isEditing = studentIdInput && studentIdInput.value;
        
        try {
            let endpoint = CONFIG.ENDPOINTS.STUDENTS;
            let method = 'POST';
            
            if (isEditing) {
                endpoint = `${endpoint}/${studentIdInput.value}`;
                method = 'PUT';
            }
            
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification(
                `Student ${isEditing ? 'updated' : 'created'} successfully`, 
                'success'
            );
            
            closeModal();
            await loadStudents();
        } catch (error) {
            console.error(`❌ Error ${isEditing ? 'updating' : 'creating'} student:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} student`, 'error');
        }
    }

    function showDeleteConfirmation(studentId) {
        console.log(`🗑️ Showing delete confirmation for student ID: ${studentId}`);
        currentStudentId = studentId;
        if (deleteModal) deleteModal.classList.remove('hidden');
        
        if (confirmDeleteBtn) confirmDeleteBtn.onclick = deleteStudent;
    }

    async function deleteStudent() {
        if (!currentStudentId) return;
        
        try {
            const endpoint = `${CONFIG.ENDPOINTS.STUDENTS}/${currentStudentId}`;
            const options = {
                method: 'DELETE'
            };
            
            await fetchAPI(endpoint, options);
            
            showNotification('Student deleted successfully', 'success');
            if (deleteModal) deleteModal.classList.add('hidden');
            await loadStudents();
        } catch (error) {
            console.error('❌ Error deleting student:', error);
            showNotification('Failed to delete student', 'error');
        } finally {
            currentStudentId = null;
        }
    }

    async function viewStudent(studentId) {
        console.log(`👁️ Viewing student details for ID: ${studentId}`);
        
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
        
        const departmentName = getDepartmentName(student.dept_id);
        const advisorName = getAdvisorName(student.advisor_id);
        
        // Show student details
        const studentDetails = document.getElementById('student-details');
        if (studentDetails) {
            studentDetails.innerHTML = `
                <!-- Student Header -->
                <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div class="flex items-center space-x-4">
                        <div class="bg-indigo-100 rounded-full p-3">
                            <i class="fas fa-user-graduate text-indigo-600 text-2xl"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-indigo-800">${student.first_name || ''} ${student.last_name || ''}</h2>
                            <p class="text-indigo-600 font-medium">${student.program_type || 'Student'}</p>
                            <p class="text-indigo-500 text-sm">${departmentName}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Student Information Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-envelope text-blue-500 mr-2"></i>
                            <p class="text-gray-600 text-sm font-medium">Email</p>
                        </div>
                        <p class="text-gray-800 font-semibold text-sm">${student.email || 'N/A'}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-graduation-cap text-green-500 mr-2"></i>
                            <p class="text-gray-600 text-sm font-medium">Program</p>
                        </div>
                        <p class="text-gray-800 font-semibold text-sm">
                            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getProgramClass(student.program_type)}">
                                ${student.program_type || 'Not specified'}
                            </span>
                        </p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-calendar text-orange-500 mr-2"></i>
                            <p class="text-gray-600 text-sm font-medium">Enrollment Date</p>
                        </div>
                        <p class="text-gray-800 font-semibold text-sm">${formatDate(student.enrollment_date)}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas fa-chalkboard-teacher text-purple-500 mr-2"></i>
                            <p class="text-gray-600 text-sm font-medium">Academic Advisor</p>
                        </div>
                        <p class="text-gray-800 font-semibold text-sm">${advisorName || 'Not assigned'}</p>
                    </div>
                </div>
                
                <!-- Additional Information -->
                ${student.graduation_date ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-award text-yellow-500 mr-2"></i>
                        <p class="text-gray-600 text-sm font-medium">Graduation Date</p>
                    </div>
                    <p class="text-gray-800 font-semibold text-sm">${formatDate(student.graduation_date)}</p>
                </div>
                ` : ''}
            `;
        }
        
        // Show and load projects
        const projectsSection = document.getElementById('student-projects');
        const projectsLoading = document.getElementById('student-projects-loading');
        const noProjects = document.getElementById('no-projects');
        
        if (projectsSection) projectsSection.classList.add('hidden');
        if (noProjects) noProjects.classList.add('hidden');
        if (projectsLoading) projectsLoading.classList.remove('hidden');
        
        if (detailModal) detailModal.classList.remove('hidden');
        
        try {
            // Get projects for this student
            const projects = await loadStudentProjects(student.student_id);
            
            if (projects && projects.length > 0) {
                // Render projects
                if (projectsSection) {
                    projectsSection.innerHTML = `
                        <div class="space-y-3">
                            ${projects.map(project => `
                                <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="font-semibold text-indigo-700 text-sm">${project.project_title || project.title || 'Untitled Project'}</h4>
                                        <div class="flex items-center space-x-2">
                                            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }">
                                                ${project.status || 'Unknown'}
                                            </span>
                                            ${project.student_role ? `
                                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                                    ${project.student_role}
                                                </span>
                                            ` : ''}
                                        </div>
                                    </div>
                                    <p class="text-xs text-gray-600 mb-3 line-clamp-2">${project.description || 'No description available'}</p>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-2">
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-calendar text-gray-400"></i>
                                            <span class="text-gray-500">Project: ${formatDate(project.start_date)} - ${project.end_date ? formatDate(project.end_date) : 'Present'}</span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-user-clock text-gray-400"></i>
                                            <span class="text-gray-500">Participation: ${formatDate(project.participation_start)}${project.participation_end ? ` - ${formatDate(project.participation_end)}` : ' - Present'}</span>
                                        </div>
                                    </div>
                                    <div class="flex justify-between items-center text-xs">
                                        <div class="flex items-center space-x-2">
                                            <i class="fas fa-building text-gray-400"></i>
                                            <span class="text-gray-500">${project.dept_id ? getDepartmentName(project.dept_id) : 'Department not specified'}</span>
                                        </div>
                                        <span class="text-indigo-600 font-medium">
                                            <i class="fas fa-dollar-sign mr-1"></i>${project.budget ? formatCurrency(project.budget) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
                
                if (projectsLoading) projectsLoading.classList.add('hidden');
                if (projectsSection) projectsSection.classList.remove('hidden');
            } else {
                if (projectsLoading) projectsLoading.classList.add('hidden');
                if (noProjects) noProjects.classList.remove('hidden');
            }
        } catch (error) {
            console.error('❌ Error loading student projects:', error);
            if (projectsLoading) projectsLoading.classList.add('hidden');
            if (projectsSection) {
                projectsSection.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load projects data</p>';
                projectsSection.classList.remove('hidden');
            }
        }
    }

    async function loadStudentProjects(studentId) {
        try {
            console.log(`🔍 Loading projects for student ID: ${studentId}`);
            
            // Use the student-research endpoint to get only projects this student is collaborating on
            const studentResearchResponse = await fetch(`${CONFIG.API_BASE_URL}/api/student-research/?student_id=${studentId}`);
            
            if (studentResearchResponse.ok) {
                const studentResearch = await studentResearchResponse.json();
                console.log(`📊 Student research data:`, studentResearch);
                
                if (studentResearch && studentResearch.length > 0) {
                    // Get additional project details (description, budget, department, status) for each collaboration
                    const projectIds = studentResearch.map(sr => sr.project_id);
                    const projectsResponse = await fetch(CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.PROJECTS);
                    
                    if (projectsResponse.ok) {
                        const allProjects = await projectsResponse.json();
                        
                        // Enrich student research data with additional project details
                        const enrichedProjects = studentResearch.map(research => {
                            const projectDetails = allProjects.find(project => project.project_id === research.project_id);
                            
                            if (projectDetails) {
                                return {
                                    // Student research info (already available)
                                    student_role: research.role,
                                    participation_start: research.start_date,
                                    participation_end: research.end_date,
                                    
                                    // Project info from student research API
                                    project_id: research.project_id,
                                    project_title: research.project_title,
                                    
                                    // Additional project details from projects API
                                    description: projectDetails.description || 'No description available',
                                    budget: projectDetails.budget,
                                    dept_id: projectDetails.dept_id,
                                    status: projectDetails.status || 'Active',
                                    start_date: projectDetails.start_date,
                                    end_date: projectDetails.end_date
                                };
                            } else {
                                // Fallback if project details not found
                                return {
                                    student_role: research.role,
                                    participation_start: research.start_date,
                                    participation_end: research.end_date,
                                    project_id: research.project_id,
                                    project_title: research.project_title,
                                    description: 'Project details not available',
                                    budget: null,
                                    dept_id: null,
                                    status: 'Unknown',
                                    start_date: research.start_date,
                                    end_date: null
                                };
                            }
                        });
                        
                        console.log(`✅ Found ${enrichedProjects.length} collaboration projects for student ${studentId}`);
                        console.log(`📋 Enriched projects:`, enrichedProjects);
                        return enrichedProjects;
                    } else {
                        // If projects API fails, return student research data with fallbacks
                        console.log(`⚠️ Projects API failed, using student research data only`);
                        return studentResearch.map(research => ({
                            student_role: research.role,
                            participation_start: research.start_date,
                            participation_end: research.end_date,
                            project_id: research.project_id,
                            project_title: research.project_title,
                            description: 'Project details not available',
                            budget: null,
                            dept_id: null,
                            status: 'Active',
                            start_date: research.start_date,
                            end_date: null
                        }));
                    }
                } else {
                    console.log(`ℹ️ No research collaborations found for student ${studentId}`);
                    return [];
                }
            }
            
            return [];
        } catch (error) {
            console.error('❌ Error fetching student projects:', error);
            return [];
        }
    }

    // Utility functions
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

    console.log('✅ Students Management System initialized successfully!');
});
