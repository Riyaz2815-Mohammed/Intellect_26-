-- CODECRYPT Database Schema for MySQL
-- Created for Intellect '26

-- Drop existing tables if they exist
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS team_progress;
DROP TABLE IF EXISTS teams;

-- Teams Table
CREATE TABLE teams (
    team_id VARCHAR(20) PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    login_code VARCHAR(100) NOT NULL,
    access_code VARCHAR(100) NOT NULL,  -- Keep for backward compatibility
    current_round INT DEFAULT 1,
    current_stage INT DEFAULT 1,
    total_score INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_team_name (team_name),
    INDEX idx_active (is_active)
);

-- Team Progress Table (tracks detailed progress)
CREATE TABLE team_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(20) NOT NULL,
    round INT NOT NULL,
    stage INT NOT NULL,
    status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_taken_seconds INT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    INDEX idx_team_round (team_id, round),
    UNIQUE KEY unique_team_round_stage (team_id, round, stage)
);

-- Submissions Table (logs all attempts)
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(20) NOT NULL,
    round INT NOT NULL,
    stage INT NOT NULL,
    submitted_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    points_awarded INT DEFAULT 0,
    time_bonus INT DEFAULT 0,
    error_message VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_seconds INT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    INDEX idx_team_submissions (team_id, submitted_at),
    INDEX idx_round_stage (round, stage)
);

-- Physical Codes Table (for Round 1 and Round 3)
CREATE TABLE physical_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(20) NOT NULL,
    round INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_round (team_id, round),
    INDEX idx_code (code)
);

-- Admin Users Table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'moderator') DEFAULT 'moderator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Configuration Table
CREATE TABLE event_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO event_config (config_key, config_value) VALUES
('event_name', 'CODECRYPT - Intellect 26'),
('round1_duration_seconds', '600'),
('round2_duration_seconds', '900'),
('round3_duration_seconds', '1200'),
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
('TM-003', 1, 'CRPT-3333'), ('TM-003', 3, 'CRPT-3333'),
('TM-004', 1, 'CRPT-4444'), ('TM-004', 3, 'CRPT-3344');

-- Views for easy querying

-- Leaderboard View
CREATE VIEW leaderboard AS
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
CREATE VIEW team_activity AS
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
