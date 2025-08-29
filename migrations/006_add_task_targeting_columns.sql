-- Migration: Add task targeting columns for individual and group assignments
-- This adds the necessary columns for targeting tasks to specific users, groups, or locations

-- Add targeting columns to onboarding_tasks if they don't exist
DO $$ 
BEGIN
    -- Add target_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'target_type') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN target_type VARCHAR(50) DEFAULT 'all';
        COMMENT ON COLUMN onboarding_tasks.target_type IS 'Type of targeting: all, groups, locations, or individuals';
    END IF;
    
    -- Add target_groups column (JSONB array of group IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'target_groups') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN target_groups JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN onboarding_tasks.target_groups IS 'Array of user group IDs this task is assigned to';
    END IF;
    
    -- Add target_locations column (JSONB array of location IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'target_locations') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN target_locations JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN onboarding_tasks.target_locations IS 'Array of location IDs this task is assigned to';
    END IF;
    
    -- Add target_users column (JSONB array of user IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'target_users') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN target_users JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN onboarding_tasks.target_users IS 'Array of individual user IDs this task is assigned to';
    END IF;
    
    -- Add notify_users column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'notify_users') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN notify_users BOOLEAN DEFAULT false;
        COMMENT ON COLUMN onboarding_tasks.notify_users IS 'Whether to send notifications when task is assigned';
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'priority') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
        COMMENT ON COLUMN onboarding_tasks.priority IS 'Task priority: urgent, high, normal, or low';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_target_type 
ON onboarding_tasks(target_type);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_target_groups 
ON onboarding_tasks USING GIN (target_groups);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_target_users 
ON onboarding_tasks USING GIN (target_users);

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'onboarding_tasks' 
AND column_name IN ('target_type', 'target_groups', 'target_locations', 'target_users', 'notify_users', 'priority')
ORDER BY column_name;