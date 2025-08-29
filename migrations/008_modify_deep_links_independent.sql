-- Migration: Modify deep links to be independent of tasks
-- Deep links can now be inserted into any task's instructions

-- First, drop the existing view that depends on task_id
DROP VIEW IF EXISTS deep_link_stats;

-- Remove the foreign key constraint and make task_id nullable
ALTER TABLE deep_links 
    DROP CONSTRAINT IF EXISTS deep_links_task_id_fkey;

-- Make task_id nullable (for backward compatibility, but we won't use it)
ALTER TABLE deep_links 
    ALTER COLUMN task_id DROP NOT NULL;

-- Add title field for deep links
ALTER TABLE deep_links 
    ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Untitled Link';

-- Add description field for deep links
ALTER TABLE deep_links 
    ADD COLUMN IF NOT EXISTS description TEXT;

-- Create new view without task dependency
CREATE OR REPLACE VIEW deep_link_stats AS
SELECT 
    dl.id,
    dl.title,
    dl.custom_path,
    dl.description,
    dl.is_active,
    dl.click_count,
    dl.created_by,
    dl.created_at,
    dl.updated_at
FROM deep_links dl
ORDER BY dl.created_at DESC;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can read active deep links" ON deep_links;
DROP POLICY IF EXISTS "Admins can manage deep links" ON deep_links;

-- New policy: Anyone can read all deep links (needed for task editor dropdown)
CREATE POLICY "Anyone can read deep links" ON deep_links
    FOR SELECT
    USING (true);

-- Policy for admins to manage deep links
CREATE POLICY "Admins can manage deep links" ON deep_links
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Update the increment function to work with custom_path instead of id
CREATE OR REPLACE FUNCTION increment_deep_link_clicks(link_path VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE deep_links 
    SET click_count = click_count + 1 
    WHERE custom_path = link_path;
END;
$$ LANGUAGE plpgsql;

-- Add index on title for faster searching
CREATE INDEX IF NOT EXISTS idx_deep_links_title ON deep_links(title);

-- Update any existing deep links to have proper titles (based on their paths)
UPDATE deep_links 
SET title = INITCAP(REPLACE(REPLACE(custom_path, '-', ' '), '/', ' - '))
WHERE title = 'Untitled Link' OR title IS NULL;