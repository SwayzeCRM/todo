-- Migration: Add video storage support for tasks
-- This allows tasks to have either video URLs or uploaded video files

-- Add columns to track video type and storage path
ALTER TABLE onboarding_tasks 
ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'url' CHECK (video_type IN ('url', 'upload'));

ALTER TABLE onboarding_tasks 
ADD COLUMN IF NOT EXISTS video_storage_path TEXT;

-- Add comment to clarify the columns
COMMENT ON COLUMN onboarding_tasks.video_type IS 'Type of video: url for external links, upload for Supabase storage';
COMMENT ON COLUMN onboarding_tasks.video_storage_path IS 'Storage path for uploaded videos in Supabase storage';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_video_type 
ON onboarding_tasks(video_type) 
WHERE video_type IS NOT NULL;

-- Storage bucket setup (Run this in Supabase Dashboard under Storage)
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Create a new bucket called 'task-videos'
-- 3. Set it to PUBLIC or PRIVATE based on your needs
-- 4. Add the following RLS policies:

-- Example RLS policies for the storage bucket (apply in Dashboard):
/*
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'task-videos' AND auth.role() = 'authenticated');

-- Allow public to view videos (if public bucket)
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'task-videos');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'task-videos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'task-videos' AND auth.role() = 'authenticated');
*/

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'onboarding_tasks' 
AND column_name IN ('video_type', 'video_storage_path');