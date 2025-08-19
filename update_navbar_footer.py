#!/usr/bin/env python3

import os
import re

# Define the new navbar and footer content
NEW_NAVBAR = '''    <!-- Navigation Header -->
    <nav class="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-2xl sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <!-- Logo and Brand -->
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <a href="../index.html" class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-university text-white text-xl"></i>
                            </div>
                            <div class="hidden sm:block">
                                <h1 class="text-xl font-bold text-white">Research Portal</h1>
                                <p class="text-blue-200 text-sm">University Excellence</p>
                            </div>
                        </a>
                    </div>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden lg:flex items-center space-x-1">
                    <a href="../index.html" class="text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <i class="fas fa-home"></i>
                        <span>Dashboard</span>
                    </a>
                    
                    <!-- Academic Dropdown -->
                    <div class="relative group">
                        <button class="text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Academic</span>
                            <i class="fas fa-chevron-down text-xs"></i>
                        </button>
                        <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                <a href="departments.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                                    <i class="fas fa-building mr-3 text-blue-600"></i>Departments
                                </a>
                                <a href="faculty.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                                    <i class="fas fa-chalkboard-teacher mr-3 text-blue-600"></i>Faculty
                                </a>
                                <a href="students.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors">
                                    <i class="fas fa-user-graduate mr-3 text-blue-600"></i>Students
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Research Dropdown -->
                    <div class="relative group">
                        <button class="text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                            <i class="fas fa-flask"></i>
                            <span>Research</span>
                            <i class="fas fa-chevron-down text-xs"></i>
                        </button>
                        <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-2">
                                <a href="projects.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ACTIVE_PLACEHOLDER">
                                    <i class="fas fa-project-diagram mr-3 text-blue-600"></i>Projects
                                </a>
                                <a href="publications.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ACTIVE_PLACEHOLDER">
                                    <i class="fas fa-book mr-3 text-blue-600"></i>Publications
                                </a>
                                <a href="funding.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ACTIVE_PLACEHOLDER">
                                    <i class="fas fa-dollar-sign mr-3 text-blue-600"></i>Funding
                                </a>
                                <a href="collaborators.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ACTIVE_PLACEHOLDER">
                                    <i class="fas fa-handshake mr-3 text-blue-600"></i>Collaborators
                                </a>
                                <a href="student-research.html" class="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-800 transition-colors ACTIVE_PLACEHOLDER">
                                    <i class="fas fa-user-graduate mr-3 text-blue-600"></i>Student Research
                                </a>
                            </div>
                        </div>
                    </div>

                    <a href="reports.html" class="text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2">
                        <i class="fas fa-chart-bar"></i>
                        <span>Reports</span>
                    </a>
                </div>

                <!-- Auth Buttons & Mobile Menu -->
                <div class="flex items-center space-x-4">
                    <!-- Auth Buttons -->
                    <div class="hidden md:flex items-center space-x-3">
                        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                            Login
                        </button>
                        <button class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                            Register
                        </button>
                    </div>

                    <!-- Mobile menu button -->
                    <div class="lg:hidden">
                        <button type="button" class="mobile-menu-button text-blue-100 hover:text-white hover:bg-blue-800 p-2 rounded-lg transition-colors">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div class="mobile-menu hidden lg:hidden bg-blue-900/95 backdrop-blur-sm">
            <div class="px-4 pt-2 pb-6 space-y-2">
                <a href="../index.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors">
                    <i class="fas fa-home mr-3"></i>Dashboard
                </a>
                
                <!-- Mobile Academic Section -->
                <div class="border-t border-blue-700 pt-2 mt-2">
                    <p class="text-blue-300 text-sm font-medium px-4 py-2">Academic</p>
                    <a href="departments.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4">
                        <i class="fas fa-building mr-3"></i>Departments
                    </a>
                    <a href="faculty.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4">
                        <i class="fas fa-chalkboard-teacher mr-3"></i>Faculty
                    </a>
                    <a href="students.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4">
                        <i class="fas fa-user-graduate mr-3"></i>Students
                    </a>
                </div>

                <!-- Mobile Research Section -->
                <div class="border-t border-blue-700 pt-2 mt-2">
                    <p class="text-blue-300 text-sm font-medium px-4 py-2">Research</p>
                    <a href="projects.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4 MOBILE_ACTIVE_PLACEHOLDER">
                        <i class="fas fa-project-diagram mr-3"></i>Projects
                    </a>
                    <a href="publications.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4 MOBILE_ACTIVE_PLACEHOLDER">
                        <i class="fas fa-book mr-3"></i>Publications
                    </a>
                    <a href="funding.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4 MOBILE_ACTIVE_PLACEHOLDER">
                        <i class="fas fa-dollar-sign mr-3"></i>Funding
                    </a>
                    <a href="collaborators.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4 MOBILE_ACTIVE_PLACEHOLDER">
                        <i class="fas fa-handshake mr-3"></i>Collaborators
                    </a>
                    <a href="student-research.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors ml-4 MOBILE_ACTIVE_PLACEHOLDER">
                        <i class="fas fa-user-graduate mr-3"></i>Student Research
                    </a>
                </div>

                <a href="reports.html" class="block text-blue-100 hover:text-white hover:bg-blue-800 px-4 py-3 rounded-lg transition-colors border-t border-blue-700 mt-2 pt-4">
                    <i class="fas fa-chart-bar mr-3"></i>Reports
                </a>

                <!-- Mobile Auth Buttons -->
                <div class="border-t border-blue-700 pt-4 mt-4 space-y-3">
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                        Login
                    </button>
                    <button class="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                        Register
                    </button>
                </div>
            </div>
        </div>
    </nav>'''

