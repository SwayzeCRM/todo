-- Complete Database Setup for Onboarding Application
-- Run this SQL in your Supabase SQL Editor to set up all required tables and policies

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

-- Task Groups Table
CREATE TABLE IF NOT EXISTS task_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Tasks Table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
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

-- Onboarding Users Table
CREATE TABLE IF NOT EXISTS onboarding_users (
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
CREATE TABLE IF NOT EXISTS task_sequences (
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
-- 4. CREATE RLS POLICIES
-- ============================================

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

-- Insert default user groups
INSERT INTO user_groups (group_name, description) VALUES 
    ('Default', 'Default user group for all users'),
    ('Premium', 'Premium users with additional features'),
    ('Beta Testers', 'Users testing new features')
ON CONFLICT (group_name) DO NOTHING;

-- Insert default task groups
INSERT INTO task_groups (group_name, description, display_order) VALUES 
    ('Getting Started', 'Initial setup tasks', 1),
    ('Profile Setup', 'Complete your profile', 2),
    ('Advanced Features', 'Learn advanced features', 3)
ON CONFLICT DO NOTHING;

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

-- ============================================
-- IMPORTANT NOTES:
-- ============================================
-- 1. Run this entire script in your Supabase SQL Editor
-- 2. After running, create the storage bucket 'task-videos' manually in the Storage section
-- 3. Configure storage bucket policies as described in STORAGE_BUCKET_SETUP.md
-- 4. Update the Supabase URL and anon key in your HTML files if needed
-- 5. Test the connection by loading one of the HTML pages