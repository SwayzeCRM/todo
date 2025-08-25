/**
 * Enhanced Task Card Component
 * Modern UI with drag-and-drop support
 */

export class TaskCard {
    constructor(task, options = {}) {
        this.task = task;
        this.onEdit = options.onEdit || (() => {});
        this.onDelete = options.onDelete || (() => {});
        this.onToggle = options.onToggle || (() => {});
        this.onDragStart = options.onDragStart || (() => {});
        this.onDragEnd = options.onDragEnd || (() => {});
        this.isDraggable = options.isDraggable !== false;
        this.showActions = options.showActions !== false;
    }

    /**
     * Get priority color
     */
    getPriorityColor() {
        const colors = {
            low: 'var(--success)',
            normal: 'var(--info)',
            high: 'var(--warning)',
            urgent: 'var(--error)'
        };
        return colors[this.task.priority] || colors.normal;
    }

    /**
     * Get status icon
     */
    getStatusIcon() {
        if (this.task.completed) {
            return '<i data-lucide="check-circle" class="task-status-icon"></i>';
        } else if (this.task.in_progress) {
            return '<i data-lucide="clock" class="task-status-icon"></i>';
        } else {
            return '<i data-lucide="circle" class="task-status-icon"></i>';
        }
    }

    /**
     * Get due date display
     */
    getDueDateDisplay() {
        if (!this.task.due_date) return '';
        
        const dueDate = new Date(this.task.due_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const isOverdue = dueDate < today;
        const isToday = dueDate.toDateString() === today.toDateString();
        const isTomorrow = dueDate.toDateString() === tomorrow.toDateString();
        
        let dateText = '';
        let className = 'task-due-date';
        
        if (isOverdue) {
            dateText = 'Overdue';
            className += ' overdue';
        } else if (isToday) {
            dateText = 'Today';
            className += ' today';
        } else if (isTomorrow) {
            dateText = 'Tomorrow';
            className += ' tomorrow';
        } else {
            dateText = dueDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
        
        return `
            <span class="${className}">
                <i data-lucide="calendar" class="icon-sm"></i>
                ${dateText}
            </span>
        `;
    }

    /**
     * Get assignee display
     */
    getAssigneeDisplay() {
        if (!this.task.assigned_to) return '';
        
        const initials = this.task.assigned_to.full_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
        
        return `
            <div class="task-assignee" title="${this.task.assigned_to.full_name}">
                <div class="avatar avatar-sm">
                    ${this.task.assigned_to.avatar_url ? 
                        `<img src="${this.task.assigned_to.avatar_url}" alt="${this.task.assigned_to.full_name}">` :
                        `<span class="avatar-initials">${initials}</span>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Get tags display
     */
    getTagsDisplay() {
        if (!this.task.tags || this.task.tags.length === 0) return '';
        
        return `
            <div class="task-tags">
                ${this.task.tags.map(tag => `
                    <span class="tag tag-${tag.color || 'gray'}">
                        ${tag.name}
                    </span>
                `).join('')}
            </div>
        `;
    }

    /**
     * Get progress bar
     */
    getProgressBar() {
        if (!this.task.subtasks || this.task.subtasks.length === 0) return '';
        
        const completed = this.task.subtasks.filter(st => st.completed).length;
        const total = this.task.subtasks.length;
        const percentage = Math.round((completed / total) * 100);
        
        return `
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="progress-text">${completed}/${total}</span>
            </div>
        `;
    }

    /**
     * Render the task card
     */
    render() {
        const priorityColor = this.getPriorityColor();
        
        return `
            <div class="task-card ${this.task.completed ? 'completed' : ''} ${this.task.is_active ? '' : 'inactive'}"
                 data-task-id="${this.task.id}"
                 ${this.isDraggable ? 'draggable="true"' : ''}
                 style="--priority-color: ${priorityColor}">
                
                <!-- Priority Indicator -->
                <div class="task-priority-indicator"></div>
                
                <!-- Main Content -->
                <div class="task-card-content">
                    <!-- Header -->
                    <div class="task-card-header">
                        <div class="task-card-status">
                            ${this.getStatusIcon()}
                            <span class="task-number">#${this.task.position || 0}</span>
                        </div>
                        
                        ${this.showActions ? `
                            <div class="task-card-actions">
                                <button class="btn-icon btn-ghost btn-sm" data-action="edit" title="Edit">
                                    <i data-lucide="edit-2"></i>
                                </button>
                                <button class="btn-icon btn-ghost btn-sm" data-action="duplicate" title="Duplicate">
                                    <i data-lucide="copy"></i>
                                </button>
                                <button class="btn-icon btn-ghost btn-sm" data-action="delete" title="Delete">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Title & Description -->
                    <div class="task-card-body">
                        <h3 class="task-title">${this.task.title}</h3>
                        ${this.task.description ? `
                            <p class="task-description">${this.task.description}</p>
                        ` : ''}
                        
                        ${this.getProgressBar()}
                        ${this.getTagsDisplay()}
                    </div>
                    
                    <!-- Footer -->
                    <div class="task-card-footer">
                        <div class="task-meta">
                            ${this.getDueDateDisplay()}
                            ${this.task.task_group ? `
                                <span class="task-group">
                                    <i data-lucide="folder" class="icon-sm"></i>
                                    ${this.task.task_group.name}
                                </span>
                            ` : ''}
                        </div>
                        
                        <div class="task-people">
                            ${this.getAssigneeDisplay()}
                            ${this.task.comments_count ? `
                                <span class="task-comments">
                                    <i data-lucide="message-circle" class="icon-sm"></i>
                                    ${this.task.comments_count}
                                </span>
                            ` : ''}
                            ${this.task.attachments_count ? `
                                <span class="task-attachments">
                                    <i data-lucide="paperclip" class="icon-sm"></i>
                                    ${this.task.attachments_count}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Drag Handle -->
                ${this.isDraggable ? `
                    <div class="task-drag-handle">
                        <i data-lucide="grip-vertical"></i>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEvents(element) {
        // Edit button
        const editBtn = element.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onEdit(this.task);
            });
        }

        // Delete button
        const deleteBtn = element.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onDelete(this.task);
            });
        }

