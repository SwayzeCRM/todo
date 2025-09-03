-- Fixed Database Setup for Onboarding Application
-- This version handles existing tables with different column types

-- ============================================
-- 0. DROP EXISTING CONSTRAINTS AND TABLES (if needed)
-- ============================================

-- Drop foreign key constraints first
ALTER TABLE IF EXISTS task_sequences DROP CONSTRAINT IF EXISTS task_sequences_prerequisite_group_id_fkey;
ALTER TABLE IF EXISTS task_sequences DROP CONSTRAINT IF EXISTS task_sequences_unlocked_group_id_fkey;
ALTER TABLE IF EXISTS onboarding_tasks DROP CONSTRAINT IF EXISTS onboarding_tasks_task_group_id_fkey;
ALTER TABLE IF EXISTS onboarding_users DROP CONSTRAINT IF EXISTS onboarding_users_user_group_id_fkey;

-- Drop and recreate task_groups table with UUID
DROP TABLE IF EXISTS task_sequences CASCADE;
DROP TABLE IF EXISTS task_groups CASCADE;

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- User Groups Table
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Groups Table (recreated with UUID)
CREATE TABLE task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate onboarding_tasks to ensure compatibility
DROP TABLE IF EXISTS onboarding_tasks CASCADE;

-- Onboarding Tasks Table
CREATE TABLE onboarding_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    video_type VARCHAR(20) DEFAULT 'url' CHECK (video_type IN ('url', 'upload')),
    video_storage_path TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    task_group_id UUID REFERENCES task_groups(id) ON DELETE SET NULL,
    target_user_groups UUID[] DEFAULT '{}',
    target_individual_users TEXT[] DEFAULT '{}',
    due_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate onboarding_users to ensure compatibility
DROP TABLE IF EXISTS onboarding_users CASCADE;

-- Onboarding Users Table
CREATE TABLE onboarding_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    location_id TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    completed_tasks INTEGER DEFAULT 0,
    profile_completed BOOLEAN DEFAULT false,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    user_group_id UUID REFERENCES user_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Sequences Table
CREATE TABLE task_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prerequisite_group_id UUID REFERENCES task_groups(id) ON DELETE CASCADE,
    unlocked_group_id UUID REFERENCES task_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prerequisite_group_id, unlocked_group_id)
);

