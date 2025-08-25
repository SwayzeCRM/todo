/**
 * Theme Manager
 * Handles dark mode and theme preferences
 */

export class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'theme-preference';
        this.themes = ['light', 'dark', 'auto'];
        this.currentTheme = this.getStoredTheme() || 'auto';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }

    /**
     * Initialize theme
     */
    init() {
        // Apply initial theme
        this.applyTheme(this.currentTheme);
        
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.updateTheme();
            }
        });
        
        // Add theme toggle button to DOM
        this.createThemeToggle();
        
        // Listen for keyboard shortcut (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Get stored theme preference
     */
    getStoredTheme() {
        try {
            return localStorage.getItem(this.STORAGE_KEY);
        } catch {
            return null;
        }
    }

    /**
     * Store theme preference
     */
    storeTheme(theme) {
        try {
            localStorage.setItem(this.STORAGE_KEY, theme);
        } catch {
            console.warn('Failed to save theme preference');
        }
    }

    /**
     * Get effective theme (resolves 'auto' to actual theme)
     */
    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.mediaQuery.matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        this.storeTheme(theme);
        
        const effectiveTheme = this.getEffectiveTheme();
        
        // Update document attribute
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = effectiveTheme === 'dark' ? '#111827' : '#ffffff';
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = effectiveTheme === 'dark' ? '#111827' : '#ffffff';
            document.head.appendChild(meta);
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('themechange', { 
            detail: { theme: effectiveTheme, preference: theme }
        }));
        
        // Update toggle button
        this.updateToggleButton();
    }

    /**
     * Update theme (called when system preference changes)
     */
    updateTheme() {
        if (this.currentTheme === 'auto') {
            this.applyTheme('auto');
        }
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIndex]);
    }

    /**
     * Set specific theme
     */
    setTheme(theme) {
        if (this.themes.includes(theme)) {
            this.applyTheme(theme);
        }
    }

    /**
     * Create theme toggle button
     */
    createThemeToggle() {
        // Check if toggle already exists
        if (document.getElementById('theme-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Toggle theme');
        toggle.setAttribute('title', 'Toggle theme (Ctrl+Shift+D)');
        
        toggle.innerHTML = this.getToggleIcon();
        
        toggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Add CSS if not already present
        if (!document.getElementById('theme-toggle-styles')) {
            const style = document.createElement('style');
            style.id = 'theme-toggle-styles';
            style.textContent = `
                .theme-toggle {
                    position: fixed;
                    bottom: var(--space-6);
                    right: var(--space-6);
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-full);
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--duration-200) var(--ease-out);
                    z-index: var(--z-fixed);
                    color: var(--color-text);
                }
                
                .theme-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: var(--shadow-xl);
                }
                
                .theme-toggle:active {
                    transform: scale(0.95);
                }
                
                .theme-toggle svg {
                    width: 24px;
                    height: 24px;
                }
                
                .theme-toggle .theme-icon {
                    transition: opacity var(--duration-200) var(--ease-out);
                }
                
                .theme-toggle .theme-icon:not(.active) {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .theme-toggle {
                        bottom: var(--space-4);
                        right: var(--space-4);
                        width: 40px;
                        height: 40px;
                    }
                    
                    .theme-toggle svg {
                        width: 20px;
                        height: 20px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toggle);
    }

    /**
     * Get toggle icon based on current theme
     */
    getToggleIcon() {
        const icons = {
            light: `<svg class="theme-icon active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>`,
            dark: `<svg class="theme-icon active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>`,
            auto: `<svg class="theme-icon active" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>`
        };
        
        if (this.currentTheme === 'auto') {
            return icons.auto;
        }
        
        return icons[this.getEffectiveTheme()];
    }

    /**
     * Update toggle button icon
     */
    updateToggleButton() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.getToggleIcon();
        }
    }

    /**
     * Get theme for specific component
     */
    getComponentTheme(component) {
        const effectiveTheme = this.getEffectiveTheme();
        
        // Component-specific theme overrides
        const componentThemes = {
            'chart': {
                light: {
                    background: '#ffffff',
                    text: '#374151',
                    grid: '#e5e7eb',
                    primary: '#3b82f6'
                },
                dark: {
                    background: '#1f2937',
                    text: '#f3f4f6',
                    grid: '#374151',
                    primary: '#60a5fa'
                }
            },
            'editor': {
                light: {
                    background: '#ffffff',
                    text: '#111827',
                    selection: '#dbeafe',
                    cursor: '#3b82f6'
                },
                dark: {
                    background: '#111827',
                    text: '#f9fafb',
                    selection: '#1e40af',
                    cursor: '#60a5fa'
                }
            }
        };
        
        return componentThemes[component]?.[effectiveTheme] || {};
    }
}

// Create and export singleton instance
export const themeManager = new ThemeManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeManager.init());
} else {
    themeManager.init();
}

export default themeManager;