        // Duplicate button
        const duplicateBtn = element.querySelector('[data-action="duplicate"]');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onDuplicate(this.task);
            });
        }

        // Status toggle
        const statusIcon = element.querySelector('.task-status-icon');
        if (statusIcon) {
            statusIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.onToggle(this.task);
            });
        }

        // Drag events
        if (this.isDraggable) {
            element.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', element.innerHTML);
                element.classList.add('dragging');
                this.onDragStart(this.task, e);
            });

            element.addEventListener('dragend', (e) => {
                element.classList.remove('dragging');
                this.onDragEnd(this.task, e);
            });
        }

        // Card click
        element.addEventListener('click', () => {
            this.onEdit(this.task);
        });
    }

    /**
     * Create and mount the component
     */
    mount(container) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.render();
        const element = wrapper.firstElementChild;
        
        this.attachEvents(element);
        container.appendChild(element);
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        return element;
    }
}

/**
 * Task List Component with drag-and-drop support
 */
export class TaskList {
    constructor(tasks, options = {}) {
        this.tasks = tasks;
        this.onReorder = options.onReorder || (() => {});
        this.onTaskEdit = options.onTaskEdit || (() => {});
        this.onTaskDelete = options.onTaskDelete || (() => {});
        this.onTaskToggle = options.onTaskToggle || (() => {});
        this.groupBy = options.groupBy || null;
        this.sortBy = options.sortBy || 'position';
        this.filter = options.filter || null;
    }

    /**
     * Group tasks
     */
    getGroupedTasks() {
        if (!this.groupBy) {
            return { 'All Tasks': this.tasks };
        }

        const groups = {};
        this.tasks.forEach(task => {
            const groupKey = task[this.groupBy] || 'Uncategorized';
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(task);
        });

        return groups;
    }

