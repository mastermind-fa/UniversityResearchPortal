/**
 * Authentication System for University Research Portal
 * Handles login, registration, user state, and profile management
 */

class AuthSystem {
    constructor() {
        this.baseURL = 'http://localhost:8000';
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.isInitializing = true;
        this.readyPromise = Promise.resolve(false);
        this.cachedFirstName = localStorage.getItem('auth_first_name') || null;
        this.cachedLastName = localStorage.getItem('auth_last_name') || null;
        
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.token) {
            this.readyPromise = this.validateToken();
        } else {
            this.isInitializing = false;
            this.readyPromise = Promise.resolve(false);
        }
        
        // Update UI based on authentication state
        this.updateAuthUI();
    }

    async validateToken() {
        try {
            if (!this.token) {
                this.isInitializing = false;
                return false;
            }

            const response = await fetch(`${this.baseURL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                this.setNameCache(userData.first_name, userData.last_name);
                this.updateAuthUI();
                this.isInitializing = false;
                return true;
            } else {
                // Token is invalid, clear it
                this.logout();
                this.isInitializing = false;
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
            this.isInitializing = false;
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                this.currentUser = {
                    user_id: data.user_id,
                    email: data.email,
                    user_type: data.user_type
                };
                
                // Store token in localStorage
                localStorage.setItem('auth_token', this.token);
                
                // Fetch full profile to get first/last name and other details
                await this.fetchAndSetProfile();
                
                // Update UI
                this.updateAuthUI();
                
                // Close modal if exists
                this.closeAuthModal();
                
                // Show success message
                this.showNotification('Login successful!', 'success');
                
                return true;
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.detail || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
            return false;
        }
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.access_token;
                this.currentUser = {
                    user_id: data.user_id,
                    email: data.email,
                    user_type: data.user_type
                };
                
                // Store token in localStorage
                localStorage.setItem('auth_token', this.token);
                
                // Fetch full profile to get first/last name and other details
                await this.fetchAndSetProfile();
                
                // Update UI
                this.updateAuthUI();
                
                // Close modal if exists
                this.closeAuthModal();
                
                // Show success message
                this.showNotification('Registration successful!', 'success');
                
                return true;
            } else {
                const errorData = await response.json();
                this.showNotification(errorData.detail || 'Registration failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error. Please try again.', 'error');
            return false;
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('auth_token');
        this.clearNameCache();
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'success');
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const profileSection = document.querySelector('.profile-section');
        
        if (this.currentUser) {
            // User is logged in - show profile section
            if (authButtons) authButtons.style.display = 'none';
            if (profileSection) profileSection.style.display = 'flex';
            
            // Update profile info
            this.updateProfileInfo();
        } else {
            // User is not logged in - show auth buttons
            if (authButtons) authButtons.style.display = 'flex';
            if (profileSection) profileSection.style.display = 'none';
        }
    }

    updateProfileInfo() {
        const profileNameEls = document.querySelectorAll('.profile-name');
        const profileEmailEls = document.querySelectorAll('.profile-email');
        const profileTypeEls = document.querySelectorAll('.profile-type');

        const firstName = (this.currentUser && this.currentUser.first_name) || this.cachedFirstName || 'User';
        const lastName = (this.currentUser && this.currentUser.last_name) || this.cachedLastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        profileNameEls.forEach(function(nameEl) {
            nameEl.textContent = fullName;
        });

        if (this.currentUser) {
            profileEmailEls.forEach((emailEl) => {
                emailEl.textContent = this.currentUser.email || '';
            });

            const prettyType = this.currentUser.user_type
                ? this.currentUser.user_type.charAt(0).toUpperCase() + this.currentUser.user_type.slice(1)
                : '';
            profileTypeEls.forEach((typeEl) => {
                typeEl.textContent = prettyType;
            });
        }
    }

    async fetchAndSetProfile() {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            if (response.ok) {
                const profile = await response.json();
                this.currentUser = profile;
                this.setNameCache(profile.first_name, profile.last_name);
            }
        } catch (_) { /* no-op */ }
    }

    setNameCache(firstName, lastName) {
        if (firstName) {
            localStorage.setItem('auth_first_name', firstName);
            this.cachedFirstName = firstName;
        }
        if (lastName) {
            localStorage.setItem('auth_last_name', lastName);
            this.cachedLastName = lastName;
        }
    }

    clearNameCache() {
        localStorage.removeItem('auth_first_name');
        localStorage.removeItem('auth_last_name');
        this.cachedFirstName = null;
        this.cachedLastName = null;
        // Also clear any visible UI name
        document.querySelectorAll('.profile-name').forEach((el) => { el.textContent = 'User'; });
    }

    showAuthModal(type = 'login') {
        // Remove existing modal if any
        this.closeAuthModal();
        
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const modalContent = this.createAuthModalContent(type);
        modal.innerHTML = modalContent;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        this.setupAuthModalEvents(modal, type);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    createAuthModalContent(type) {
        if (type === 'login') {
            return `
                <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Login</h2>
                        <button class="close-modal text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <form id="login-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" name="password" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <button type="submit" 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Login
                        </button>
                    </form>
                    
                    <div class="mt-4 text-center">
                        <p class="text-gray-600">Don't have an account? 
                            <button class="switch-to-register text-blue-600 hover:text-blue-800 font-medium">Register here</button>
                        </p>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Register</h2>
                        <button class="close-modal text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <form id="register-form" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input type="text" name="first_name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input type="text" name="last_name" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" name="email" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input type="password" name="password" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                            <select name="user_type" id="user-type-select" required 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Select user type</option>
                                <option value="faculty">Faculty</option>
                                <option value="student">Student</option>
                            </select>
                        </div>
                        
                        <!-- Faculty-specific fields -->
                        <div id="faculty-fields" class="hidden space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                <select name="position" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select position</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Lecturer">Lecturer</option>
                                    <option value="Adjunct">Adjunct</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select name="dept_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select department</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Research Interests</label>
                                <textarea name="research_interests" rows="2" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                        </div>
                        
                        <!-- Student-specific fields -->
                        <div id="student-fields" class="hidden space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Program Type</label>
                                <select name="program_type" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select program</option>
                                    <option value="Masters">Masters</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select name="dept_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="">Select department</option>
                                </select>
                            </div>
                        </div>
                        
                        <button type="submit" 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Register
                        </button>
                    </form>
                    
                    <div class="mt-4 text-center">
                        <p class="text-gray-600">Already have an account? 
                            <button class="switch-to-login text-blue-600 hover:text-blue-800 font-medium">Login here</button>
                        </p>
                    </div>
                </div>
            `;
        }
    }

    setupAuthModalEvents(modal, type) {
        // Close modal events
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => this.closeAuthModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeAuthModal();
        });
        
        // Switch between login/register
        const switchBtn = modal.querySelector(type === 'login' ? '.switch-to-register' : '.switch-to-login');
        switchBtn.addEventListener('click', () => {
            this.closeAuthModal();
            this.showAuthModal(type === 'login' ? 'register' : 'login');
        });
        
        // Form submission
        const form = modal.querySelector(`#${type}-form`);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form, type);
        });
        
        // User type change for registration
        if (type === 'register') {
            const userTypeSelect = modal.querySelector('#user-type-select');
            userTypeSelect.addEventListener('change', () => {
                this.toggleUserTypeFields(userTypeSelect.value);
            });
            
            // Load departments
            this.loadDepartments();
        }
    }

    async handleFormSubmission(form, type) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        if (type === 'login') {
            await this.login(data.email, data.password);
        } else {
            // Prepare registration data
            const registrationData = {
                email: data.email,
                password: data.password,
                user_type: data.user_type,
                first_name: data.first_name,
                last_name: data.last_name
            };
            
            if (data.user_type === 'faculty') {
                registrationData.position = data.position;
                registrationData.dept_id = parseInt(data.dept_id);
                registrationData.research_interests = data.research_interests;
                registrationData.hire_date = new Date().toISOString().split('T')[0];
            } else if (data.user_type === 'student') {
                registrationData.program_type = data.program_type;
                registrationData.dept_id = parseInt(data.dept_id);
                registrationData.enrollment_date = new Date().toISOString().split('T')[0];
            }
            
            await this.register(registrationData);
        }
    }

    toggleUserTypeFields(userType) {
        const facultyFields = document.getElementById('faculty-fields');
        const studentFields = document.getElementById('student-fields');
        
        if (userType === 'faculty') {
            facultyFields.classList.remove('hidden');
            studentFields.classList.add('hidden');
        } else if (userType === 'student') {
            facultyFields.classList.add('hidden');
            studentFields.classList.remove('hidden');
        } else {
            facultyFields.classList.add('hidden');
            studentFields.classList.add('hidden');
        }
    }

    async loadDepartments() {
        try {
            const response = await fetch(`${this.baseURL}/api/departments/`);
            if (response.ok) {
                const departments = await response.json();
                const deptSelects = document.querySelectorAll('select[name="dept_id"]');
                
                deptSelects.forEach(select => {
                    select.innerHTML = '<option value="">Select department</option>';
                    departments.forEach(dept => {
                        const option = document.createElement('option');
                        option.value = dept.dept_id;
                        option.textContent = dept.dept_name;
                        select.appendChild(option);
                    });
                });
            }
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className += ` ${bgColor} text-white`;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.user_type === 'admin';
    }

    // Check if user is faculty
    isFaculty() {
        return this.currentUser && this.currentUser.user_type === 'faculty';
    }

    // Check if user is student
    isStudent() {
        return this.currentUser && this.currentUser.user_type === 'student';
    }

    // Execute callback when initialization completes
    onReady(callback) {
        this.readyPromise.then(() => callback(this.isAuthenticated()))
            .catch(() => callback(false));
    }
}

// Initialize authentication system when DOM is ready
let auth;

document.addEventListener('DOMContentLoaded', function() {
    auth = new AuthSystem();
    window.auth = auth;
    window.authReady = auth.readyPromise;
    
    // Update UI based on authentication state
    if (auth) {
        auth.updateAuthUI();
    }
});

// Export for use in other files
window.auth = auth;
