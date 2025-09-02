-- Fix RLS policies for all tables to allow public access with anon key
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled
DO $$ 
BEGIN
    -- Disable RLS temporarily to ensure we can access tables
    ALTER TABLE IF EXISTS onboarding_tasks DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS task_groups DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS onboarding_users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS user_groups DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS task_group_sequences DISABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS webhook_settings DISABLE ROW LEVEL SECURITY;
END $$;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access" ON onboarding_tasks;
DROP POLICY IF EXISTS "Allow public write access" ON onboarding_tasks;
DROP POLICY IF EXISTS "Allow public insert" ON onboarding_tasks;
DROP POLICY IF EXISTS "Allow public update" ON onboarding_tasks;
DROP POLICY IF EXISTS "Allow public delete" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable all access for all users" ON onboarding_tasks;

DROP POLICY IF EXISTS "Allow public read access" ON task_groups;
DROP POLICY IF EXISTS "Allow public write access" ON task_groups;
DROP POLICY IF EXISTS "Allow public insert" ON task_groups;
DROP POLICY IF EXISTS "Allow public update" ON task_groups;
DROP POLICY IF EXISTS "Allow public delete" ON task_groups;
DROP POLICY IF EXISTS "Enable all access for all users" ON task_groups;

DROP POLICY IF EXISTS "Allow public read access" ON onboarding_users;
DROP POLICY IF EXISTS "Allow public write access" ON onboarding_users;
DROP POLICY IF EXISTS "Allow public insert" ON onboarding_users;
DROP POLICY IF EXISTS "Allow public update" ON onboarding_users;
DROP POLICY IF EXISTS "Allow public delete" ON onboarding_users;
DROP POLICY IF EXISTS "Enable all access for all users" ON onboarding_users;

DROP POLICY IF EXISTS "Allow public read access" ON user_groups;
DROP POLICY IF EXISTS "Allow public write access" ON user_groups;
DROP POLICY IF EXISTS "Allow public insert" ON user_groups;
DROP POLICY IF EXISTS "Allow public update" ON user_groups;
DROP POLICY IF EXISTS "Allow public delete" ON user_groups;
DROP POLICY IF EXISTS "Enable all access for all users" ON user_groups;

DROP POLICY IF EXISTS "Allow public read access" ON task_group_sequences;
DROP POLICY IF EXISTS "Allow public write access" ON task_group_sequences;
DROP POLICY IF EXISTS "Allow public insert" ON task_group_sequences;
DROP POLICY IF EXISTS "Allow public update" ON task_group_sequences;
DROP POLICY IF EXISTS "Allow public delete" ON task_group_sequences;
DROP POLICY IF EXISTS "Enable all access for all users" ON task_group_sequences;

DROP POLICY IF EXISTS "Allow public read access" ON webhook_settings;
DROP POLICY IF EXISTS "Allow public write access" ON webhook_settings;
DROP POLICY IF EXISTS "Allow public insert" ON webhook_settings;
DROP POLICY IF EXISTS "Allow public update" ON webhook_settings;
DROP POLICY IF EXISTS "Allow public delete" ON webhook_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON webhook_settings;

-- Re-enable RLS
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_group_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
-- These policies allow all operations for anyone (including anon users)

-- onboarding_tasks policies
CREATE POLICY "Enable all access for all users" ON onboarding_tasks
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- task_groups policies
CREATE POLICY "Enable all access for all users" ON task_groups
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- onboarding_users policies
CREATE POLICY "Enable all access for all users" ON onboarding_users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- user_groups policies
CREATE POLICY "Enable all access for all users" ON user_groups
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- task_group_sequences policies
CREATE POLICY "Enable all access for all users" ON task_group_sequences
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- webhook_settings policies
CREATE POLICY "Enable all access for all users" ON webhook_settings
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Verify the policies are created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'onboarding_tasks', 
    'task_groups', 
    'onboarding_users', 
    'user_groups', 
    'task_group_sequences', 
    'webhook_settings'
)
ORDER BY tablename, policyname;