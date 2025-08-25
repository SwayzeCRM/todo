/**
 * Task API
 * Data access layer for tasks
 */

import supabaseClient from './supabaseClient.js';

export const TaskAPI = {
    /**
     * Fetch all tasks
     */
    async fetchAll() {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .select('*')
            .order('position');
        
        if (error) throw error;
        return data;
    },

    /**
     * Fetch task by ID
     */
    async fetchById(taskId) {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .select('*')
            .eq('id', taskId)
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Create new task
     */
    async create(taskData) {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .insert([taskData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Update task
     */
    async update(taskId, updates) {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    /**
     * Delete task
     */
    async delete(taskId) {
        const { error } = await supabaseClient
            .from('onboarding_tasks')
            .delete()
            .eq('id', taskId);
        
        if (error) throw error;
        return true;
    },

    /**
     * Fetch tasks by group
     */
    async fetchByGroup(groupId) {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .select('*')
            .eq('task_group_id', groupId)
            .order('position');
        
        if (error) throw error;
        return data;
    },

    /**
     * Batch update tasks
     */
    async batchUpdate(taskIds, updates) {
        const { data, error } = await supabaseClient
            .from('onboarding_tasks')
            .update(updates)
            .in('id', taskIds)
            .select();
        
        if (error) throw error;
        return data;
    },

    /**
     * Update task positions
     */
    async updatePositions(positionUpdates) {
        // positionUpdates is an array of {id, position} objects
        const updates = positionUpdates.map(({ id, position }) => 
            supabaseClient
                .from('onboarding_tasks')
                .update({ position })
                .eq('id', id)
        );
        
        const results = await Promise.all(updates);
        
        // Check for any errors
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            throw new Error('Failed to update some task positions');
        }
        
        return true;
    }
};

export default TaskAPI;