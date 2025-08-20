// Navigation script for the Research Portal

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle - current navbar structure
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Legacy mobile menu toggle for pages that might still use the old structure
    const menuToggle = document.getElementById('menu-toggle');
    const legacyMobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && legacyMobileMenu) {
        menuToggle.addEventListener('click', () => {
            legacyMobileMenu.classList.toggle('hidden');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuToggle?.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Add active class to current page in navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath)) {
            link.classList.add('font-bold', 'text-blue-200');
        }
    });
    
    // Handle dropdown menus
    const dropdownGroups = document.querySelectorAll('.group');
    
    dropdownGroups.forEach(group => {
        const button = group.querySelector('button');
        const dropdown = group.querySelector('.absolute');
        
        if (button && dropdown) {
            // Mobile: click to toggle
            button.addEventListener('click', (e) => {
                if (window.innerWidth < 1024) { // lg breakpoint
                    e.preventDefault();
                    dropdown.classList.toggle('opacity-0');
                    dropdown.classList.toggle('invisible');
                }
            });
        }
    });
});
