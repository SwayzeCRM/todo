-- Migration: Enforce Single Group Membership
-- This migration ensures users can belong to exactly ONE user group at a time

-- Step 1: Add single user_group_id column (if it doesn't exist)
ALTER TABLE onboarding_users 
ADD COLUMN IF NOT EXISTS user_group_id INTEGER REFERENCES user_groups(id) ON DELETE SET NULL;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_users_group 
ON onboarding_users(user_group_id);

-- Step 3: Add comment to clarify the relationship
COMMENT ON COLUMN onboarding_users.user_group_id IS 'Single user group membership - users belong to exactly one group at a time';

-- Step 4: Verify the column exists and check current data
SELECT 
    email,
    location_id,
    user_group_id
FROM onboarding_users
LIMIT 10;