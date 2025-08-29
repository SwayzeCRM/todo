// Modern Admin Panel JavaScript Components

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            error: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            warning: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            info: '<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <div class="toast-close" onclick="this.parentElement.remove()">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Initialize toast manager globally
const toast = new ToastManager();

// Sidebar Navigation
class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.toggleBtn = document.querySelector('.sidebar-toggle');
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }

    init() {
        // Toggle sidebar collapse
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Handle navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Restore collapsed state from localStorage
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed && this.sidebar) {
            this.sidebar.classList.add('collapsed');
        }
    }

    toggle() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.toggle('collapsed');
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    handleNavClick(e) {
        // Remove active class from all items
        this.navItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        e.currentTarget.classList.add('active');
        
        // Handle navigation logic here
        const target = e.currentTarget.dataset.target;
        if (target) {
            this.loadContent(target);
        }
    }

    loadContent(target) {
        // Implement content loading based on target
        console.log(`Loading content for: ${target}`);
    }
}

// Theme Manager
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.toggleBtn = document.querySelector('.theme-toggle');
        this.init();
    }

    init() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.theme);
        
        // Setup toggle button
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
            this.updateToggleIcon();
        }
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (!this.toggleBtn) return;
        
        const icon = this.theme === 'light' 
            ? '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>'
            : '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>';
        
        this.toggleBtn.innerHTML = icon;
    }
}

// Modal Manager
class ModalManager {
    constructor() {
        this.activeModals = [];
    }

    open(options = {}) {
        const {
            title = 'Modal Title',
            content = '',
            size = 'medium',
            onConfirm = null,
            onCancel = null,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            showFooter = true
        } = options;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${showFooter ? `
                <div class="modal-footer">
                    <button class="btn btn-ghost modal-cancel">${cancelText}</button>
                    <button class="btn btn-primary modal-confirm">${confirmText}</button>
                </div>
            ` : ''}
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Setup event handlers
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');

        const closeModal = () => {
            overlay.style.animation = 'fadeIn 0.2s reverse';
            modal.style.animation = 'slideUp 0.3s reverse';
            setTimeout(() => {
                overlay.remove();
                this.activeModals = this.activeModals.filter(m => m !== overlay);
            }, 300);
            if (onCancel) onCancel();
        };

        closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (onConfirm) onConfirm();
                closeModal();
            });
        }

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', escapeHandler);

        this.activeModals.push(overlay);
        return modal;
    }

    confirm(message, onConfirm) {
        return this.open({
            title: 'Confirm Action',
            content: `<p>${message}</p>`,
            size: 'small',
            onConfirm,
            confirmText: 'Yes, Continue',
            cancelText: 'Cancel'
        });
    }

    alert(message, title = 'Alert') {
        return this.open({
            title,
            content: `<p>${message}</p>`,
            size: 'small',
            showFooter: false
        });
    }
}

// Initialize modal manager globally
const modal = new ModalManager();

// Form Validation Helper
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};
    }

    validate(rules) {
        this.errors = {};
        let isValid = true;

        Object.keys(rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!field) return;

            const fieldRules = rules[fieldName];
            const value = field.value.trim();

            // Required validation
            if (fieldRules.required && !value) {
                this.setError(fieldName, `${fieldRules.label || fieldName} is required`);
                isValid = false;
            }

            // Email validation
            if (fieldRules.email && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.setError(fieldName, 'Please enter a valid email address');
                    isValid = false;
                }
            }

            // Min length validation
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                this.setError(fieldName, `Minimum length is ${fieldRules.minLength} characters`);
                isValid = false;
            }

            // Max length validation
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                this.setError(fieldName, `Maximum length is ${fieldRules.maxLength} characters`);
                isValid = false;
            }

            // Custom validation
            if (fieldRules.custom && !fieldRules.custom(value)) {
                this.setError(fieldName, fieldRules.customMessage || 'Invalid value');
                isValid = false;
            }
        });

        return isValid;
    }

    setError(fieldName, message) {
        this.errors[fieldName] = message;
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            // Remove existing error message
            const existingError = field.parentElement.querySelector('.form-error');
            if (existingError) existingError.remove();
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = message;
            field.parentElement.appendChild(errorDiv);
        }
    }

    clearErrors() {
        Object.keys(this.errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.remove('error');
                const errorDiv = field.parentElement.querySelector('.form-error');
                if (errorDiv) errorDiv.remove();
            }
        });
        this.errors = {};
    }
}

// Enhanced Button Actions
function initializeButtons() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    new SidebarManager();
    new ThemeManager();
    
    // Initialize buttons
    initializeButtons();
    
    // Setup tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.classList.add('tooltip');
    });
});

// Export for use in other scripts
window.AdminUI = {
    toast,
    modal,
    FormValidator
};