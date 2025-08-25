/**
 * Advanced Search and Filter Component
 * Real-time search with multiple filter options
 */

export class SearchFilter {
    constructor(options = {}) {
        this.onSearch = options.onSearch || (() => {});
        this.onFilter = options.onFilter || (() => {});
        this.filters = options.filters || {};
        this.searchPlaceholder = options.searchPlaceholder || 'Search...';
        this.debounceTime = options.debounceTime || 300;
        this.searchTimeout = null;
        
        // Available filter options
        this.filterOptions = {
            status: [
                { value: 'all', label: 'All Tasks', icon: 'list' },
                { value: 'active', label: 'Active', icon: 'circle' },
                { value: 'completed', label: 'Completed', icon: 'check-circle' },
                { value: 'in_progress', label: 'In Progress', icon: 'clock' }
            ],
            priority: [
                { value: 'all', label: 'All Priorities', icon: 'flag' },
                { value: 'urgent', label: 'Urgent', color: 'var(--error)' },
                { value: 'high', label: 'High', color: 'var(--warning)' },
                { value: 'normal', label: 'Normal', color: 'var(--info)' },
                { value: 'low', label: 'Low', color: 'var(--success)' }
            ],
            assignee: [],
            group: [],
            tags: []
        };
        
        // Current filter state
        this.currentFilters = {
            search: '',
            status: 'all',
            priority: 'all',
            assignee: 'all',
            group: 'all',
            tags: [],
            dateRange: null
        };
    }

    /**
     * Set filter options dynamically
     */
    setFilterOptions(type, options) {
        this.filterOptions[type] = options;
        this.render();
    }

    /**
     * Get active filter count
     */
    getActiveFilterCount() {
        let count = 0;
        if (this.currentFilters.search) count++;
        if (this.currentFilters.status !== 'all') count++;
        if (this.currentFilters.priority !== 'all') count++;
        if (this.currentFilters.assignee !== 'all') count++;
        if (this.currentFilters.group !== 'all') count++;
        if (this.currentFilters.tags.length > 0) count++;
        if (this.currentFilters.dateRange) count++;
        return count;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            search: '',
            status: 'all',
            priority: 'all',
            assignee: 'all',
            group: 'all',
            tags: [],
            dateRange: null
        };
        
        // Update UI
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        
        document.querySelectorAll('.filter-select').forEach(select => {
            select.value = 'all';
        });
        
        document.querySelectorAll('.tag-filter.active').forEach(tag => {
            tag.classList.remove('active');
        });
        
