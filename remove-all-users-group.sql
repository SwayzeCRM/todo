-- Remove "All users" and "Default Group" from the database
-- Run this in Supabase SQL Editor

-- First, check what groups exist
SELECT id, group_name, group_description 
FROM user_groups 
WHERE LOWER(group_name) IN ('all users', 'default group');

-- Remove any task assignments to these groups
UPDATE onboarding_tasks 
SET target_groups = array_remove(target_groups, (
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'all users'
))
WHERE target_groups @> ARRAY[(
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'all users'
)];

UPDATE onboarding_tasks 
SET target_groups = array_remove(target_groups, (
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'default group'
))
WHERE target_groups @> ARRAY[(
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'default group'
)];

-- Remove any users assigned to these groups
UPDATE onboarding_users 
SET user_group_id = NULL 
WHERE user_group_id IN (
    SELECT id FROM user_groups 
    WHERE LOWER(group_name) IN ('all users', 'default group')
);

-- Remove any user_groups array references
UPDATE onboarding_users 
SET user_groups = array_remove(user_groups, (
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'all users'
))
WHERE user_groups IS NOT NULL;

UPDATE onboarding_users 
SET user_groups = array_remove(user_groups, (
    SELECT id FROM user_groups WHERE LOWER(group_name) = 'default group'
))
WHERE user_groups IS NOT NULL;

-- Remove any task groups that belong to these user groups
UPDATE task_groups 
SET user_group_id = NULL 
WHERE user_group_id IN (
    SELECT id FROM user_groups 
    WHERE LOWER(group_name) IN ('all users', 'default group')
);

-- Remove any sequences that apply to these groups
DELETE FROM task_group_sequences 
WHERE applies_to_user_group IN (
    SELECT id FROM user_groups 
    WHERE LOWER(group_name) IN ('all users', 'default group')
);

-- Finally, delete the groups themselves
DELETE FROM user_groups 
WHERE LOWER(group_name) IN ('all users', 'default group');

-- Verify deletion
SELECT COUNT(*) as remaining_default_groups 
FROM user_groups 
WHERE LOWER(group_name) IN ('all users', 'default group');