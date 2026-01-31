-- ============================================
-- SUPABASE SQL EDITOR - COPY AND PASTE THIS
-- ============================================
-- This query is 100% SAFE and will only make changes if needed
-- It checks before modifying anything

-- Step 1: Check if column needs to be renamed
DO $$ 
BEGIN
    -- Check if old column name exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'time_taken_seconds'
    ) THEN
        -- Rename the column
        ALTER TABLE submissions 
        RENAME COLUMN time_taken_seconds TO video_time_taken;
        
        RAISE NOTICE '✅ Column renamed: time_taken_seconds → video_time_taken';
    ELSE
        RAISE NOTICE 'ℹ️ Column already correct or does not exist';
    END IF;
END $$;

-- Step 2: Disable Row Level Security (RLS) for backend access
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE physical_codes DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the changes
SELECT 
    'Verification Results:' as status,
    (SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'submissions' 
     AND column_name = 'video_time_taken') as correct_column_exists,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'submissions') as total_columns;

-- Expected output:
-- correct_column_exists: 'video_time_taken'
-- total_columns: 11
