/**
 * Group API
 * Data access layer for task groups and user groups
 */

import supabaseClient from './supabaseClient.js';

export const GroupAPI = {
    // ============ Task Groups ============
    
    /**
     * Fetch all task groups
     */
    async fetchAllTaskGroups() {
        const { data, error } = await supabaseClient
            .from('task_groups')
            .select('*')
            .order('display_order');
        
        if (error) throw error;
        return data;
    },

    /**
     * Create task group
     */
    async createTaskGroup(groupData) {
        const { data, error } = await supabaseClient
            .from('task_groups')
            .insert([groupData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Update task group
     */
    async updateTaskGroup(groupId, updates) {
        const { data, error } = await supabaseClient
            .from('task_groups')
            .update(updates)
            .eq('id', groupId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Delete task group
     */
    async deleteTaskGroup(groupId) {
        const { error } = await supabaseClient
            .from('task_groups')
            .delete()
            .eq('id', groupId);
        
        if (error) throw error;
        return true;
    },

    /**
     * Unassign tasks from group
     */
    async unassignTasksFromGroup(groupId) {
        const { error } = await supabaseClient
            .from('onboarding_tasks')
            .update({ task_group_id: null })
            .eq('task_group_id', groupId);
        
        if (error) throw error;
        return true;
    },

    // ============ User Groups ============
    
    /**
     * Fetch all user groups
     */
    async fetchAllUserGroups() {
        const { data, error } = await supabaseClient
            .from('user_groups')
            .select('*')
            .order('group_name');
        
        if (error) throw error;
        return data;
    },

    /**
     * Create user group
     */
    async createUserGroup(groupData) {
        const { data, error } = await supabaseClient
            .from('user_groups')
            .insert([groupData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Update user group
     */
    async updateUserGroup(groupId, updates) {
        const { data, error } = await supabaseClient
            .from('user_groups')
            .update(updates)
            .eq('id', groupId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Delete user group
     */
    async deleteUserGroup(groupId) {
        const { error } = await supabaseClient
            .from('user_groups')
            .delete()
            .eq('id', groupId);
        
        if (error) throw error;
        return true;
    },

    /**
     * Reassign users to another group
     */
    async reassignUsersToGroup(fromGroupId, toGroupId) {
        const { error } = await supabaseClient
            .from('users')
            .update({ user_group_id: toGroupId })
            .eq('user_group_id', fromGroupId);
        
        if (error) throw error;
        return true;
    },

    /**
     * Assign user to group
     */
    async assignUserToGroup(userId, groupId) {
        const { data, error } = await supabaseClient
            .from('users')
            .update({ user_group_id: groupId })
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Get users in group
     */
    async getUsersInGroup(groupId) {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('user_group_id', groupId);
        
        if (error) throw error;
        return data;
    }
};

export default GroupAPI;