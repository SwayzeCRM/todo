-- Migration: Enforce Single Group Membership
-- This migration updates the onboarding_users table to enforce the rule that
-- users can belong to exactly ONE user group at a time

-- Step 1: Add new user_group_id column (foreign key to user_groups)
ALTER TABLE onboarding_users 
ADD COLUMN IF NOT EXISTS user_group_id INTEGER REFERENCES user_groups(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data (take first group if multiple exist)
UPDATE onboarding_users 
SET user_group_id = (
    SELECT (user_groups::jsonb -> 0)::text::integer 
    FROM onboarding_users AS ou 
    WHERE ou.id = onboarding_users.id 
    AND jsonb_array_length(user_groups::jsonb) > 0
)
WHERE user_groups IS NOT NULL 
AND jsonb_array_length(user_groups::jsonb) > 0;

-- Step 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_users_group 
ON onboarding_users(user_group_id);

-- Step 4: Drop the old JSONB column (after confirming migration success)
-- IMPORTANT: Only run this after verifying data migration
-- ALTER TABLE onboarding_users DROP COLUMN user_groups;

-- Step 5: Add comment to clarify the relationship
COMMENT ON COLUMN onboarding_users.user_group_id IS 'Single user group membership - users belong to exactly one group at a time';

-- Step 6: Update any views or functions that reference user_groups
-- Note: Review application code to use user_group_id instead of user_groups array