NEW_FOOTER = '''    <!-- Footer -->
    <footer class="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- University Info -->
                <div class="space-y-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <i class="fas fa-university text-white"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-white">Research Portal</h3>
                            <p class="text-gray-300 text-sm">University Excellence</p>
                        </div>
                    </div>
                    <p class="text-gray-300 text-sm leading-relaxed">
                        Advancing knowledge through innovative research, fostering academic excellence, and building tomorrow's leaders in science and technology.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="#" class="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors">
                            <i class="fab fa-youtube"></i>
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-white border-b border-gray-700 pb-2">Quick Links</h4>
                    <ul class="space-y-3">
                        <li><a href="../index.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-home w-4"></i><span>Dashboard</span>
                        </a></li>
                        <li><a href="departments.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-building w-4"></i><span>Departments</span>
                        </a></li>
                        <li><a href="faculty.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-chalkboard-teacher w-4"></i><span>Faculty</span>
                        </a></li>
                        <li><a href="students.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-user-graduate w-4"></i><span>Students</span>
                        </a></li>
                        <li><a href="reports.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-chart-bar w-4"></i><span>Reports</span>
                        </a></li>
                    </ul>
                </div>

                <!-- Research Areas -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-white border-b border-gray-700 pb-2">Research Areas</h4>
                    <ul class="space-y-3">
                        <li><a href="projects.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-project-diagram w-4"></i><span>Research Projects</span>
                        </a></li>
                        <li><a href="publications.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-book w-4"></i><span>Publications</span>
                        </a></li>
                        <li><a href="funding.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-dollar-sign w-4"></i><span>Funding</span>
                        </a></li>
                        <li><a href="collaborators.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-handshake w-4"></i><span>Collaborations</span>
                        </a></li>
                        <li><a href="student-research.html" class="text-gray-300 hover:text-white transition-colors flex items-center space-x-2">
                            <i class="fas fa-graduation-cap w-4"></i><span>Student Research</span>
                        </a></li>
                    </ul>
                </div>

                <!-- Contact Info -->
                <div class="space-y-4">
                    <h4 class="text-lg font-semibold text-white border-b border-gray-700 pb-2">Contact Us</h4>
                    <div class="space-y-3">
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-map-marker-alt text-blue-400 mt-1"></i>
                            <div>
                                <p class="text-gray-300 text-sm">University Campus</p>
                                <p class="text-gray-300 text-sm">Research Building, Room 301</p>
                                <p class="text-gray-300 text-sm">City, State 12345</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-phone text-blue-400"></i>
                            <p class="text-gray-300 text-sm">+1 (555) 123-4567</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-envelope text-blue-400"></i>
                            <p class="text-gray-300 text-sm">research@university.edu</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-clock text-blue-400"></i>
                            <div>
                                <p class="text-gray-300 text-sm">Mon-Fri: 8:00 AM - 6:00 PM</p>
                                <p class="text-gray-300 text-sm">Sat: 9:00 AM - 2:00 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="md:flex md:items-center md:justify-between">
                    <div class="text-center md:text-left">
                        <p class="text-gray-400 text-sm">
                            © 2024 University Research Portal. All rights reserved.
                        </p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <div class="flex justify-center md:justify-end space-x-6">
                            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Accessibility</a>
                            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->'''

