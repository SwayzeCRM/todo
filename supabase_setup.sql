-- Supabase table setup for DFY CRM Onboarding System
-- Run this in your Supabase SQL Editor

-- Create or update the onboarding_tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instruction_title VARCHAR(255) NOT NULL,
    instruction_content TEXT,
    video_url TEXT,
    form_embed_code TEXT,
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    target_type VARCHAR(50) DEFAULT 'all', -- 'all', 'groups', 'locations', 'individuals'
    target_groups JSONB DEFAULT '[]'::jsonb, -- array of group IDs
    target_locations JSONB DEFAULT '[]'::jsonb, -- array of location IDs
    target_users JSONB DEFAULT '[]'::jsonb, -- array of user IDs for individual targeting
    notify_users BOOLEAN DEFAULT false, -- send notification when task is created/assigned
    due_date DATE DEFAULT NULL, -- optional due date for individual tasks
    priority VARCHAR(20) DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to existing tables
DO $$ 
BEGIN
    -- Add form_embed_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'form_embed_code') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN form_embed_code TEXT;
    END IF;
    
    -- Add targeting columns to onboarding_tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'target_type') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN target_type VARCHAR(50) DEFAULT 'all';
        ALTER TABLE onboarding_tasks ADD COLUMN target_groups JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE onboarding_tasks ADD COLUMN target_locations JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE onboarding_tasks ADD COLUMN target_users JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE onboarding_tasks ADD COLUMN notify_users BOOLEAN DEFAULT false;
    END IF;
    
    -- Add user_groups column to onboarding_users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_users' 
                   AND column_name = 'user_groups') 
    THEN
        ALTER TABLE onboarding_users ADD COLUMN user_groups JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add checklist column to onboarding_users if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_users' 
                   AND column_name = 'checklist') 
    THEN
        ALTER TABLE onboarding_users ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add profile columns to onboarding_users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_users' 
                   AND column_name = 'first_name') 
    THEN
        ALTER TABLE onboarding_users ADD COLUMN first_name VARCHAR(255);
        ALTER TABLE onboarding_users ADD COLUMN last_name VARCHAR(255);
        ALTER TABLE onboarding_users ADD COLUMN cell_phone VARCHAR(20);
        ALTER TABLE onboarding_users ADD COLUMN company_name VARCHAR(255);
        ALTER TABLE onboarding_users ADD COLUMN profile_completed BOOLEAN DEFAULT false;
        ALTER TABLE onboarding_users ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Add rules column to webhook_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'webhook_settings' 
                   AND column_name = 'rules') 
    THEN
        ALTER TABLE webhook_settings ADD COLUMN rules JSONB DEFAULT '{"type": "all"}'::jsonb;
    END IF;
    
    -- Add task_group_id column to onboarding_tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'task_group_id') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN task_group_id INTEGER REFERENCES task_groups(id);
    END IF;
    
    -- Add metadata column to webhook_settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'webhook_settings' 
                   AND column_name = 'metadata') 
    THEN
        ALTER TABLE webhook_settings ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add action_type and trigger_conditions columns to webhook_settings if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'webhook_settings' 
                   AND column_name = 'action_type') 
    THEN
        ALTER TABLE webhook_settings ADD COLUMN action_type VARCHAR(100) NOT NULL DEFAULT 'task_completion';
        ALTER TABLE webhook_settings ADD COLUMN trigger_conditions JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add due_date and priority columns to onboarding_tasks if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'onboarding_tasks' 
                   AND column_name = 'due_date') 
    THEN
        ALTER TABLE onboarding_tasks ADD COLUMN due_date DATE DEFAULT NULL;
        ALTER TABLE onboarding_tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
    END IF;
    
    -- Add color columns for card styling
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'task_groups' 
                   AND column_name = 'card_color') 
    THEN
        ALTER TABLE task_groups ADD COLUMN card_color VARCHAR(7) DEFAULT '#f8fafc';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_groups' 
                   AND column_name = 'card_color') 
    THEN
        ALTER TABLE user_groups ADD COLUMN card_color VARCHAR(7) DEFAULT '#f1f5f9';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'task_group_sequences' 
                   AND column_name = 'card_color') 
    THEN
        ALTER TABLE task_group_sequences ADD COLUMN card_color VARCHAR(7) DEFAULT '#fef7f0';
    END IF;
    
    -- Remove UNIQUE constraint from webhook_name if it exists
    DO $drop_constraint$
    BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'webhook_settings_webhook_name_key' 
                   AND table_name = 'webhook_settings') THEN
            ALTER TABLE webhook_settings DROP CONSTRAINT webhook_settings_webhook_name_key;
        END IF;
    END $drop_constraint$;
END $$;

-- Create user groups table
CREATE TABLE IF NOT EXISTS user_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) UNIQUE NOT NULL,
    group_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create or update the onboarding_users table
