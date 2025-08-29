-- Migration: Add deep links table for task-specific URLs
-- This enables creating custom URL paths for tasks that work across different HighLevel environments

-- Create deep_links table
CREATE TABLE IF NOT EXISTS deep_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
    custom_path VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure custom_path is URL-friendly (lowercase, alphanumeric, hyphens, slashes)
    CONSTRAINT valid_custom_path CHECK (custom_path ~ '^[a-z0-9\-/]+$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deep_links_task_id ON deep_links(task_id);
CREATE INDEX IF NOT EXISTS idx_deep_links_custom_path ON deep_links(custom_path);
CREATE INDEX IF NOT EXISTS idx_deep_links_is_active ON deep_links(is_active);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_deep_links_updated_at 
    BEFORE UPDATE ON deep_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment click count
CREATE OR REPLACE FUNCTION increment_deep_link_clicks(link_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE deep_links 
    SET click_count = click_count + 1 
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE deep_links ENABLE ROW LEVEL SECURITY;

-- Policy for reading deep links (anyone can read active links)
CREATE POLICY "Anyone can read active deep links" ON deep_links
    FOR SELECT
    USING (is_active = true);

-- Policy for admins to manage deep links
CREATE POLICY "Admins can manage deep links" ON deep_links
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create view for deep link stats with task info
CREATE OR REPLACE VIEW deep_link_stats AS
SELECT 
    dl.id,
    dl.task_id,
    dl.custom_path,
    dl.is_active,
    dl.click_count,
    dl.created_by,
    dl.created_at,
    dl.updated_at,
    ot.title as task_title,
    ot.position as task_order
FROM deep_links dl
LEFT JOIN onboarding_tasks ot ON dl.task_id = ot.id
ORDER BY dl.created_at DESC;

-- Sample data for testing (commented out, uncomment if needed)
-- INSERT INTO deep_links (task_id, custom_path, created_by) 
-- SELECT id, 'task/' || LOWER(REPLACE(title, ' ', '-')), 'admin'
-- FROM onboarding_tasks 
-- LIMIT 3;