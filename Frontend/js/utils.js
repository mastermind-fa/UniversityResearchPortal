// Utility functions for the CSEDU Portal

/**
 * Fetch data from API
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise with response data
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        showNotification('Error fetching data. Please try again.', 'error');
        throw error;
    }
}

/**
 * Format date to a readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg notification z-50`;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    // Add message and icon
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle mr-2"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle mr-2"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle mr-2"></i>';
    }
    
    notification.innerHTML = `${icon}${message}`;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 4000);
}

/**
 * Create a pagination component
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total pages
 * @param {Function} onPageChange - Callback when page changes
 * @returns {HTMLElement} - Pagination element
 */
function createPagination(currentPage, totalPages, onPageChange) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'flex justify-center mt-6 space-x-2';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    if (currentPage !== 1) {
        prevButton.addEventListener('click', () => onPageChange(currentPage - 1));
    }
    paginationContainer.appendChild(prevButton);
    
    // Page buttons
    const maxButtons = 5; // Maximum number of page buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // First page button if not visible
    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.className = 'px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        firstButton.textContent = '1';
        firstButton.addEventListener('click', () => onPageChange(1));
        paginationContainer.appendChild(firstButton);
        
        // Ellipsis if necessary
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
        pageButton.textContent = i.toString();
        pageButton.addEventListener('click', () => {
            if (i !== currentPage) onPageChange(i);
        });
        paginationContainer.appendChild(pageButton);
    }
    
    // Last page button if not visible
    if (endPage < totalPages) {
        // Ellipsis if necessary
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastButton = document.createElement('button');
        lastButton.className = 'px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        lastButton.textContent = totalPages.toString();
        lastButton.addEventListener('click', () => onPageChange(totalPages));
        paginationContainer.appendChild(lastButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    if (currentPage !== totalPages) {
        nextButton.addEventListener('click', () => onPageChange(currentPage + 1));
    }
    paginationContainer.appendChild(nextButton);
    
    return paginationContainer;
}

/**
 * Create a modal
 * @param {string} title - Modal title
 * @param {HTMLElement|string} content - Modal content
 * @param {Function} onConfirm - Callback for confirm button
 * @param {Function} onCancel - Callback for cancel button
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 */
function createModal(title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel') {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal opacity-0';
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'bg-white rounded-lg shadow-xl w-full max-w-md mx-4 modal-content transform translate-y-8';
    
    // Create modal header
    const header = document.createElement('div');
    header.className = 'px-6 py-4 border-b';
    header.innerHTML = `<h3 class="text-lg font-semibold text-indigo-800">${title}</h3>`;
    
    // Create modal body
    const body = document.createElement('div');
    body.className = 'px-6 py-4';
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    
    // Create modal footer
    const footer = document.createElement('div');
    footer.className = 'px-6 py-4 border-t flex justify-end space-x-3';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300';
    cancelButton.textContent = cancelText;
    cancelButton.addEventListener('click', () => {
        closeModal();
        if (onCancel) onCancel();
    });
    
    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700';
    confirmButton.textContent = confirmText;
    confirmButton.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    // Add buttons to footer
    footer.appendChild(cancelButton);
    footer.appendChild(confirmButton);
    
    // Add all parts to modal
    modalContainer.appendChild(header);
    modalContainer.appendChild(body);
    modalContainer.appendChild(footer);
    overlay.appendChild(modalContainer);
    
    // Add modal to body
    document.body.appendChild(overlay);
    
    // Show modal with animation
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // Close modal function
    function closeModal() {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
            if (onCancel) onCancel();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
            if (onCancel) onCancel();
        }
    });
    
    // Return the close function
    return closeModal;
}

/**
 * Validate form data
 * @param {HTMLFormElement} form - Form element
 * @returns {boolean} - Whether form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Remove any existing error messages
    const existingErrors = form.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Check each required field
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        // Remove error styling
        field.classList.remove('border-red-500');
        
        if (!field.value.trim()) {
            isValid = false;
            
            // Add error styling
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
            errorMessage.textContent = CONFIG.VALIDATION.REQUIRED;
            field.parentNode.appendChild(errorMessage);
        }
    });
    
    // Check email fields
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value.trim() && !validateEmail(field.value)) {
            isValid = false;
            
            // Add error styling
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-500 text-xs mt-1 error-message';
            errorMessage.textContent = CONFIG.VALIDATION.EMAIL_FORMAT;
            field.parentNode.appendChild(errorMessage);
        }
    });
    
    return isValid;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}
