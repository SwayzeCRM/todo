-- Migration: Add display_name column to webhook_settings table
-- This allows users to provide custom names for their webhooks

-- Add display_name column to webhook_settings
ALTER TABLE webhook_settings 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

-- Add comment to clarify the column purpose
COMMENT ON COLUMN webhook_settings.display_name IS 'User-friendly name for the webhook, displayed in the admin interface';

-- Update existing webhooks to have a display name based on their webhook_name
UPDATE webhook_settings 
SET display_name = 
    CASE 
        WHEN webhook_name = 'task_completed' THEN 'Task Completed Webhook'
        WHEN webhook_name = 'task_completed_in_group' THEN 'Task Group Completion'
        WHEN webhook_name = 'all_tasks_completed_in_group' THEN 'All Tasks in Group Complete'
        WHEN webhook_name = 'user_profile_completed' THEN 'Profile Setup Complete'
        WHEN webhook_name = 'user_registered' THEN 'New User Registration'
        WHEN webhook_name = 'task_assigned' THEN 'Task Assignment'
        WHEN webhook_name = 'task_started' THEN 'Task Started'
        WHEN webhook_name = 'user_added_to_group' THEN 'User Added to Group'
        WHEN webhook_name = 'user_removed_from_group' THEN 'User Removed from Group'
        WHEN webhook_name = 'flow_rule_triggered' THEN 'Flow Rule Triggered'
        WHEN webhook_name = 'task_group_unlocked' THEN 'Task Group Unlocked'
        ELSE webhook_name
    END
WHERE display_name IS NULL;