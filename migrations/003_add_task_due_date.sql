-- Migration: Add due_date column to onboarding_tasks table
-- This allows setting deadlines for individually assigned tasks

-- Add due_date column to onboarding_tasks
ALTER TABLE onboarding_tasks 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add comment to clarify the column purpose
COMMENT ON COLUMN onboarding_tasks.due_date IS 'Optional due date for task completion, primarily used for individually assigned tasks to set reminders and deadlines';

-- Create index for performance when querying tasks by due date
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_due_date 
ON onboarding_tasks(due_date) 
WHERE due_date IS NOT NULL;

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'onboarding_tasks' 
AND column_name = 'due_date';