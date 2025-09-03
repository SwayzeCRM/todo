-- Add video progress tracking functionality
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Add video completion requirement to tasks
-- ============================================

ALTER TABLE onboarding_tasks 
ADD COLUMN IF NOT EXISTS require_video_completion BOOLEAN DEFAULT false;

COMMENT ON COLUMN onboarding_tasks.require_video_completion IS 
'When true, users must watch the entire video before marking task as complete';

-- ============================================
-- 2. Create video progress tracking table
-- ============================================

CREATE TABLE IF NOT EXISTS video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
    video_url TEXT,
    current_position DECIMAL(10,2) DEFAULT 0, -- Current position in seconds
    duration DECIMAL(10,2), -- Total video duration in seconds
    watch_percentage DECIMAL(5,2) DEFAULT 0, -- Percentage watched (0-100)
    completed BOOLEAN DEFAULT false, -- True when video is fully watched (>95%)
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique progress per user per task
    UNIQUE(user_id, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_task_id ON video_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_task ON video_progress(user_id, task_id);

-- ============================================
-- 3. Create video watch sessions table (for analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS video_watch_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP WITH TIME ZONE,
    start_position DECIMAL(10,2) DEFAULT 0,
    end_position DECIMAL(10,2),
    duration_watched DECIMAL(10,2), -- Seconds watched in this session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for watch sessions
CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_id ON video_watch_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_task_id ON video_watch_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_task ON video_watch_sessions(user_id, task_id);

-- ============================================
-- 4. Create function to update video progress
-- ============================================

CREATE OR REPLACE FUNCTION update_video_progress(
    p_user_id UUID,
    p_task_id UUID,
    p_current_position DECIMAL,
    p_duration DECIMAL,
    p_video_url TEXT DEFAULT NULL
) RETURNS video_progress AS $$
DECLARE
    v_progress video_progress;
    v_percentage DECIMAL(5,2);
    v_completed BOOLEAN;
BEGIN
    -- Calculate percentage watched
    IF p_duration > 0 THEN
        v_percentage := (p_current_position / p_duration) * 100;
    ELSE
        v_percentage := 0;
    END IF;
    
    -- Consider video completed if watched > 95%
    v_completed := v_percentage >= 95;
    
    -- Insert or update progress
    INSERT INTO video_progress (
        user_id, 
        task_id, 
        video_url,
        current_position, 
        duration, 
        watch_percentage, 
        completed,
        last_watched_at,
        updated_at
    ) VALUES (
        p_user_id, 
        p_task_id, 
        p_video_url,
        p_current_position, 
        p_duration, 
        v_percentage, 
        v_completed,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, task_id) 
    DO UPDATE SET 
        current_position = GREATEST(video_progress.current_position, EXCLUDED.current_position),
        duration = EXCLUDED.duration,
        video_url = COALESCE(EXCLUDED.video_url, video_progress.video_url),
        watch_percentage = GREATEST(video_progress.watch_percentage, EXCLUDED.watch_percentage),
        completed = video_progress.completed OR EXCLUDED.completed,
        last_watched_at = EXCLUDED.last_watched_at,
        updated_at = EXCLUDED.updated_at
    RETURNING * INTO v_progress;
    
    RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Create function to log watch session
-- ============================================

CREATE OR REPLACE FUNCTION log_watch_session(
    p_user_id UUID,
    p_task_id UUID,
    p_start_position DECIMAL,
    p_end_position DECIMAL
) RETURNS video_watch_sessions AS $$
DECLARE
    v_session video_watch_sessions;
BEGIN
    INSERT INTO video_watch_sessions (
        user_id,
        task_id,
        start_position,
        end_position,
        duration_watched,
        session_end
    ) VALUES (
        p_user_id,
        p_task_id,
        p_start_position,
        p_end_position,
        p_end_position - p_start_position,
        CURRENT_TIMESTAMP
    )
    RETURNING * INTO v_session;
    
    RETURN v_session;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Enable RLS on new tables
-- ============================================

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for video_progress
CREATE POLICY "Users can view their own video progress" ON video_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own video progress" ON video_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own video progress" ON video_progress
    FOR UPDATE USING (true);

-- Create policies for video_watch_sessions
CREATE POLICY "Users can view their own watch sessions" ON video_watch_sessions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own watch sessions" ON video_watch_sessions
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. Create view for video analytics
-- ============================================

CREATE OR REPLACE VIEW video_analytics AS
SELECT 
    vp.task_id,
    ot.title as task_title,
    COUNT(DISTINCT vp.user_id) as unique_viewers,
    AVG(vp.watch_percentage) as avg_watch_percentage,
    COUNT(CASE WHEN vp.completed THEN 1 END) as completed_count,
    AVG(vp.duration) as avg_duration,
    MAX(vp.last_watched_at) as last_watched
FROM video_progress vp
JOIN onboarding_tasks ot ON vp.task_id = ot.id
GROUP BY vp.task_id, ot.title;

-- ============================================
-- 8. Update function for triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for video_progress
CREATE TRIGGER update_video_progress_updated_at 
    BEFORE UPDATE ON video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Grant permissions
-- ============================================

GRANT ALL ON video_progress TO authenticated;
GRANT ALL ON video_watch_sessions TO authenticated;
GRANT SELECT ON video_analytics TO authenticated;