-- Migration: Add completed_tasks column to onboarding_users table
-- This fixes the error when trying to save user progress

-- Add completed_tasks column if it doesn't exist
ALTER TABLE onboarding_users 
ADD COLUMN IF NOT EXISTS completed_tasks JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_users_completed_tasks 
ON onboarding_users USING GIN (completed_tasks);

-- Add comment explaining the column
COMMENT ON COLUMN onboarding_users.completed_tasks IS 'Array of completed task IDs for this user';

-- Migrate existing checklist data to completed_tasks if needed
UPDATE onboarding_users 
SET completed_tasks = (
    SELECT COALESCE(
        jsonb_agg(
            CASE 
                WHEN jsonb_typeof(task) = 'object' AND (task->>'completed')::boolean = true 
                THEN task->>'id' 
                ELSE NULL 
            END
        ) FILTER (WHERE task->>'id' IS NOT NULL AND (task->>'completed')::boolean = true),
        '[]'::jsonb
    )
    FROM jsonb_array_elements(checklist) AS task
)
WHERE completed_tasks IS NULL OR completed_tasks = '[]'::jsonb;