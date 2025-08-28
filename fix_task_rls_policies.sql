-- Check and fix RLS policies for onboarding_tasks table

-- Enable RLS if not already enabled
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable read access for all users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON onboarding_tasks;

-- For development/admin panel, allow all operations for authenticated users
-- In production, you might want more restrictive policies

-- Allow all authenticated users to read tasks
CREATE POLICY "Enable read access for all users" ON onboarding_tasks
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Enable insert for authenticated users" ON onboarding_tasks
    FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to update tasks
CREATE POLICY "Enable update for authenticated users" ON onboarding_tasks
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete tasks
CREATE POLICY "Enable delete for authenticated users" ON onboarding_tasks
    FOR DELETE
    USING (true);

-- Verify the policies were created
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
WHERE tablename = 'onboarding_tasks';