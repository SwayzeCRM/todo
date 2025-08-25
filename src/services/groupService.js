/**
 * Group Service
 * Business logic for task groups and user groups
 */

import { GroupAPI } from '../api/groupAPI.js';
import { validateGroup } from '../utils/validators.js';

class GroupService {
    constructor() {
        this.taskGroups = [];
        this.userGroups = [];
    }

    // ============ Task Groups ============

    /**
     * Load all task groups
     */
    async loadTaskGroups() {
        try {
            const groups = await GroupAPI.fetchAllTaskGroups();
            this.taskGroups = groups || [];
            return this.taskGroups;
        } catch (error) {
            console.error('Error loading task groups:', error);
            throw new Error('Failed to load task groups');
        }
    }

    /**
     * Create task group
     */
    async createTaskGroup(groupData) {
        try {
            const validation = validateGroup(groupData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            const newGroup = await GroupAPI.createTaskGroup({
                ...groupData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            this.taskGroups.push(newGroup);
            return newGroup;
        } catch (error) {
            console.error('Error creating task group:', error);
            throw error;
        }
    }

    /**
     * Update task group
     */
    async updateTaskGroup(groupId, updates) {
        try {
            const updatedGroup = await GroupAPI.updateTaskGroup(groupId, {
                ...updates,
                updated_at: new Date().toISOString()
            });

            const index = this.taskGroups.findIndex(g => g.id === groupId);
            if (index !== -1) {
                this.taskGroups[index] = updatedGroup;
            }

            return updatedGroup;
        } catch (error) {
            console.error('Error updating task group:', error);
            throw error;
        }
    }

    /**
     * Delete task group
     */
    async deleteTaskGroup(groupId) {
        try {
            // First, unassign all tasks from this group
            await GroupAPI.unassignTasksFromGroup(groupId);
            
            // Then delete the group
            await GroupAPI.deleteTaskGroup(groupId);
            
            // Update local cache
            this.taskGroups = this.taskGroups.filter(g => g.id !== groupId);
            
            return true;
        } catch (error) {
            console.error('Error deleting task group:', error);
            throw error;
        }
    }

    // ============ User Groups ============

    /**
     * Load all user groups
     */
    async loadUserGroups() {
        try {
            const groups = await GroupAPI.fetchAllUserGroups();
            this.userGroups = groups || [];
            return this.userGroups;
        } catch (error) {
            console.error('Error loading user groups:', error);
            throw new Error('Failed to load user groups');
        }
    }

    /**
     * Create user group
     */
    async createUserGroup(groupData) {
        try {
            const validation = validateGroup(groupData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            const newGroup = await GroupAPI.createUserGroup({
                ...groupData,
                created_at: new Date().toISOString()
            });

            this.userGroups.push(newGroup);
            return newGroup;
        } catch (error) {
            console.error('Error creating user group:', error);
            throw error;
        }
    }

    /**
     * Update user group
     */
    async updateUserGroup(groupId, updates) {
        try {
            // Prevent updating "All Users" group name
            const group = this.userGroups.find(g => g.id === groupId);
            if (group && group.group_name === 'All Users' && updates.group_name) {
                throw new Error('Cannot rename the "All Users" group');
            }

            const updatedGroup = await GroupAPI.updateUserGroup(groupId, updates);

            const index = this.userGroups.findIndex(g => g.id === groupId);
            if (index !== -1) {
                this.userGroups[index] = updatedGroup;
            }

            return updatedGroup;
        } catch (error) {
            console.error('Error updating user group:', error);
            throw error;
        }
    }

    /**
     * Delete user group
     */
    async deleteUserGroup(groupId) {
        try {
            // Prevent deleting "All Users" group
            const group = this.userGroups.find(g => g.id === groupId);
            if (group && group.group_name === 'All Users') {
                throw new Error('Cannot delete the "All Users" group');
            }

            // Move users to "All Users" group before deletion
            const allUsersGroup = this.userGroups.find(g => g.group_name === 'All Users');
            if (allUsersGroup) {
                await GroupAPI.reassignUsersToGroup(groupId, allUsersGroup.id);
            }

            await GroupAPI.deleteUserGroup(groupId);
            
            this.userGroups = this.userGroups.filter(g => g.id !== groupId);
            
            return true;
        } catch (error) {
            console.error('Error deleting user group:', error);
            throw error;
        }
    }

    /**
     * Get active task groups for dropdowns
     */
    getActiveTaskGroups() {
        return this.taskGroups.filter(g => g.is_active);
    }

    /**
     * Get user groups for selection
     */
    getUserGroupsForSelection() {
        return this.userGroups.map(g => ({
            id: g.id,
            name: g.group_name,
            isProtected: g.group_name === 'All Users'
        }));
    }

    /**
     * Assign user to group
     */
    async assignUserToGroup(userId, groupId) {
        try {
            return await GroupAPI.assignUserToGroup(userId, groupId);
        } catch (error) {
            console.error('Error assigning user to group:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const groupService = new GroupService();
export default groupService;