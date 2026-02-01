-- Add global game timer columns to teams table
-- Run this migration on your Supabase database

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS game_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS game_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT 0; -- Total time in seconds

-- Add comment for clarity
COMMENT ON COLUMN teams.game_started_at IS 'Timestamp when team clicked START MISSION';
COMMENT ON COLUMN teams.game_completed_at IS 'Timestamp when team completed all 4 rounds';
COMMENT ON COLUMN teams.total_time IS 'Total game time in seconds (calculated on completion)';