# Define the files to update and their active page markers
files_to_update = {
    'funding.html': {'file': 'funding.html', 'active_class': 'bg-blue-50 text-blue-800'},
    'collaborators.html': {'file': 'collaborators.html', 'active_class': 'bg-blue-50 text-blue-800'},
    'student-research.html': {'file': 'student-research.html', 'active_class': 'bg-blue-50 text-blue-800'},
    'reports.html': {'file': 'reports.html', 'active_class': 'bg-blue-50 text-blue-800'}
}

def update_file(filepath, filename):
    """Update a single HTML file with new navbar and footer"""
    print(f"Updating {filename}...")
    
    # Read the file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update navbar - replace the old navbar pattern
    navbar_pattern = r'(<!-- Navigation Bar -->.*?</nav>)'
    new_navbar = NEW_NAVBAR
    
    # Set active states based on filename
    if filename == 'funding.html':
        new_navbar = new_navbar.replace('ACTIVE_PLACEHOLDER', 'bg-blue-50 text-blue-800')
        new_navbar = new_navbar.replace('MOBILE_ACTIVE_PLACEHOLDER', 'text-white bg-blue-800')
    elif filename == 'collaborators.html':
        new_navbar = new_navbar.replace('ACTIVE_PLACEHOLDER', 'bg-blue-50 text-blue-800')
        new_navbar = new_navbar.replace('MOBILE_ACTIVE_PLACEHOLDER', 'text-white bg-blue-800')
    elif filename == 'student-research.html':
        new_navbar = new_navbar.replace('ACTIVE_PLACEHOLDER', 'bg-blue-50 text-blue-800')
        new_navbar = new_navbar.replace('MOBILE_ACTIVE_PLACEHOLDER', 'text-white bg-blue-800')
    elif filename == 'reports.html':
        new_navbar = new_navbar.replace('ACTIVE_PLACEHOLDER', '')
        new_navbar = new_navbar.replace('MOBILE_ACTIVE_PLACEHOLDER', '')
    else:
        new_navbar = new_navbar.replace('ACTIVE_PLACEHOLDER', '')
        new_navbar = new_navbar.replace('MOBILE_ACTIVE_PLACEHOLDER', '')
    
    content = re.sub(navbar_pattern, new_navbar, content, flags=re.DOTALL)
    
    # Update footer - replace scripts section and add footer
    scripts_pattern = r'(\s*<!-- Scripts -->.*?</body>\s*</html>)'
    footer_and_scripts = NEW_FOOTER + '''
    <script src="../js/config.js"></script>
    <script src="../js/utils.js"></script>
    <script src="../js/navigation.js"></script>
    <script src="../js/''' + filename.replace('.html', '.js') + '''"></script>
</body>
</html>'''
    
    content = re.sub(scripts_pattern, footer_and_scripts, content, flags=re.DOTALL)
    
    # Write back the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {filename}")

def main():
    frontend_pages_dir = 'Frontend/pages'
    
    for filename in files_to_update.keys():
        filepath = os.path.join(frontend_pages_dir, filename)
        if os.path.exists(filepath):
            update_file(filepath, filename)
        else:
            print(f"❌ File not found: {filepath}")

if __name__ == "__main__":
    main()