-- User Webhooks Table
CREATE TABLE IF NOT EXISTS user_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_name TEXT NOT NULL,
    webhook_display_name TEXT,
    webhook_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_position ON onboarding_tasks(position);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_is_active ON onboarding_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_task_group_id ON onboarding_tasks(task_group_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_video_type ON onboarding_tasks(video_type) WHERE video_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_onboarding_users_email ON onboarding_users(email);
CREATE INDEX IF NOT EXISTS idx_onboarding_users_location_id ON onboarding_users(location_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_users_user_group_id ON onboarding_users(user_group_id);

CREATE INDEX IF NOT EXISTS idx_task_groups_display_order ON task_groups(display_order);
CREATE INDEX IF NOT EXISTS idx_task_groups_is_active ON task_groups(is_active);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES (Drop existing first)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_groups;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_groups;
DROP POLICY IF EXISTS "Enable update for all users" ON user_groups;
DROP POLICY IF EXISTS "Enable delete for all users" ON user_groups;

DROP POLICY IF EXISTS "Enable read access for all users" ON task_groups;
DROP POLICY IF EXISTS "Enable insert for all users" ON task_groups;
DROP POLICY IF EXISTS "Enable update for all users" ON task_groups;
DROP POLICY IF EXISTS "Enable delete for all users" ON task_groups;

DROP POLICY IF EXISTS "Enable read access for all users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON onboarding_tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON onboarding_tasks;

DROP POLICY IF EXISTS "Enable read access for all users" ON onboarding_users;
DROP POLICY IF EXISTS "Enable insert for all users" ON onboarding_users;
DROP POLICY IF EXISTS "Enable update for all users" ON onboarding_users;
DROP POLICY IF EXISTS "Enable delete for all users" ON onboarding_users;

DROP POLICY IF EXISTS "Enable read access for all users" ON task_sequences;
DROP POLICY IF EXISTS "Enable insert for all users" ON task_sequences;
DROP POLICY IF EXISTS "Enable update for all users" ON task_sequences;
DROP POLICY IF EXISTS "Enable delete for all users" ON task_sequences;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_webhooks;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_webhooks;
DROP POLICY IF EXISTS "Enable update for all users" ON user_webhooks;
DROP POLICY IF EXISTS "Enable delete for all users" ON user_webhooks;

-- User Groups Policies
CREATE POLICY "Enable read access for all users" ON user_groups
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON user_groups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON user_groups
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON user_groups
    FOR DELETE USING (true);

-- Task Groups Policies
CREATE POLICY "Enable read access for all users" ON task_groups
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON task_groups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON task_groups
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON task_groups
    FOR DELETE USING (true);

-- Onboarding Tasks Policies
CREATE POLICY "Enable read access for all users" ON onboarding_tasks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON onboarding_tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON onboarding_tasks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON onboarding_tasks
    FOR DELETE USING (true);

-- Onboarding Users Policies
CREATE POLICY "Enable read access for all users" ON onboarding_users
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON onboarding_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON onboarding_users
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON onboarding_users
    FOR DELETE USING (true);

-- Task Sequences Policies
CREATE POLICY "Enable read access for all users" ON task_sequences
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON task_sequences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON task_sequences
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON task_sequences
    FOR DELETE USING (true);

-- User Webhooks Policies
CREATE POLICY "Enable read access for all users" ON user_webhooks
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON user_webhooks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON user_webhooks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON user_webhooks
    FOR DELETE USING (true);

-- ============================================
-- 5. CREATE FUNCTIONS FOR TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_onboarding_tasks_updated_at ON onboarding_tasks;
DROP TRIGGER IF EXISTS update_onboarding_users_updated_at ON onboarding_users;

-- Trigger for onboarding_tasks
CREATE TRIGGER update_onboarding_tasks_updated_at
    BEFORE UPDATE ON onboarding_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for onboarding_users
CREATE TRIGGER update_onboarding_users_updated_at
    BEFORE UPDATE ON onboarding_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. INSERT DEFAULT DATA (Optional)
-- ============================================

-- Insert sample user groups (optional - remove if not needed)
-- INSERT INTO user_groups (group_name, description) VALUES 
--     ('Premium', 'Premium users with additional features'),
--     ('Beta Testers', 'Users testing new features')
-- ON CONFLICT (group_name) DO NOTHING;

-- Insert default task groups
INSERT INTO task_groups (group_name, description, display_order) VALUES 
    ('Getting Started', 'Initial setup tasks', 1),
    ('Profile Setup', 'Complete your profile', 2),
    ('Advanced Features', 'Learn advanced features', 3);

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant usage on all schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Grant all privileges on all sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 9. VERIFY SETUP
-- ============================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_groups', 
    'task_groups', 
    'onboarding_tasks', 
    'onboarding_users', 
    'task_sequences', 
    'user_webhooks'
);

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_groups', 
    'task_groups', 
    'onboarding_tasks', 
    'onboarding_users', 
    'task_sequences', 
    'user_webhooks'
);

-- Check column types to ensure they're all UUID
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('task_groups', 'user_groups', 'onboarding_tasks', 'onboarding_users')
AND column_name = 'id';

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. This script DROPS and RECREATES tables to fix type conflicts
-- 2. Any existing data in these tables will be LOST
-- 3. After running, create the storage bucket 'task-videos' in Storage section
-- 4. Configure storage bucket policies as described in STORAGE_BUCKET_SETUP.md
-- 5. Test the connection by loading one of the HTML pages