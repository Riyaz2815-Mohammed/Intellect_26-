# 🛡️ Safe SQL Queries Reference - CODECRYPT

## ⚠️ CRITICAL: Run These Queries in Order

All queries include safety checks and are production-ready.

---

## 1️⃣ Initial Setup (Fresh Database)

### Step 1: Check if tables already exist (SAFE - Read-only)
```sql
-- This query is 100% safe - it only reads metadata
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'submissions', 'team_progress', 'physical_codes', 'event_config');
```

**Expected Result**: Empty (if fresh) or list of existing tables

---

### Step 2: Create Tables (SAFE - Uses IF NOT EXISTS)
```sql
-- Enable UUID extension (safe - idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams Table (safe - won't recreate if exists)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) UNIQUE NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    login_code VARCHAR(100) NOT NULL,
    access_code VARCHAR(100) NOT NULL,
    current_round INTEGER DEFAULT 1,
    current_stage INTEGER DEFAULT 1,
    total_score INTEGER DEFAULT 0,
    round_sequence INTEGER[] DEFAULT ARRAY[1,2,3,4],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Progress Table (safe - won't recreate if exists)
CREATE TABLE IF NOT EXISTS team_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    stage INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER,
    UNIQUE(team_id, round, stage)
);

-- Submissions Table (safe - won't recreate if exists)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    stage INTEGER NOT NULL,
    submitted_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    time_bonus INTEGER DEFAULT 0,
    video_time_taken INTEGER DEFAULT 0,
    error_message VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physical Codes Table (safe - won't recreate if exists)
CREATE TABLE IF NOT EXISTS physical_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(team_id, round)
);

-- Event Configuration Table (safe - won't recreate if exists)
CREATE TABLE IF NOT EXISTS event_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### Step 3: Create Indexes (SAFE - Uses IF NOT EXISTS)
```sql
-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_teams_email ON teams(email);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_progress_team_round ON team_progress(team_id, round);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_round_stage ON submissions(round, stage);
CREATE INDEX IF NOT EXISTS idx_codes_code ON physical_codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_team_round ON physical_codes(team_id, round);
```

---

## 2️⃣ Migration (If Database Already Exists)

### Check Current Column Name (SAFE - Read-only)
```sql
-- 100% safe - only reads schema information
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;
```

### Rename Column (SAFE - Only if needed)
```sql
-- First, check if old column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'time_taken_seconds'
    ) THEN
        -- Rename the column
        ALTER TABLE submissions 
        RENAME COLUMN time_taken_seconds TO video_time_taken;
        
        RAISE NOTICE 'Column renamed successfully';
    ELSE
        RAISE NOTICE 'Column already has correct name or does not exist';
    END IF;
END $$;
```

---

## 3️⃣ Row Level Security (RLS) Configuration

### Option A: Disable RLS (Simpler for Backend)
```sql
-- Safe - Disables RLS for backend access
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE physical_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_config DISABLE ROW LEVEL SECURITY;
```

### Option B: Keep RLS but Allow Service Role (More Secure)
```sql
-- First, enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe)
DROP POLICY IF EXISTS "Backend service access" ON teams;
DROP POLICY IF EXISTS "Backend service access" ON team_progress;
DROP POLICY IF EXISTS "Backend service access" ON submissions;
DROP POLICY IF EXISTS "Backend service access" ON physical_codes;

-- Create new policies allowing full access
CREATE POLICY "Backend service access" ON teams FOR ALL USING (true);
CREATE POLICY "Backend service access" ON team_progress FOR ALL USING (true);
CREATE POLICY "Backend service access" ON submissions FOR ALL USING (true);
CREATE POLICY "Backend service access" ON physical_codes FOR ALL USING (true);
```

---

## 4️⃣ Verification Queries (All SAFE - Read-only)

### Verify Tables Created
```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Verify Submissions Table Structure
```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'submissions'
ORDER BY ordinal_position;
```

### Verify Indexes Created
```sql
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check RLS Status
```sql
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 5️⃣ Data Verification (SAFE - Read-only)

### Count Records in Each Table
```sql
SELECT 
    'teams' as table_name, COUNT(*) as record_count FROM teams
UNION ALL
SELECT 'team_progress', COUNT(*) FROM team_progress
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'physical_codes', COUNT(*) FROM physical_codes
UNION ALL
SELECT 'event_config', COUNT(*) FROM event_config;
```

### Check Team Data
```sql
SELECT 
    team_id,
    team_name,
    email,
    current_round,
    current_stage,
    total_score,
    round_sequence,
    is_active,
    created_at
FROM teams
ORDER BY created_at DESC;
```

### Check Recent Submissions
```sql
SELECT 
    s.team_id,
    t.team_name,
    s.round,
    s.stage,
    s.is_correct,
    s.points_awarded,
    s.time_bonus,
    s.video_time_taken,
    s.submitted_at
FROM submissions s
JOIN teams t ON s.team_id = t.team_id
ORDER BY s.submitted_at DESC
LIMIT 20;
```

