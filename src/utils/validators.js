/**
 * Validators
 * Input validation and sanitization utilities
 */

/**
 * Validate task data
 */
export function validateTask(taskData, isUpdate = false) {
    const errors = [];

    // Required fields for new tasks
    if (!isUpdate) {
        if (!taskData.task_id || taskData.task_id.trim() === '') {
            errors.push('Task ID is required');
        }
        if (!taskData.title || taskData.title.trim() === '') {
            errors.push('Title is required');
        }
        if (!taskData.description || taskData.description.trim() === '') {
            errors.push('Description is required');
        }
        if (!taskData.instruction_title || taskData.instruction_title.trim() === '') {
            errors.push('Instruction title is required');
        }
    }

    // Validate task ID format (alphanumeric and underscores only)
    if (taskData.task_id && !/^[a-zA-Z0-9_]+$/.test(taskData.task_id)) {
        errors.push('Task ID can only contain letters, numbers, and underscores');
    }

    // Validate position is a number if provided
    if (taskData.position !== undefined && (isNaN(taskData.position) || taskData.position < 0)) {
        errors.push('Position must be a positive number');
    }

    // Validate target type
    const validTargetTypes = ['all', 'groups', 'locations', 'individuals'];
    if (taskData.target_type && !validTargetTypes.includes(taskData.target_type)) {
        errors.push('Invalid target type');
    }

    // Validate video URL format if provided
    if (taskData.video_url && taskData.video_url.trim() !== '') {
        try {
            new URL(taskData.video_url);
        } catch {
            errors.push('Invalid video URL format');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        error: errors.join(', ')
    };
}

/**
 * Sanitize task data
 */
export function sanitizeTaskData(taskData) {
    const sanitized = { ...taskData };

    // Trim string fields
    const stringFields = ['task_id', 'title', 'description', 'instruction_title', 'video_url'];
    stringFields.forEach(field => {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitized[field].trim();
        }
    });

    // Ensure arrays are arrays
    const arrayFields = ['target_groups', 'target_locations', 'target_users'];
    arrayFields.forEach(field => {
        if (sanitized[field] && !Array.isArray(sanitized[field])) {
            sanitized[field] = [];
        }
    });

    // Ensure booleans are booleans
    const booleanFields = ['is_active', 'notify_users'];
    booleanFields.forEach(field => {
        if (sanitized[field] !== undefined) {
            sanitized[field] = Boolean(sanitized[field]);
        }
    });

    // Convert position to number
    if (sanitized.position !== undefined) {
        sanitized.position = parseInt(sanitized.position, 10);
    }

    // Convert task_group_id to number or null
    if (sanitized.task_group_id !== undefined) {
        sanitized.task_group_id = sanitized.task_group_id ? 
            parseInt(sanitized.task_group_id, 10) : null;
    }

    // Remove empty video URL
    if (sanitized.video_url === '') {
        sanitized.video_url = null;
    }

    // Remove empty form embed code
    if (sanitized.form_embed_code === '') {
        sanitized.form_embed_code = null;
    }

    return sanitized;
}

/**
 * Validate group data
 */
export function validateGroup(groupData) {
    const errors = [];

    if (!groupData.group_name || groupData.group_name.trim() === '') {
        errors.push('Group name is required');
    }

    if (groupData.group_name && groupData.group_name.length > 255) {
        errors.push('Group name must be less than 255 characters');
    }

    if (groupData.display_order !== undefined && (isNaN(groupData.display_order) || groupData.display_order < 0)) {
        errors.push('Display order must be a positive number');
    }

    // Validate color format if provided
    if (groupData.card_color && !/^#[0-9A-Fa-f]{6}$/.test(groupData.card_color)) {
        errors.push('Card color must be a valid hex color (e.g., #FF5733)');
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        error: errors.join(', ')
    };
}

/**
 * Validate user data
 */
export function validateUser(userData) {
    const errors = [];

    if (!userData.email || userData.email.trim() === '') {
        errors.push('Email is required');
    }

    // Basic email validation
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Invalid email format');
    }

    if (!userData.full_name || userData.full_name.trim() === '') {
        errors.push('Full name is required');
    }

    // Validate phone format if provided
    if (userData.phone && !/^[\d\s\-\+\(\)]+$/.test(userData.phone)) {
        errors.push('Invalid phone number format');
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        error: errors.join(', ')
    };
}

/**
 * Validate webhook data
 */
export function validateWebhook(webhookData) {
    const errors = [];

    if (!webhookData.webhook_url || webhookData.webhook_url.trim() === '') {
        errors.push('Webhook URL is required');
    }

    // Validate URL format
    if (webhookData.webhook_url) {
        try {
            const url = new URL(webhookData.webhook_url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                errors.push('Webhook URL must use HTTP or HTTPS');
            }
        } catch {
            errors.push('Invalid webhook URL format');
        }
    }

    if (!webhookData.action_type || webhookData.action_type.trim() === '') {
        errors.push('Action type is required');
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        error: errors.join(', ')
    };
}

/**
 * Validate sequence data
 */
export function validateSequence(sequenceData) {
    const errors = [];

    if (!sequenceData.sequence_name || sequenceData.sequence_name.trim() === '') {
        errors.push('Sequence name is required');
    }

    if (!sequenceData.prerequisite_group_id) {
        errors.push('Prerequisite group is required');
    }

    if (!sequenceData.unlocked_group_id) {
        errors.push('Unlocked group is required');
    }

    // Check for self-reference
    if (sequenceData.prerequisite_group_id === sequenceData.unlocked_group_id) {
        errors.push('A group cannot unlock itself');
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        error: errors.join(', ')
    };
}

/**
 * Sanitize HTML content (for user-generated content)
 */
export function sanitizeHTML(html) {
    // Remove script tags
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove on* event handlers
    clean = clean.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
    clean = clean.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
    
    // Remove javascript: protocol
    clean = clean.replace(/javascript:/gi, '');
    
    return clean;
}

/**
 * Check if value is empty
 */
export function isEmpty(value) {
    return value === undefined || 
           value === null || 
           value === '' ||
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

export default {
    validateTask,
    sanitizeTaskData,
    validateGroup,
    validateUser,
    validateWebhook,
    validateSequence,
    sanitizeHTML,
    isEmpty,
    isValidUUID
};