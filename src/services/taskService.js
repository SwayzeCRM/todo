/**
 * Task Service
 * Business logic for task management
 */

import { TaskAPI } from '../api/taskAPI.js';
import { validateTask, sanitizeTaskData } from '../utils/validators.js';

class TaskService {
    constructor() {
        this.tasks = [];
        this.currentTask = null;
    }

    /**
     * Load all tasks from database
     */
    async loadTasks() {
        try {
            const tasks = await TaskAPI.fetchAll();
            this.tasks = tasks || [];
            return this.tasks;
        } catch (error) {
            console.error('Error loading tasks:', error);
            throw new Error('Failed to load tasks from database');
        }
    }

    /**
     * Create a new task
     */
    async createTask(taskData) {
        try {
            // Validate task data
            const validation = validateTask(taskData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Sanitize data
            const sanitized = sanitizeTaskData(taskData);
            
            // Calculate position
            if (!sanitized.position) {
                sanitized.position = await this.getNextPosition();
            }

            // Create task
            const newTask = await TaskAPI.create(sanitized);
            
            // Update local cache
            this.tasks.push(newTask);
            
            return newTask;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    /**
     * Update existing task
     */
    async updateTask(taskId, updates) {
        try {
            // Validate updates
            const validation = validateTask(updates, true);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Sanitize data
            const sanitized = sanitizeTaskData(updates);
            
            // Update task
            const updatedTask = await TaskAPI.update(taskId, sanitized);
            
            // Update local cache
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
            }
            
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
        try {
            await TaskAPI.delete(taskId);
            
            // Update local cache
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    /**
     * Toggle task active status
     */
    async toggleTaskActive(taskId, isActive) {
        return this.updateTask(taskId, { is_active: isActive });
    }

    /**
     * Get next available position
     */
    async getNextPosition() {
        const maxPosition = Math.max(0, ...this.tasks.map(t => t.position || 0));
        return maxPosition + 1;
    }

    /**
     * Filter tasks by criteria
     */
    filterTasks(criteria) {
        let filtered = [...this.tasks];
        
        if (criteria.targetType && criteria.targetType !== 'all') {
            filtered = filtered.filter(task => {
                const taskTargetType = task.target_type || 'all';
                return taskTargetType === criteria.targetType;
            });
        }
        
        if (criteria.taskGroupId) {
            filtered = filtered.filter(task => 
                task.task_group_id === criteria.taskGroupId
            );
        }
        
        if (criteria.userId) {
            filtered = filtered.filter(task => 
                this.doesTaskApplyToUser(task, criteria.userId)
            );
        }
        
        return filtered;
    }

    /**
     * Check if task applies to specific user
     */
    doesTaskApplyToUser(task, userId) {
        if (!task.target_type || task.target_type === 'all') {
            return true;
        }
        
        if (task.target_type === 'individuals') {
            return task.target_users?.includes(userId);
        }
        
        // Add more logic for groups and locations
        return false;
    }

    /**
     * Assign tasks to a group
     */
    async assignTasksToGroup(taskIds, groupId) {
        try {
            const updates = taskIds.map(taskId => 
                this.updateTask(taskId, { task_group_id: groupId })
            );
            
            return await Promise.all(updates);
        } catch (error) {
            console.error('Error assigning tasks to group:', error);
            throw error;
        }
    }

    /**
     * Remove tasks from a group
     */
    async removeTasksFromGroup(taskIds, groupId) {
        try {
            const updates = taskIds.map(taskId => {
                const task = this.tasks.find(t => t.id === taskId);
                if (task && task.task_group_id === groupId) {
                    return this.updateTask(taskId, { task_group_id: null });
                }
                return Promise.resolve();
            });
            
            return await Promise.all(updates);
        } catch (error) {
            console.error('Error removing tasks from group:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const taskService = new TaskService();
export default taskService;