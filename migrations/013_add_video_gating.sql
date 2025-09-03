-- Add video gating functionality to prevent moving to next task until video is watched
-- Run this in Supabase SQL Editor

-- Add column to track if video completion gates the next task
ALTER TABLE onboarding_tasks 
ADD COLUMN IF NOT EXISTS gate_next_task_on_video BOOLEAN DEFAULT false;

COMMENT ON COLUMN onboarding_tasks.gate_next_task_on_video IS 
'When true, users cannot proceed to the next task until they have watched at least 95% of the video';

-- Create function to check if user can proceed to next task
CREATE OR REPLACE FUNCTION can_proceed_to_next_task(
    p_user_id UUID,
    p_current_task_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_gate_required BOOLEAN;
    v_video_completed BOOLEAN;
BEGIN
    -- Check if current task requires video completion to proceed
    SELECT gate_next_task_on_video INTO v_gate_required
    FROM onboarding_tasks
    WHERE id = p_current_task_id;
    
    -- If no gating required, allow proceeding
    IF v_gate_required IS NULL OR v_gate_required = FALSE THEN
        RETURN TRUE;
    END IF;
    
    -- Check if video is completed (>= 95% watched)
    SELECT completed INTO v_video_completed
    FROM video_progress
    WHERE user_id = p_user_id 
    AND task_id = p_current_task_id;
    
    -- Return true if video is completed, false otherwise
    RETURN COALESCE(v_video_completed, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_proceed_to_next_task TO authenticated;