CREATE TABLE IF NOT EXISTS onboarding_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    location_id VARCHAR(255) NOT NULL,
    user_groups JSONB DEFAULT '[]'::jsonb, -- array of group IDs user belongs to
    completed_tasks JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, location_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_position ON onboarding_tasks(position);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_active ON onboarding_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_task_id ON onboarding_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_users_email_location ON onboarding_users(email, location_id);

-- Enable Row Level Security
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_rules ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for now (you can restrict this later)
DROP POLICY IF EXISTS "Enable all operations for onboarding_tasks" ON onboarding_tasks;
CREATE POLICY "Enable all operations for onboarding_tasks" ON onboarding_tasks
FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for onboarding_users" ON onboarding_users;
CREATE POLICY "Enable all operations for onboarding_users" ON onboarding_users
FOR ALL USING (true) WITH CHECK (true);

-- Create policies for task groups
DROP POLICY IF EXISTS "Enable all operations for task_groups" ON task_groups;
CREATE POLICY "Enable all operations for task_groups" ON task_groups
FOR ALL USING (true) WITH CHECK (true);

-- Create policies for flow rules
DROP POLICY IF EXISTS "Enable all operations for flow_rules" ON flow_rules;
CREATE POLICY "Enable all operations for flow_rules" ON flow_rules
FOR ALL USING (true) WITH CHECK (true);

-- Insert sample groups if table is empty
-- Insert default "All Users" group first
INSERT INTO user_groups (group_name, group_description)
SELECT 'All Users', 'Default group for all users'
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE group_name = 'All Users');

INSERT INTO user_groups (group_name, group_description)
SELECT 'New Users', 'Users who just signed up within the last 30 days'
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE group_name = 'New Users');

INSERT INTO user_groups (group_name, group_description)
SELECT 'Premium Members', 'Users with premium subscription'
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE group_name = 'Premium Members');

INSERT INTO user_groups (group_name, group_description)
SELECT 'Beta Testers', 'Users participating in beta testing'
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE group_name = 'Beta Testers');

INSERT INTO user_groups (group_name, group_description)
SELECT 'Advanced Users', 'Users with advanced features enabled'
WHERE NOT EXISTS (SELECT 1 FROM user_groups WHERE group_name = 'Advanced Users');

-- Create task groups table for workflow management
CREATE TABLE IF NOT EXISTS task_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) UNIQUE NOT NULL,
    group_description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flow rules table for conditional task assignment
CREATE TABLE IF NOT EXISTS flow_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_description TEXT,
    condition_type VARCHAR(50) NOT NULL, -- 'all_tasks_complete', 'any_task_complete', 'task_group_complete'
    condition_task_group_id INTEGER REFERENCES task_groups(id),
    action_type VARCHAR(50) NOT NULL, -- 'show_task_group', 'hide_task_group', 'trigger_webhook'
    action_target INTEGER, -- task_group_id for show/hide actions, webhook_id for webhook actions
    applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'groups', 'locations', 'individuals'
    target_groups JSONB DEFAULT '[]'::jsonb,
    target_locations JSONB DEFAULT '[]'::jsonb, 
    target_users JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update existing welcome task to assign to Onboarding Tasks group
DO $$
DECLARE
    onboarding_group_id INTEGER;
BEGIN
    -- Get the ID of the Onboarding Tasks group
    SELECT id INTO onboarding_group_id FROM task_groups WHERE group_name = 'Onboarding Tasks';
    
    IF onboarding_group_id IS NOT NULL THEN
        -- Insert sample task if table is empty, assign to Onboarding Tasks group
        INSERT INTO onboarding_tasks (task_id, title, description, instruction_title, instruction_content, position, target_type, task_group_id)
        SELECT 
            'welcome-task',
            'Welcome to DFY CRM',
            'Get started with your onboarding',
            'Welcome Instructions',
            '<p>Welcome to the DFY CRM onboarding system!</p><p>This is your first task to get you started.</p>',
            1,
            'all',
            onboarding_group_id
        WHERE NOT EXISTS (SELECT 1 FROM onboarding_tasks WHERE task_id = 'welcome-task');
        
        -- Update existing welcome task to assign to group if it doesn't have one
        UPDATE onboarding_tasks 
        SET task_group_id = onboarding_group_id 
        WHERE task_id = 'welcome-task' AND task_group_id IS NULL;
    END IF;
END $$;

