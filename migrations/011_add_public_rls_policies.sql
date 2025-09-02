-- Enable public read access for onboarding tables
-- This allows the anon key to read data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON onboarding_tasks;
DROP POLICY IF EXISTS "Allow public read access" ON task_groups;
DROP POLICY IF EXISTS "Allow public read access" ON onboarding_users;
DROP POLICY IF EXISTS "Allow public read access" ON webhook_settings;

-- Create new policies for public read access
CREATE POLICY "Allow public read access" ON onboarding_tasks
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access" ON task_groups
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access" ON onboarding_users
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access" ON webhook_settings
    FOR SELECT
    USING (true);

-- For write operations, you may want to add more restrictive policies later
-- For now, allow all operations for testing
CREATE POLICY "Allow public insert" ON onboarding_tasks
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update" ON onboarding_tasks
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete" ON onboarding_tasks
    FOR DELETE
    USING (true);

CREATE POLICY "Allow public insert" ON task_groups
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update" ON task_groups
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete" ON task_groups
    FOR DELETE
    USING (true);

CREATE POLICY "Allow public insert" ON onboarding_users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update" ON onboarding_users
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete" ON onboarding_users
    FOR DELETE
    USING (true);

CREATE POLICY "Allow public insert" ON webhook_settings
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update" ON webhook_settings
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete" ON webhook_settings
    FOR DELETE
    USING (true);