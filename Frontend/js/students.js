// Students page script

document.addEventListener('DOMContentLoaded', function() {
    // Elements
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
    
    const studentSearchInput = document.getElementById('student-search');
    const departmentFilter = document.getElementById('department-filter');
    const programFilter = document.getElementById('program-filter');
    const searchBtn = document.getElementById('search-btn');
    
    // Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const showingStart = document.getElementById('showing-start');
    const showingEnd = document.getElementById('showing-end');
    const totalItems = document.getElementById('total-items');

    // Form fields
    const studentIdInput = document.getElementById('student-id');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const programTypeSelect = document.getElementById('program-type');
    const departmentSelect = document.getElementById('department');
    const advisorSelect = document.getElementById('advisor');
    const enrollmentDateInput = document.getElementById('enrollment-date');
    const graduationDateInput = document.getElementById('graduation-date');

    // State variables
    let allStudents = [];
    let filteredStudents = [];
    let departments = [];
    let faculty = [];
    let currentStudentId = null;
    let currentPage = 1;
    let itemsPerPage = CONFIG.PAGINATION.ITEMS_PER_PAGE;
    
    // Initialize page
    initPage();

    // Search and filter functionality
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        filterStudents();
    });

    // Modal events
    addStudentBtn.addEventListener('click', showAddStudentModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    studentForm.addEventListener('submit', saveStudent);
    
    // Department change event - to load faculty of that department
    departmentSelect.addEventListener('change', updateAdvisorOptions);
    
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
            renderStudents();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredStudents.length) {
            currentPage++;
            renderStudents();
        }
    });

    async function initPage() {
        try {
            // Load departments first
            departments = await fetchAPI(CONFIG.ENDPOINTS.DEPARTMENTS);
            populateDepartmentFilters();
            
            // Load faculty for advisor selection
            faculty = await fetchAPI(CONFIG.ENDPOINTS.FACULTY);
        } catch (error) {
            console.error('Error loading initial data:', error);
            showNotification('Failed to load initial data', 'error');
        }
        
        await loadStudents();
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

    function updateAdvisorOptions() {
        const selectedDeptId = parseInt(departmentSelect.value);
        
        // Clear existing options except the first one
        advisorSelect.innerHTML = '<option value="">No Advisor</option>';
        
        if (!selectedDeptId) return;
        
        // Add faculty options from the selected department
        const departmentFaculty = faculty.filter(f => f.dept_id === selectedDeptId);
        departmentFaculty.forEach(f => {
            const option = document.createElement('option');
            option.value = f.faculty_id;
            option.textContent = `${f.first_name} ${f.last_name}`;
            advisorSelect.appendChild(option);
        });
    }

    async function loadStudents() {
        // Show loading
        studentsList.classList.add('hidden');
        noStudentsMessage.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');
        
        try {
            // Fetch students
            allStudents = await fetchAPI(CONFIG.ENDPOINTS.STUDENTS);
            
            // Apply initial filtering
            filterStudents();
        } catch (error) {
            console.error('Error loading students:', error);
            showNotification('Failed to load students', 'error');
            noStudentsMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function filterStudents() {
        const searchTerm = studentSearchInput.value.trim().toLowerCase();
        const deptId = departmentFilter.value ? parseInt(departmentFilter.value) : null;
        const program = programFilter.value;
        
        filteredStudents = allStudents.filter(student => {
            const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
            const email = student.email.toLowerCase();
            
            const matchesSearch = !searchTerm || 
                fullName.includes(searchTerm) || 
                email.includes(searchTerm);
            
            const matchesDepartment = !deptId || student.dept_id === deptId;
            const matchesProgram = !program || student.program_type === program;
            
            return matchesSearch && matchesDepartment && matchesProgram;
        });
        
        renderStudents();
    }

    function renderStudents() {
        // Clear existing students
        studentsData.innerHTML = '';
        
        if (filteredStudents.length === 0) {
            studentsList.classList.add('hidden');
            noStudentsMessage.classList.remove('hidden');
            return;
        }
        
        // Calculate pagination
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, filteredStudents.length);
        const pageData = filteredStudents.slice(start, end);
        
        // Update pagination UI
        showingStart.textContent = start + 1;
        showingEnd.textContent = end;
        totalItems.textContent = filteredStudents.length;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = end >= filteredStudents.length;
        
        // Render each student
        pageData.forEach(student => {
            const departmentName = getDepartmentName(student.dept_id);
            const advisorName = getAdvisorName(student.advisor_id);
            
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="font-medium text-indigo-800">${student.first_name} ${student.last_name}</div>
                    <div class="text-sm text-gray-500">${student.email}</div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 text-xs rounded-full ${getProgramClass(student.program_type)}">
                        ${student.program_type}
                    </span>
                </td>
                <td class="py-3 px-4">
                    ${departmentName}
                </td>
                <td class="py-3 px-4">
                    ${advisorName || '<span class="text-gray-400">Not assigned</span>'}
                </td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        <button class="view-btn text-indigo-600 hover:text-indigo-800" data-id="${student.student_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="edit-btn text-gray-600 hover:text-gray-800" data-id="${student.student_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn text-red-600 hover:text-red-800" data-id="${student.student_id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            studentsData.appendChild(row);
            
            // Action buttons
            row.querySelector('.view-btn').addEventListener('click', () => viewStudent(student.student_id));
            row.querySelector('.edit-btn').addEventListener('click', () => showEditStudentModal(student.student_id));
            row.querySelector('.delete-btn').addEventListener('click', () => showDeleteConfirmation(student.student_id));
        });
        
        studentsList.classList.remove('hidden');
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
        // Reset form
        studentForm.reset();
        studentIdInput.value = '';
        modalTitle.textContent = 'Add Student';
        
        // Set default enrollment date to today
        const today = new Date().toISOString().split('T')[0];
        enrollmentDateInput.value = today;
        
        // Reset advisor options
        advisorSelect.innerHTML = '<option value="">No Advisor</option>';
        
        // Show modal
        studentModal.classList.remove('hidden');
    }

    function showEditStudentModal(studentId) {
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
        
        // Set form values
        studentIdInput.value = student.student_id;
        firstNameInput.value = student.first_name;
        lastNameInput.value = student.last_name;
        emailInput.value = student.email;
        programTypeSelect.value = student.program_type;
        departmentSelect.value = student.dept_id;
        enrollmentDateInput.value = student.enrollment_date;
        graduationDateInput.value = student.graduation_date || '';
        
        // Update advisor options based on department
        updateAdvisorOptions();
        
        // Set advisor if exists
        if (student.advisor_id) {
            advisorSelect.value = student.advisor_id;
        }
        
        modalTitle.textContent = 'Edit Student';
        
        // Show modal
        studentModal.classList.remove('hidden');
    }

    function closeModal() {
        studentModal.classList.add('hidden');
    }

    async function saveStudent(e) {
        e.preventDefault();
        
        const studentData = {
            first_name: firstNameInput.value.trim(),
            last_name: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            enrollment_date: enrollmentDateInput.value,
            program_type: programTypeSelect.value,
            dept_id: parseInt(departmentSelect.value),
            advisor_id: advisorSelect.value ? parseInt(advisorSelect.value) : null,
            graduation_date: graduationDateInput.value || null
        };
        
        const isEditing = studentIdInput.value;
        
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
            console.error(`Error ${isEditing ? 'updating' : 'creating'} student:`, error);
            showNotification(`Failed to ${isEditing ? 'update' : 'create'} student`, 'error');
        }
    }

    function showDeleteConfirmation(studentId) {
        currentStudentId = studentId;
        deleteModal.classList.remove('hidden');
        
        confirmDeleteBtn.onclick = deleteStudent;
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
            deleteModal.classList.add('hidden');
            await loadStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Failed to delete student', 'error');
        } finally {
            currentStudentId = null;
        }
    }

    async function viewStudent(studentId) {
        const student = allStudents.find(s => s.student_id === studentId);
        if (!student) return;
        
        const departmentName = getDepartmentName(student.dept_id);
        const advisorName = getAdvisorName(student.advisor_id);
        
        // Show student details
        const studentDetails = document.getElementById('student-details');
        studentDetails.innerHTML = `
            <h2 class="text-2xl font-bold text-indigo-800 mb-4">${student.first_name} ${student.last_name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <div>
                    <p class="text-gray-500 text-sm">Email</p>
                    <p class="text-gray-800 font-medium">${student.email}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Program</p>
                    <p class="text-gray-800 font-medium">
                        <span class="px-2 py-1 text-xs rounded-full ${getProgramClass(student.program_type)}">
                            ${student.program_type}
                        </span>
                    </p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Department</p>
                    <p class="text-gray-800 font-medium">${departmentName}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Advisor</p>
                    <p class="text-gray-800 font-medium">${advisorName || 'Not assigned'}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Enrollment Date</p>
                    <p class="text-gray-800 font-medium">${formatDate(student.enrollment_date)}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-sm">Graduation Date</p>
                    <p class="text-gray-800 font-medium">${student.graduation_date ? formatDate(student.graduation_date) : 'Not graduated'}</p>
                </div>
            </div>
        `;
        
        // Show and load projects
        const projectsSection = document.getElementById('student-projects');
        const projectsLoading = document.getElementById('student-projects-loading');
        const noProjects = document.getElementById('no-projects');
        
        projectsSection.classList.add('hidden');
        noProjects.classList.add('hidden');
        projectsLoading.classList.remove('hidden');
        
        detailModal.classList.remove('hidden');
        
        try {
            // Get projects for this student by checking all projects
            const projects = await fetchAPI(CONFIG.ENDPOINTS.PROJECTS);
            
            // Filter projects that have this student
            const studentProjects = projects.filter(project => 
                project.students && project.students.some(s => s.student_id === student.student_id)
            );
            
            if (studentProjects.length > 0) {
                // Render projects
                projectsSection.innerHTML = `
                    <div class="space-y-4">
                        ${studentProjects.map(project => `
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
                                </div>
                                ${project.faculty_members && project.faculty_members.length > 0 ? `
                                    <div class="mt-2">
                                        <span class="text-gray-500 text-sm">Faculty: </span>
                                        ${project.faculty_members.map(f => 
                                            `<span class="inline-block bg-indigo-100 text-indigo-800 rounded-full px-2 py-1 text-xs mr-1 mb-1">
                                                ${f.first_name} ${f.last_name}
                                            </span>`
                                        ).join('')}
                                    </div>
                                ` : ''}
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
            console.error('Error loading student projects:', error);
            projectsLoading.classList.add('hidden');
            projectsSection.innerHTML = '<p class="text-red-500">Failed to load projects data</p>';
            projectsSection.classList.remove('hidden');
        }
    }
});