    /**
     * Sort tasks
     */
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.sortBy) {
                case 'position':
                    return (a.position || 0) - (b.position || 0);
                case 'due_date':
                    return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }

    /**
     * Filter tasks
     */
    filterTasks(tasks) {
        if (!this.filter) return tasks;

        return tasks.filter(task => {
            if (this.filter.completed !== undefined && task.completed !== this.filter.completed) {
                return false;
            }
            if (this.filter.active !== undefined && task.is_active !== this.filter.active) {
                return false;
            }
            if (this.filter.search) {
                const searchLower = this.filter.search.toLowerCase();
                return task.title.toLowerCase().includes(searchLower) ||
                       task.description?.toLowerCase().includes(searchLower);
            }
            return true;
        });
    }

    /**
     * Render the task list
     */
    render() {
        const groups = this.getGroupedTasks();
        
        return `
            <div class="task-list-container">
                ${Object.entries(groups).map(([groupName, tasks]) => {
                    const filteredTasks = this.filterTasks(tasks);
                    const sortedTasks = this.sortTasks(filteredTasks);
                    
                    return `
                        <div class="task-group" data-group="${groupName}">
                            ${this.groupBy ? `
                                <div class="task-group-header">
                                    <h3 class="task-group-title">${groupName}</h3>
                                    <span class="task-group-count">${sortedTasks.length}</span>
                                </div>
                            ` : ''}
                            
                            <div class="task-list" data-group="${groupName}">
                                ${sortedTasks.length > 0 ? 
                                    sortedTasks.map(task => {
                                        const card = new TaskCard(task, {
                                            onEdit: this.onTaskEdit,
                                            onDelete: this.onTaskDelete,
                                            onToggle: this.onTaskToggle
                                        });
                                        return card.render();
                                    }).join('') :
                                    '<div class="empty-state">No tasks in this group</div>'
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Set up drag and drop
     */
    setupDragAndDrop(container) {
        let draggedElement = null;
        let draggedTask = null;

        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedElement = e.target;
                draggedTask = this.tasks.find(t => t.id === e.target.dataset.taskId);
            }
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingOver = e.target.closest('.task-card');
            
            if (draggingOver && draggingOver !== draggedElement) {
                const rect = draggingOver.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    draggingOver.classList.add('drag-over-top');
                    draggingOver.classList.remove('drag-over-bottom');
                } else {
                    draggingOver.classList.add('drag-over-bottom');
                    draggingOver.classList.remove('drag-over-top');
                }
            }
        });

        container.addEventListener('dragleave', (e) => {
            const draggingOver = e.target.closest('.task-card');
            if (draggingOver) {
                draggingOver.classList.remove('drag-over-top', 'drag-over-bottom');
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            const droppedOn = e.target.closest('.task-card');
            
            if (droppedOn && draggedElement) {
                const rect = droppedOn.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const insertBefore = e.clientY < midpoint;
                
                const parent = droppedOn.parentNode;
                if (insertBefore) {
                    parent.insertBefore(draggedElement, droppedOn);
                } else {
                    parent.insertBefore(draggedElement, droppedOn.nextSibling);
                }
                
                // Update positions
                const newOrder = Array.from(parent.querySelectorAll('.task-card'))
                    .map((card, index) => ({
                        id: card.dataset.taskId,
                        position: index + 1
                    }));
                
                this.onReorder(newOrder);
            }
            
            // Clean up
            container.querySelectorAll('.drag-over-top, .drag-over-bottom')
                .forEach(el => el.classList.remove('drag-over-top', 'drag-over-bottom'));
        });
    }

    /**
     * Mount the component
     */
    mount(container) {
        container.innerHTML = this.render();
        this.setupDragAndDrop(container);
        
        // Initialize all task cards
        container.querySelectorAll('.task-card').forEach(cardEl => {
            const taskId = cardEl.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                const card = new TaskCard(task, {
                    onEdit: this.onTaskEdit,
                    onDelete: this.onTaskDelete,
                    onToggle: this.onTaskToggle
                });
                card.attachEvents(cardEl);
            }
        });
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

export default TaskCard;