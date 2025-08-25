/**
 * Modal Component
 * Reusable modal for dialogs and forms
 */

export class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Date.now()}`;
        this.title = options.title || 'Modal';
        this.content = options.content || '';
        this.size = options.size || 'medium'; // small, medium, large, xlarge
        this.onClose = options.onClose || (() => {});
        this.onConfirm = options.onConfirm || null;
        this.confirmText = options.confirmText || 'Confirm';
        this.cancelText = options.cancelText || 'Cancel';
        this.showFooter = options.showFooter !== false;
        this.closeOnOverlay = options.closeOnOverlay !== false;
        
        this.element = null;
        this.overlay = null;
    }

    /**
     * Create modal HTML
     */
    createHTML() {
        const sizeClasses = {
            small: 'width: 400px;',
            medium: 'width: 600px;',
            large: 'width: 900px;',
            xlarge: 'width: 1100px;'
        };

        return `
            <div class="modal-content" style="${sizeClasses[this.size]} max-width: 98vw;">
                <div class="modal-header">
                    <h2 class="modal-title">${this.title}</h2>
                    <button class="modal-close" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
                ${this.showFooter ? `
                    <div class="modal-footer">
                        ${this.onConfirm ? `
                            <button class="btn btn-primary" data-action="confirm">
                                ${this.confirmText}
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" data-action="cancel">
                            ${this.cancelText}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Show modal
     */
    show() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.id = `${this.id}-overlay`;
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create modal container
        this.element = document.createElement('div');
        this.element.className = 'modal';
        this.element.id = this.id;
        this.element.innerHTML = this.createHTML();

        // Add to overlay
        this.overlay.appendChild(this.element);
        document.body.appendChild(this.overlay);

        // Bind events
        this.bindEvents();

        // Focus first input if exists
        const firstInput = this.element.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        return this;
    }

    /**
     * Hide modal
     */
    hide() {
        if (this.overlay) {
            // Fade out animation
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                if (this.overlay && this.overlay.parentNode) {
                    this.overlay.parentNode.removeChild(this.overlay);
                }
                this.overlay = null;
                this.element = null;
            }, 300);
        }
        
        this.onClose();
        return this;
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Close button
        const closeBtn = this.element.querySelector('[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Cancel button
        const cancelBtn = this.element.querySelector('[data-action="cancel"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }

        // Confirm button
        const confirmBtn = this.element.querySelector('[data-action="confirm"]');
        if (confirmBtn && this.onConfirm) {
            confirmBtn.addEventListener('click', () => {
                const result = this.onConfirm();
                if (result !== false) {
                    this.hide();
                }
            });
        }

        // Overlay click
        if (this.closeOnOverlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
        }

        // Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Update content
     */
    setContent(content) {
        this.content = content;
        if (this.element) {
            const body = this.element.querySelector('.modal-body');
            if (body) {
                body.innerHTML = content;
            }
        }
        return this;
    }

    /**
     * Update title
     */
    setTitle(title) {
        this.title = title;
        if (this.element) {
            const titleEl = this.element.querySelector('.modal-title');
            if (titleEl) {
                titleEl.textContent = title;
            }
        }
        return this;
    }

    /**
     * Static method to show confirmation dialog
     */
    static confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: options.title || 'Confirm',
                content: `<p>${message}</p>`,
                size: 'small',
                confirmText: options.confirmText || 'Yes',
                cancelText: options.cancelText || 'No',
                onConfirm: () => {
                    resolve(true);
                    return true;
                },
                onClose: () => {
                    resolve(false);
                }
            });
            modal.show();
        });
    }

    /**
     * Static method to show alert dialog
     */
    static alert(message, options = {}) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title: options.title || 'Alert',
                content: `<p>${message}</p>`,
                size: 'small',
                showFooter: true,
                onConfirm: null,
                cancelText: 'OK',
                onClose: () => resolve()
            });
            modal.show();
        });
    }

    /**
     * Static method to show loading dialog
     */
    static loading(message = 'Loading...') {
        const modal = new Modal({
            title: '',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <div class="spinner"></div>
                    <p style="margin-top: 16px;">${message}</p>
                </div>
            `,
            size: 'small',
            showFooter: false,
            closeOnOverlay: false
        });
        modal.show();
        return modal;
    }
}

export default Modal;