-- Create webhook settings table
CREATE TABLE IF NOT EXISTS webhook_settings (
    id SERIAL PRIMARY KEY,
    webhook_name VARCHAR(255) NOT NULL, -- Removed UNIQUE constraint to allow multiple webhooks for same action with different task groups
    webhook_url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    rules JSONB DEFAULT '{"type": "all"}'::jsonb, -- Rules for when webhook should fire
    metadata JSONB DEFAULT '{}'::jsonb, -- Store additional data like task_group_id
    action_type VARCHAR(100) NOT NULL DEFAULT 'task_completion', -- New comprehensive action types
    -- Action types: 'profile_completed', 'task_completed', 'task_group_completed', 
    -- 'any_task_completed', 'user_graduated', 'task_assigned', 'task_assigned_with_due_date'
    trigger_conditions JSONB DEFAULT '{}'::jsonb, -- Specific conditions for triggering
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for webhook_settings
ALTER TABLE webhook_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for webhook_settings
DROP POLICY IF EXISTS "Enable all operations for webhook_settings" ON webhook_settings;
CREATE POLICY "Enable all operations for webhook_settings" ON webhook_settings
FOR ALL USING (true) WITH CHECK (true);

-- Insert default webhook configurations
INSERT INTO webhook_settings (webhook_name, webhook_url, description)
SELECT 
    'task_completion',
    'https://services.leadconnectorhq.com/hooks/ixXuPBVV5upaLTTxkNdV/webhook-trigger/0c5c5cc1-486e-4490-bdf4-116a7d46d344',
    'Webhook triggered when a user completes a task'
WHERE NOT EXISTS (SELECT 1 FROM webhook_settings WHERE webhook_name = 'task_completion');

INSERT INTO webhook_settings (webhook_name, webhook_url, description)
SELECT 
    'user_notification',
    'https://services.leadconnectorhq.com/hooks/ixXuPBVV5upaLTTxkNdV/webhook-trigger/f7e8d9c0-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    'Webhook triggered to notify users of new task assignments'
WHERE NOT EXISTS (SELECT 1 FROM webhook_settings WHERE webhook_name = 'user_notification');

-- Insert sample task groups
INSERT INTO task_groups (group_name, group_description, display_order)
SELECT 'Onboarding Tasks', 'Initial setup and welcome tasks for new users', 1
WHERE NOT EXISTS (SELECT 1 FROM task_groups WHERE group_name = 'Onboarding Tasks');

INSERT INTO task_groups (group_name, group_description, display_order)
SELECT 'Advanced Onboarding', 'Advanced features and configurations for users who completed basic onboarding', 2
WHERE NOT EXISTS (SELECT 1 FROM task_groups WHERE group_name = 'Advanced Onboarding');

INSERT INTO task_groups (group_name, group_description, display_order)
SELECT 'Training Modules', 'Educational content and training materials', 3
WHERE NOT EXISTS (SELECT 1 FROM task_groups WHERE group_name = 'Training Modules');

INSERT INTO task_groups (group_name, group_description, display_order)
SELECT 'Premium Features', 'Premium member exclusive tasks and features', 4
WHERE NOT EXISTS (SELECT 1 FROM task_groups WHERE group_name = 'Premium Features');

-- Create user graduation rules table
CREATE TABLE IF NOT EXISTS user_graduation_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    from_group_id INTEGER REFERENCES user_groups(id) ON DELETE CASCADE,
    to_group_id INTEGER REFERENCES user_groups(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- 'complete_sequence', 'complete_task_group', 'complete_specific_tasks'
    condition_data JSONB DEFAULT '{}'::jsonb, -- stores task_group_ids or task_ids based on condition_type
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_group_id, to_group_id)
);

-- Create task group sequences table for conditional task group display
CREATE TABLE IF NOT EXISTS task_group_sequences (
    id SERIAL PRIMARY KEY,
    sequence_name VARCHAR(255) NOT NULL,
    description TEXT,
    prerequisite_group_id INTEGER REFERENCES task_groups(id) ON DELETE CASCADE,
    unlock_group_id INTEGER REFERENCES task_groups(id) ON DELETE CASCADE,
    applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'groups', 'locations', 'individuals'
    target_groups JSONB DEFAULT '[]'::jsonb,
    target_locations JSONB DEFAULT '[]'::jsonb, 
    target_users JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prerequisite_group_id, unlock_group_id, applies_to)
);

-- Enable Row Level Security for task group sequences
ALTER TABLE task_group_sequences ENABLE ROW LEVEL SECURITY;

-- Create policies for task group sequences
DROP POLICY IF EXISTS "Enable all operations for task_group_sequences" ON task_group_sequences;
CREATE POLICY "Enable all operations for task_group_sequences" ON task_group_sequences
FOR ALL USING (true) WITH CHECK (true);

-- Insert sample sequence: Complete Onboarding Tasks → Unlock Advanced Onboarding
DO $$
DECLARE
    onboarding_group_id INTEGER;
    advanced_group_id INTEGER;
BEGIN
    SELECT id INTO onboarding_group_id FROM task_groups WHERE group_name = 'Onboarding Tasks';
    SELECT id INTO advanced_group_id FROM task_groups WHERE group_name = 'Advanced Onboarding';
    
    IF onboarding_group_id IS NOT NULL AND advanced_group_id IS NOT NULL THEN
        INSERT INTO task_group_sequences (sequence_name, description, prerequisite_group_id, unlock_group_id)
        SELECT 
            'Basic to Advanced Onboarding',
            'Complete all Onboarding Tasks to unlock Advanced Onboarding',
            onboarding_group_id,
            advanced_group_id
        WHERE NOT EXISTS (
            SELECT 1 FROM task_group_sequences 
            WHERE prerequisite_group_id = onboarding_group_id 
            AND unlock_group_id = advanced_group_id
        );
    END IF;
END $$;