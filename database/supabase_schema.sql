-- CODECRYPT Database Schema for Supabase (PostgreSQL)
-- Created for Intellect '26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams Table
CREATE TABLE teams (
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

-- Team Progress Table
CREATE TABLE team_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    stage INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(team_id, round, stage)
);

-- Submissions Table
CREATE TABLE submissions (
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

-- Physical Codes Table
CREATE TABLE physical_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id VARCHAR(20) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_used BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(team_id, round)
);

-- Event Configuration Table
CREATE TABLE event_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_teams_email ON teams(email);
CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_progress_team_round ON team_progress(team_id, round);
CREATE INDEX idx_submissions_team ON submissions(team_id, submitted_at);
CREATE INDEX idx_submissions_round_stage ON submissions(round, stage);
CREATE INDEX idx_codes_code ON physical_codes(code);
CREATE INDEX idx_codes_team_round ON physical_codes(team_id, round);

-- Insert default configuration
INSERT INTO event_config (config_key, config_value) VALUES
('event_name', 'CODECRYPT - Intellect 26'),
('round1_duration_seconds', '600'),
('round2_duration_seconds', '900'),
('round3_duration_seconds', '1200'),
('round4_duration_seconds', '0'),
('max_teams', '50'),
('registration_open', 'true');

-- Sample Teams (for testing)
INSERT INTO teams (team_id, team_name, email, login_code, access_code) VALUES
('TM-001', 'Team Alpha', 'alpha@example.com', 'LOGIN-1111', 'ALPHA-001'),
('TM-002', 'Team Beta', 'beta@example.com', 'LOGIN-2222', 'BETA-002'),
('TM-003', 'Team Gamma', 'gamma@example.com', 'LOGIN-3333', 'GAMMA-003'),
('TM-004', 'Team Delta', 'delta@example.com', 'LOGIN-4444', 'DELTA-004');

-- Sample Physical Codes
INSERT INTO physical_codes (team_id, round, code) VALUES
('TM-001', 1, 'CRPT-1111'), ('TM-001', 3, 'CRPT-3311'),
('TM-002', 1, 'CRPT-2222'), ('TM-002', 3, 'CRPT-3322'),
('TM-003', 1, 'CRPT-3333'), ('TM-003', 3, 'CRPT-3355'),
('TM-004', 1, 'CRPT-4444'), ('TM-004', 3, 'CRPT-3344');

-- Create Views

-- Leaderboard View
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    t.team_id,
    t.team_name,
    t.total_score,
    t.current_round,
    t.current_stage,
    COUNT(DISTINCT CONCAT(tp.round, '-', tp.stage)) as stages_completed
FROM teams t
LEFT JOIN team_progress tp ON t.team_id = tp.team_id AND tp.status = 'completed'
WHERE t.is_active = TRUE
GROUP BY t.team_id, t.team_name, t.total_score, t.current_round, t.current_stage
ORDER BY t.total_score DESC, stages_completed DESC;

-- Team Activity View
CREATE OR REPLACE VIEW team_activity AS
SELECT 
    s.team_id,
    t.team_name,
    s.round,
    s.stage,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN s.is_correct THEN 1 ELSE 0 END) as correct_attempts,
    MAX(s.submitted_at) as last_attempt
FROM submissions s
JOIN teams t ON s.team_id = t.team_id
GROUP BY s.team_id, t.team_name, s.round, s.stage
ORDER BY s.team_id, s.round, s.stage;

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Teams can only see their own data)
CREATE POLICY "Teams can view own data" ON teams
    FOR SELECT USING (team_id = current_setting('app.current_team_id', TRUE));

CREATE POLICY "Teams can update own progress" ON teams
    FOR UPDATE USING (team_id = current_setting('app.current_team_id', TRUE));

CREATE POLICY "Teams can view own progress" ON team_progress
    FOR SELECT USING (team_id = current_setting('app.current_team_id', TRUE));

CREATE POLICY "Teams can view own submissions" ON submissions
    FOR SELECT USING (team_id = current_setting('app.current_team_id', TRUE));

CREATE POLICY "Teams can view own codes" ON physical_codes
    FOR SELECT USING (team_id = current_setting('app.current_team_id', TRUE));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for teams table
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
