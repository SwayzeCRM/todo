-- Migration: Make user groups required for all tasks and task groups
-- This removes the "all users" option and makes user groups mandatory

-- Update existing tasks that have 'all' target_type to require user groups
UPDATE onboarding_tasks 
SET target_type = 'groups',
    target_groups = '[]'::jsonb
WHERE target_type = 'all' OR target_type IS NULL;

-- Update existing task groups to have empty user_groups if null
UPDATE task_groups 
SET user_groups = '[]'::jsonb
WHERE user_groups IS NULL;

-- Make target_type NOT NULL with default 'groups'
ALTER TABLE onboarding_tasks 
    ALTER COLUMN target_type SET DEFAULT 'groups',
    ALTER COLUMN target_type SET NOT NULL;

-- Add constraint to ensure target_type is only 'groups', 'locations', or 'individuals'
ALTER TABLE onboarding_tasks 
    DROP CONSTRAINT IF EXISTS valid_target_type;

ALTER TABLE onboarding_tasks 
    ADD CONSTRAINT valid_target_type 
    CHECK (target_type IN ('groups', 'locations', 'individuals'));

-- Add constraint to ensure at least one targeting method has values
ALTER TABLE onboarding_tasks
    DROP CONSTRAINT IF EXISTS requires_target;

ALTER TABLE onboarding_tasks
    ADD CONSTRAINT requires_target
    CHECK (
        (target_type = 'groups' AND target_groups IS NOT NULL AND target_groups != '[]'::jsonb) OR
        (target_type = 'locations' AND target_locations IS NOT NULL AND target_locations != '[]'::jsonb) OR
        (target_type = 'individuals' AND target_users IS NOT NULL AND target_users != '[]'::jsonb)
    );

-- Make user_groups required for task_groups
ALTER TABLE task_groups
    ALTER COLUMN user_groups SET DEFAULT '[]'::jsonb,
    ALTER COLUMN user_groups SET NOT NULL;

-- Add constraint to ensure task_groups have at least one user group
ALTER TABLE task_groups
    DROP CONSTRAINT IF EXISTS requires_user_group;

ALTER TABLE task_groups
    ADD CONSTRAINT requires_user_group
    CHECK (user_groups IS NOT NULL AND user_groups != '[]'::jsonb);

-- Create function to validate user group exists
CREATE OR REPLACE FUNCTION validate_user_group_exists(group_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Since we don't have a user_groups table, we'll just return true
    -- In production, you'd check against your actual user groups data
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the requirement
COMMENT ON COLUMN onboarding_tasks.target_groups IS 'Required: Array of user group IDs this task is assigned to';
COMMENT ON COLUMN task_groups.user_groups IS 'Required: Array of user group IDs that can see this task group';