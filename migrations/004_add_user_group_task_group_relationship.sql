-- Migration: Add relationship between user groups and task groups
-- This allows task groups to be assigned to specific user groups

-- Add user_group_id column to task_groups table
ALTER TABLE task_groups 
ADD COLUMN IF NOT EXISTS user_group_id INTEGER REFERENCES user_groups(id) ON DELETE SET NULL;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN task_groups.user_group_id IS 'The user group this task group belongs to. NULL means it applies to all groups.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_task_groups_user_group_id 
ON task_groups(user_group_id);

-- Update existing task groups to be available to all groups (NULL user_group_id)
-- This maintains backward compatibility
UPDATE task_groups 
SET user_group_id = NULL 
WHERE user_group_id IS NULL;

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'task_groups' 
AND column_name = 'user_group_id';