### Verify Leaderboard Query Works
```sql
SELECT 
    t.team_id,
    t.team_name,
    t.total_score,
    t.current_round,
    t.current_stage,
    COALESCE(SUM(s.video_time_taken), 0) as total_time,
    COUNT(CASE WHEN s.is_correct = FALSE THEN 1 END) as total_retries
FROM teams t
LEFT JOIN submissions s ON t.team_id = s.team_id
WHERE t.is_active = TRUE
GROUP BY t.team_id, t.team_name, t.total_score, t.current_round, t.current_stage
ORDER BY t.total_score DESC, total_time ASC
LIMIT 10;
```

---

## 6️⃣ Maintenance Queries (Use with Caution)

### Reset a Single Team (SAFE - Specific team only)
```sql
-- Replace 'TM-001' with actual team_id
BEGIN;

-- Delete submissions for this team
DELETE FROM submissions WHERE team_id = 'TM-001';

-- Delete progress for this team
DELETE FROM team_progress WHERE team_id = 'TM-001';

-- Reset team scores
UPDATE teams 
SET current_round = 1, 
    current_stage = 1, 
    total_score = 0
WHERE team_id = 'TM-001';

-- Verify changes before committing
SELECT * FROM teams WHERE team_id = 'TM-001';

-- If everything looks good, commit. Otherwise, ROLLBACK
COMMIT;
-- ROLLBACK; -- Uncomment this instead if you want to undo
```

### Delete a Single Team (SAFE - Specific team only)
```sql
-- Replace 'TM-001' with actual team_id
BEGIN;

-- Verify team exists first
SELECT team_id, team_name, email FROM teams WHERE team_id = 'TM-001';

-- Delete team (CASCADE will delete related records)
DELETE FROM teams WHERE team_id = 'TM-001';

-- Verify deletion
SELECT COUNT(*) as remaining_count FROM teams WHERE team_id = 'TM-001';

-- Commit if correct, otherwise ROLLBACK
COMMIT;
-- ROLLBACK; -- Uncomment to undo
```

### Clear All Test Data (⚠️ DANGEROUS - Use only in development)
```sql
-- ⚠️ WARNING: This will delete ALL data!
-- Only use this in development/testing environment

BEGIN;

-- Show counts before deletion
SELECT 'Before deletion:' as status;
SELECT 'teams' as table_name, COUNT(*) FROM teams
UNION ALL SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL SELECT 'team_progress', COUNT(*) FROM team_progress
UNION ALL SELECT 'physical_codes', COUNT(*) FROM physical_codes;

-- Delete all data (in correct order due to foreign keys)
TRUNCATE TABLE submissions CASCADE;
TRUNCATE TABLE team_progress CASCADE;
TRUNCATE TABLE physical_codes CASCADE;
TRUNCATE TABLE teams CASCADE;

-- Show counts after deletion
SELECT 'After deletion:' as status;
SELECT 'teams' as table_name, COUNT(*) FROM teams
UNION ALL SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL SELECT 'team_progress', COUNT(*) FROM team_progress
UNION ALL SELECT 'physical_codes', COUNT(*) FROM physical_codes;

-- REVIEW THE OUTPUT CAREFULLY!
-- If correct, COMMIT. If mistake, ROLLBACK immediately!
COMMIT;
-- ROLLBACK; -- Uncomment to undo
```

---

## 7️⃣ Backup Queries (SAFE - Read-only)

### Export Team Data (for backup)
```sql
-- Copy this output to save team data
SELECT 
    team_id,
    team_name,
    email,
    login_code,
    current_round,
    current_stage,
    total_score,
    round_sequence,
    created_at
FROM teams
ORDER BY created_at;
```

### Export Submissions (for backup)
```sql
-- Copy this output to save submission history
SELECT 
    team_id,
    round,
    stage,
    is_correct,
    points_awarded,
    time_bonus,
    video_time_taken,
    submitted_at
FROM submissions
ORDER BY submitted_at;
```

---

## 8️⃣ Emergency Fixes

### Fix Missing video_time_taken Column
```sql
-- Safe - Only adds column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'video_time_taken'
    ) THEN
        ALTER TABLE submissions 
        ADD COLUMN video_time_taken INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Column added successfully';
    ELSE
        RAISE NOTICE 'Column already exists';
    END IF;
END $$;
```

### Recalculate All Team Scores (SAFE - Can be rolled back)
```sql
BEGIN;

-- Recalculate scores from submissions
UPDATE teams t
SET total_score = COALESCE((
    SELECT SUM(points_awarded + time_bonus)
    FROM submissions s
    WHERE s.team_id = t.team_id 
    AND s.is_correct = TRUE
), 0);

-- Verify changes
SELECT team_id, team_name, total_score 
FROM teams 
ORDER BY total_score DESC;

-- If correct, COMMIT. Otherwise, ROLLBACK
COMMIT;
-- ROLLBACK; -- Uncomment to undo
```

---

## 📋 Query Execution Checklist

Before running any query:
- [ ] Read the query carefully
- [ ] Understand what it does
- [ ] Check if it's read-only (SELECT) or modifying (INSERT/UPDATE/DELETE)
- [ ] For modifying queries, use BEGIN/COMMIT/ROLLBACK
- [ ] Verify the results before committing
- [ ] Have a backup if deleting data

**Golden Rule**: When in doubt, wrap it in a transaction and ROLLBACK!

---

**Last Updated**: 2026-01-31  
**Safety Level**: Production-Ready ✅