        this.applyFilters();
    }

    /**
     * Apply current filters
     */
    applyFilters() {
        this.onFilter(this.currentFilters);
        this.updateFilterBadge();
    }

    /**
     * Update filter badge count
     */
    updateFilterBadge() {
        const count = this.getActiveFilterCount();
        const badge = document.getElementById('filter-count-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Render the component
     */
    render() {
        return `
            <div class="search-filter-container">
                <!-- Search Bar -->
                <div class="search-bar">
                    <div class="search-input-wrapper">
                        <i data-lucide="search" class="search-icon"></i>
                        <input 
                            type="text" 
                            id="search-input"
                            class="search-input" 
                            placeholder="${this.searchPlaceholder}"
                            value="${this.currentFilters.search}"
                        >
                        ${this.currentFilters.search ? `
                            <button class="search-clear" id="search-clear">
                                <i data-lucide="x"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Quick Filters -->
                    <div class="quick-filters">
                        <button class="filter-btn ${this.currentFilters.status === 'active' ? 'active' : ''}" 
                                data-filter="status" data-value="active">
                            <i data-lucide="circle"></i>
                            Active
                        </button>
                        <button class="filter-btn ${this.currentFilters.status === 'completed' ? 'active' : ''}"
                                data-filter="status" data-value="completed">
                            <i data-lucide="check-circle"></i>
                            Completed
                        </button>
                        <button class="filter-btn" id="advanced-filters-btn">
                            <i data-lucide="filter"></i>
                            Filters
                            <span id="filter-count-badge" class="filter-badge" style="display: none;">0</span>
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Filters Panel -->
                <div class="advanced-filters" id="advanced-filters" style="display: none;">
                    <div class="filter-section">
                        <label class="filter-label">Status</label>
                        <select class="filter-select" id="filter-status">
                            ${this.filterOptions.status.map(opt => `
                                <option value="${opt.value}" ${this.currentFilters.status === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-section">
                        <label class="filter-label">Priority</label>
                        <select class="filter-select" id="filter-priority">
                            ${this.filterOptions.priority.map(opt => `
                                <option value="${opt.value}" ${this.currentFilters.priority === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    ${this.filterOptions.assignee.length > 0 ? `
                        <div class="filter-section">
                            <label class="filter-label">Assignee</label>
                            <select class="filter-select" id="filter-assignee">
                                <option value="all">All Assignees</option>
                                ${this.filterOptions.assignee.map(user => `
                                    <option value="${user.id}" ${this.currentFilters.assignee === user.id ? 'selected' : ''}>
                                        ${user.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    ` : ''}
                    
                    ${this.filterOptions.group.length > 0 ? `
                        <div class="filter-section">
                            <label class="filter-label">Group</label>
                            <select class="filter-select" id="filter-group">
                                <option value="all">All Groups</option>
                                ${this.filterOptions.group.map(group => `
                                    <option value="${group.id}" ${this.currentFilters.group === group.id ? 'selected' : ''}>
                                        ${group.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    ` : ''}
                    
                    ${this.filterOptions.tags.length > 0 ? `
                        <div class="filter-section">
                            <label class="filter-label">Tags</label>
                            <div class="tag-filters">
                                ${this.filterOptions.tags.map(tag => `
                                    <button class="tag-filter ${this.currentFilters.tags.includes(tag.id) ? 'active' : ''}"
                                            data-tag-id="${tag.id}">
                                        ${tag.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="filter-section">
                        <label class="filter-label">Date Range</label>
                        <div class="date-range-filters">
                            <button class="date-filter-btn" data-range="today">Today</button>
                            <button class="date-filter-btn" data-range="week">This Week</button>
                            <button class="date-filter-btn" data-range="month">This Month</button>
                            <button class="date-filter-btn" data-range="custom">Custom</button>
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn btn-ghost btn-sm" id="clear-filters">
                            Clear All
                        </button>
                        <button class="btn btn-primary btn-sm" id="apply-filters">
                            Apply Filters
                        </button>
                    </div>
                </div>
                
                <!-- Search Results Info -->
                <div class="search-info" id="search-info" style="display: none;">
                    <span class="search-results-text"></span>
                    <button class="btn btn-ghost btn-sm" id="clear-search">
                        Clear Search
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEvents(container) {
        // Search input
        const searchInput = container.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.currentFilters.search = e.target.value;
                
                // Show/hide clear button
                const clearBtn = container.querySelector('#search-clear');
                if (clearBtn) {
                    clearBtn.style.display = e.target.value ? 'block' : 'none';
                }
                
                // Debounced search
                this.searchTimeout = setTimeout(() => {
                    this.onSearch(e.target.value);
                    this.applyFilters();
                }, this.debounceTime);
            });
            
            // Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(this.searchTimeout);
                    this.onSearch(e.target.value);
                    this.applyFilters();
                }
            });
        }

        // Clear search
        const clearSearch = container.querySelector('#search-clear');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.currentFilters.search = '';
                this.onSearch('');
                this.applyFilters();
            });
        }

        // Quick filter buttons
        container.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                const value = btn.dataset.value;
                
                // Toggle filter
                if (this.currentFilters[filter] === value) {
                    this.currentFilters[filter] = 'all';
                    btn.classList.remove('active');
                } else {
                    this.currentFilters[filter] = value;
                    
                    // Remove active from other buttons in same group
                    container.querySelectorAll(`.filter-btn[data-filter="${filter}"]`)
                        .forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
                
                this.applyFilters();
            });
        });

        // Advanced filters toggle
        const advancedBtn = container.querySelector('#advanced-filters-btn');
        const advancedPanel = container.querySelector('#advanced-filters');
        if (advancedBtn && advancedPanel) {
            advancedBtn.addEventListener('click', () => {
                const isVisible = advancedPanel.style.display !== 'none';
                advancedPanel.style.display = isVisible ? 'none' : 'flex';
                advancedBtn.classList.toggle('active', !isVisible);
            });
        }

        // Filter selects
        container.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                const filterId = select.id.replace('filter-', '');
                this.currentFilters[filterId] = select.value;
            });
        });

        // Tag filters
        container.querySelectorAll('.tag-filter').forEach(tag => {
            tag.addEventListener('click', () => {
                const tagId = tag.dataset.tagId;
                const index = this.currentFilters.tags.indexOf(tagId);
                
                if (index > -1) {
                    this.currentFilters.tags.splice(index, 1);
                    tag.classList.remove('active');
                } else {
                    this.currentFilters.tags.push(tagId);
                    tag.classList.add('active');
                }
            });
        });

        // Date range filters
        container.querySelectorAll('.date-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const range = btn.dataset.range;
                
                // Remove active from all date buttons
                container.querySelectorAll('.date-filter-btn')
                    .forEach(b => b.classList.remove('active'));
                
                if (this.currentFilters.dateRange === range) {
                    this.currentFilters.dateRange = null;
                } else {
                    this.currentFilters.dateRange = range;
                    btn.classList.add('active');
                    
                    if (range === 'custom') {
                        // Show date picker (implement as needed)
                        this.showDatePicker();
                    }
                }
            });
        });

        // Apply filters button
        const applyBtn = container.querySelector('#apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
                advancedPanel.style.display = 'none';
                advancedBtn.classList.remove('active');
            });
        }

        // Clear filters button
        const clearBtn = container.querySelector('#clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    /**
     * Show date picker for custom range
     */
    showDatePicker() {
        // Implement date picker modal
        console.log('Show date picker for custom range');
    }

    /**
     * Update search results info
     */
    updateSearchInfo(resultCount, totalCount) {
        const searchInfo = document.getElementById('search-info');
        const searchText = document.querySelector('.search-results-text');
        
        if (searchInfo && searchText) {
            if (this.currentFilters.search || this.getActiveFilterCount() > 0) {
                searchText.textContent = `Showing ${resultCount} of ${totalCount} tasks`;
                searchInfo.style.display = 'flex';
            } else {
                searchInfo.style.display = 'none';
            }
        }
    }

    /**
     * Mount the component
     */
    mount(container) {
        container.innerHTML = this.render();
        this.attachEvents(container);
        this.updateFilterBadge();
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

export default SearchFilter;