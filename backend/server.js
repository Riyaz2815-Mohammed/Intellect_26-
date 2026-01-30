const dns = require('dns');
// Force IPv4 to fix Render/Supabase IPv6 connection issues (ENETUNREACH)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (PostgreSQL)
// Use DATABASE_URL from environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // Timeout after 5s to allow fast retries
});

// Test database connection on startup
// Test database connection on startup with Auto-Retry
const connectWithRetry = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL Database connected successfully');
        client.release();
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('⚠️  Database connection failed (Firewall/Network?). Retrying in 5s...');
        setTimeout(connectWithRetry, 5000);
    }
};
connectWithRetry();

// Email Transporter (Gmail)
// DEPRECATED: Switched to EmailJS (HTTP API)
// const transporter = nodemailer.createTransport({...});
console.log('[EMAIL SETUP] Using EmailJS HTTP API for email delivery.');

// ==================== GLOBAL CONFIG ====================

// Get Global Config
app.get('/api/config', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT config_key, config_value FROM event_config');
        const config = rows.reduce((acc, row) => {
            acc[row.config_key] = row.config_value;
            return acc;
        }, {});
        res.json(config);
    } catch (error) {
        console.error('Config fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Global Config (Admin)
app.post('/api/admin/config', async (req, res) => {
    try {
        const { key, value } = req.body;
        // Postgres Upsert
        await pool.query(
            'INSERT INTO event_config (config_key, config_value) VALUES ($1, $2) ON CONFLICT (config_key) DO UPDATE SET config_value = $3, updated_at = NOW()',
            [key, value.toString(), value.toString()]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Config update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== AUTHENTICATION ====================

// Team Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { teamName, loginCode } = req.body;
        console.log(`[LOGIN ATTEMPT] Name=${teamName}, Code=${loginCode}`);

        const { rows: teams } = await pool.query(
            'SELECT * FROM teams WHERE LOWER(team_name) = LOWER($1) AND LOWER(login_code) = LOWER($2)',
            [teamName.trim(), loginCode.trim()]
        );

        if (teams.length === 0) {
            console.warn(`[LOGIN FAILED] Invalid credentials for: ${teamName}`);
            return res.status(401).json({ success: false, error: 'Invalid team name or login code' });
        }

        const team = teams[0];

        if (!team.is_active) {
            console.warn(`[LOGIN FAILED] Team inactive: ${teamName}`);
            return res.status(401).json({ success: false, error: 'Account inactive' });
        }

        res.json({
            success: true,
            team: {
                id: team.team_id,
                name: team.team_name,
                email: team.email,
                round: team.current_round,
                stage: team.current_stage,
                score: team.total_score
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ==================== TEAM MANAGEMENT ====================

// Register Team
app.post('/api/teams/register', async (req, res) => {
    try {
        const { teamId, teamName, email, accessCode } = req.body;

        // Check if team already exists
        const { rows: existing } = await pool.query(
            'SELECT team_id FROM teams WHERE team_id = $1 OR email = $2',
            [teamId, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Team ID or Email already exists' });
        }

        // Insert team
        await pool.query(
            'INSERT INTO teams (team_id, team_name, email, access_code) VALUES ($1, $2, $3, $4)',
            [teamId, teamName, email, accessCode]
        );

        // Generate physical codes
        const round1Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round3Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;

        await pool.query(
            'INSERT INTO physical_codes (team_id, round, code) VALUES ($1, 1, $2), ($3, 3, $4)',
            [teamId, round1Code, teamId, round3Code]
        );

        // Send welcome email
        await sendWelcomeEmail(email, teamName, teamId, accessCode);

        res.json({
            success: true,
            message: 'Team registered successfully',
            teamId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- HELPER: Get Randomized Round Sequence ---
function getRoundSequence(teamId) {
    if (!teamId) return [1, 2, 3, 4, 5];

    // Seeded Random Helper
    let seed = 0;
    for (let i = 0; i < teamId.length; i++) {
        seed = ((seed << 5) - seed) + teamId.charCodeAt(i);
        seed |= 0;
    }
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Shuffle 1-4
    const rounds = [1, 2, 3, 4];
    for (let i = rounds.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [rounds[i], rounds[j]] = [rounds[j], rounds[i]];
    }

    // Round 5 Removed
    return rounds;
}


// Get Team State
app.get('/api/teams/:teamId/state', async (req, res) => {
    try {
        const { teamId } = req.params;

        const { rows: teams } = await pool.query(
            'SELECT * FROM teams WHERE team_id = $1',
            [teamId]
        );

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = teams[0];

        // --- RANDOM ROUND MAPPING ---
        // team.current_round is the RANK (1st round, 2nd round, etc.)
        // We map it to the actual Game Round (1=SQL, 2=Data, etc.)
        const sequence = getRoundSequence(teamId);

        // If rank > 5, they are done (Round 10 logic handled by admin override mainly)
        // If valid rank (1-5), get mapped round. fallback to 5 if out of bounds.
        let displayRound = team.current_round;
        if (team.current_round <= 5) {
            displayRound = sequence[team.current_round - 1];
        }

        res.json({
            round: displayRound, // Frontend sees the RANDOMIZED round type
            stage: team.current_stage,
            score: team.total_score,
            rank: team.current_round // Useful for frontend to know "Progress: 1/5"
        });
    } catch (error) {
        console.error('Get state error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== GAME LOGIC ====================

// Submit Answer
app.post('/api/game/submit', async (req, res) => {
    try {
        const { teamId, round, stage, answer } = req.body;

        // Get team
        const { rows: teams } = await pool.query(
            'SELECT * FROM teams WHERE team_id = $1',
            [teamId]
        );

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = teams[0];

        // --- VALIDATE ROUND MAPPING ---
        const sequence = getRoundSequence(teamId);
        const expectedGameRound = sequence[team.current_round - 1];

        // If the submitted round doesn't match the expected game type for this rank
        // Allowing admin overrides (round > 5) to pass through standard logic if needed, 
        // but for standard gameplay (1-5), enforce sequence.
        if (team.current_round <= 5 && parseInt(round) !== expectedGameRound) {
            console.warn(`[CHEAT DETECTED] Team ${teamId} sent Round ${round} but expected Round ${expectedGameRound} (Rank ${team.current_round})`);
            // We could reject, but maybe they are submitting a delayed request? 
            // Let's soft-reject or allow if strict mode is off. 
            // Currently enforcing STRICT:
            return res.json({ success: false, message: "INVALID ROUND SESSION" });
        }

        // Calculate Time Taken
        let timeTaken = 0;
        let timeBonus = 0;

        // Get start time for this stage
        const { rows: progress } = await pool.query(
            'SELECT started_at FROM team_progress WHERE team_id = $1 AND round = $2 AND stage = $3',
            [teamId, round, stage]
        );

        if (progress.length > 0 && progress[0].started_at) {
            const startTime = new Date(progress[0].started_at);
            const endTime = new Date();
            timeTaken = Math.floor((endTime - startTime) / 1000); // Seconds

            // Calculate Bonus (Example: Max 600s, Bonus = remaining * 0.5)
            const TIME_LIMIT = 600; // 10 minutes generic limit
            if (timeTaken < TIME_LIMIT) {
                timeBonus = Math.floor((TIME_LIMIT - timeTaken) * 0.2); // 0.2 points per second saved
            }
        } else {
            // First stage or missing record - Create 'in_progress' record now if missing to start timer for re-attempts
            await pool.query(
                'INSERT INTO team_progress (team_id, round, stage, status, started_at) VALUES ($1, $2, $3, \'in_progress\', NOW()) ON CONFLICT (team_id, round, stage) DO NOTHING',
                [teamId, round, stage]
            );
        }

        // Validate answer
        const GameService = require('./gameService');
        const result = GameService.validateSubmission(round, stage, answer);

        // Calculate Total Points for this submission
        const pointsAwarded = result.success ? (result.points || 0) : 0;
        const totalPointsAwarded = pointsAwarded + (result.success ? timeBonus : 0);

        // Log submission
        await pool.query(
            'INSERT INTO submissions (team_id, round, stage, submitted_answer, is_correct, points_awarded, time_bonus, time_taken_seconds, error_message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [teamId, round, stage, JSON.stringify(answer), result.success, pointsAwarded, timeBonus, timeTaken, result.message]
        );

        if (result.success && result.triggerEmail) {
            // Fetch Code for this round
            const targetRound = parseInt(round);
            const { rows: codes } = await pool.query(
                'SELECT code FROM physical_codes WHERE team_id = $1 AND round = $2',
                [teamId, targetRound]
            );

            if (codes.length > 0) {
                const code = codes[0].code;
                console.log(`[EMAIL TRIGGER] Sending email for Round ${targetRound} to ${team.email}`);

                if (targetRound === 3) {
                    await sendRound3AccessCodeEmail(team.email, team.team_name, code);
                } else if (targetRound === 4) {
                    await sendAdvantageCodeEmail(team.email, team.team_name, code);
                }
            } else {
                console.error(`[EMAIL ERROR] No code found for Team ${teamId} Round ${targetRound}`);
            }
        }

        if (result.success) {
            // Update team progress
            const newScore = team.total_score + totalPointsAwarded;

            // Round Transition Logic
            // Map GAME TYPE to Total Stages
            const STAGES_PER_ROUND = {
                1: 5, // Round 1: 5 Stages
                2: 5, // Round 2: 5 Stages
                3: 6, // Round 3: 5 Stages + 1 Code Entry (Email)
                4: 3  // Round 4: 3 Stages
            };

            const gameRound = parseInt(round);
            const currentStage = parseInt(stage);
            const maxStages = STAGES_PER_ROUND[gameRound] || 5;

            let nextRank = team.current_round; // Rank
            let nextStage = currentStage + 1;

            if (currentStage >= maxStages) {
                // Round Complete! Move to next Rank.
                nextRank = team.current_round + 1;
                nextStage = 1;
                console.log(`[PROGRESS] Team ${teamId} completed Game ${gameRound} (Rank ${team.current_round}). Moving to Rank ${nextRank}.`);

                if (gameRound === 4) {
                    console.log(`[R4 TRANSITION] Round 4 finished at Stage ${currentStage}. Advancing team.`);
                }
            } else {
                // Update Stage, keep Rank
                console.log(`[PROGRESS] Team ${teamId} advanced to Game ${gameRound} Stage ${nextStage}.`);
            }

            // Update Team Rank/Stage
            // Note: We update 'current_round' with nextRank (1,2,3,4,5...)
            await pool.query(
                'UPDATE teams SET total_score = $1, current_round = $2, current_stage = $3 WHERE team_id = $4',
                [newScore, nextRank, nextStage, teamId]
            );

            // Mark current stage as completed
            await pool.query(
                'UPDATE team_progress SET status = \'completed\', completed_at = NOW(), time_taken_seconds = $1 WHERE team_id = $2 AND round = $3 AND stage = $4',
                [timeTaken, teamId, gameRound, currentStage]
            );

            // Initialize NEXT stage (to start timer)
            // Determine the Game Round for the NEXT rank if rank changed
            let nextGameRound = gameRound;

            if (nextRank !== team.current_round) {
                // Calculate what the next game round will be
                const sequence = getRoundSequence(teamId);
                if (nextRank <= 5) {
                    nextGameRound = sequence[nextRank - 1];
                } else {
                    nextGameRound = 999; // Finished
                }
            }

            if (nextGameRound !== 999) {
                await pool.query(
                    'INSERT INTO team_progress (team_id, round, stage, status, started_at) VALUES ($1, $2, $3, \'in_progress\', NOW()) ON CONFLICT (team_id, round, stage) DO NOTHING',
                    [teamId, nextGameRound, nextStage]
                );
            }
        }

        res.json({
            ...result,
            timeTaken,
            timeBonus: result.success ? timeBonus : 0,
            totalPoints: totalPointsAwarded
        });
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



// Get Physical Code
app.get('/api/game/physical-code/:teamId/:round', async (req, res) => {
    try {
        const { teamId, round } = req.params;

        const { rows: codes } = await pool.query(
            'SELECT code FROM physical_codes WHERE team_id = $1 AND round = $2 AND is_used = FALSE',
            [teamId, round]
        );

        if (codes.length === 0) {
            return res.status(404).json({ error: 'Code not found or already used' });
        }

        res.json({ code: codes[0].code });
    } catch (error) {
        console.error('Get code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Validate Physical Code
app.post('/api/game/validate-code', async (req, res) => {
    try {
        const { teamId, round, code } = req.body;

        const { rows: codes } = await pool.query(
            'SELECT * FROM physical_codes WHERE team_id = $1 AND round = $2 AND code = $3 AND is_used = FALSE',
            [teamId, round, code]
        );

        if (codes.length === 0) {
            return res.json({ success: false, message: 'Invalid or already used code' });
        }

        // Mark as used
        await pool.query(
            'UPDATE physical_codes SET is_used = TRUE, used_at = NOW() WHERE id = $1',
            [codes[0].id]
        );

        res.json({ success: true, message: 'Code validated successfully' });
    } catch (error) {
        console.error('Validate code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ADMIN ENDPOINTS ====================

// Get Leaderboard (Live)
app.get('/api/leaderboard/live', async (req, res) => {
    try {
        // Fetch teams with their raw scores
        const { rows: teams } = await pool.query(`
            SELECT 
                t.team_id, 
                t.team_name, 
                t.total_score,
                t.current_round, -- This is effectively the "Rank/Progress", e.g. 1st round, 2nd round...
                t.current_stage
            FROM teams t
            WHERE t.is_active = TRUE
        `);

        // Fetch additional stats for tie-breaking or detailed scoring
        // e.g., Total time taken across all completed stages
        const { rows: stats } = await pool.query(`
            SELECT 
                team_id, 
                SUM(time_taken_seconds) as total_time,
                COUNT(CASE WHEN is_correct = FALSE THEN 1 END) as total_retries
            FROM submissions
            GROUP BY team_id
        `);

        // Map stats to teams
        const statsMap = stats.reduce((acc, row) => {
            acc[row.team_id] = {
                totalTime: parseInt(row.total_time) || 0,
                retries: parseInt(row.total_retries) || 0
            };
            return acc;
        }, {});

        // Construct Leaderboard Data
        const leaderboard = teams.map(team => {
            const teamStats = statsMap[team.team_id] || { totalTime: 0, retries: 0 };

            // Calculate a composite score for sorting if scores are equal
            // Primary: Total Score (Higher is better)
            // Secondary: Progress (Higher Round/Stage is better)
            // Tertiary: Time Taken (Lower is better)

            // Note: In our system, 'current_round' is the 'Level' (1-4). 
            // If they finish, current_round might be > 4 or marked via a flag.

            return {
                id: team.team_id,
                name: team.team_name,
                score: team.total_score,
                progress: team.current_round, // e.g. 3 means they are on their 3rd assigned round
                stage: team.current_stage,
                timeTaken: teamStats.totalTime,
                retries: teamStats.retries
            };
        });

        // Sort Leaderboard
        leaderboard.sort((a, b) => {
            // 1. Score (High to Low)
            if (b.score !== a.score) return b.score - a.score;

            // 2. Progress (High to Low) - Who is further ahead?
            if (b.progress !== a.progress) return b.progress - a.progress;
            if (b.stage !== a.stage) return b.stage - a.stage;

            // 3. Time Taken (Low to High) - Faster is better
            return a.timeTaken - b.timeTaken;
        });

        // Assign Ranks
        const rankedLeaderboard = leaderboard.map((team, index) => ({
            rank: index + 1,
            ...team
        }));

        res.json(rankedLeaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Leaderboard (Legacy/Simple)
app.get('/api/admin/leaderboard', async (req, res) => {
    try {
        const { rows: leaderboard } = await pool.query('SELECT * FROM leaderboard');
        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Teams
app.get('/api/admin/teams', async (req, res) => {
    try {
        const { rows: teams } = await pool.query(
            'SELECT team_id, team_name, email, login_code, current_round, current_stage, total_score, is_active FROM teams ORDER BY total_score DESC'
        );
        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Submissions (Admin)
app.get('/api/admin/submissions', async (req, res) => {
    try {
        const { rows: submissions } = await pool.query(
            `SELECT s.*, t.team_name 
             FROM submissions s 
             JOIN teams t ON s.team_id = t.team_id 
             ORDER BY s.submitted_at DESC 
             LIMIT 100`
        );
        res.json(submissions);
    } catch (error) {
        console.error('Submissions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Override Team State
app.post('/api/admin/override', async (req, res) => {
    try {
        const { teamId, round, stage, score } = req.body;

        await pool.query(
            'UPDATE teams SET current_round = $1, current_stage = $2, total_score = $3 WHERE team_id = $4',
            [round, stage, score, teamId]
        );

        res.json({ success: true, message: 'Team state updated' });
    } catch (error) {
        console.error('Override error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Codes (Admin Fallback for Email Failures)
app.get('/api/admin/codes', async (req, res) => {
    try {
        const { rows: teams } = await pool.query('SELECT team_id, team_name, login_code, access_code FROM teams');
        const { rows: physCodes } = await pool.query('SELECT team_id, round, code FROM physical_codes');

        // Merge data
        const codeMap = teams.map(t => {
            const tCodes = physCodes.filter(pc => pc.team_id === t.team_id);
            return {
                ...t,
                round1: tCodes.find(c => c.round === 1)?.code || 'N/A',
                round2: tCodes.find(c => c.round === 2)?.code || 'N/A',
                round3: tCodes.find(c => c.round === 3)?.code || 'N/A',
                round4: tCodes.find(c => c.round === 4)?.code || 'N/A'
            };
        });

        res.json(codeMap);
    } catch (error) {
        console.error('Get codes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Team (Admin)
app.post('/api/admin/create-team', async (req, res) => {
    try {
        const { teamName, email, loginCode } = req.body;
        console.log(`[CREATE TEAM] Request received: Name=${teamName}, Email=${email}, Code=${loginCode}`);

        const cleanTeamName = teamName.trim();
        const cleanLoginCode = loginCode.trim();

        // Generate team ID
        const teamId = `TM-${Date.now().toString().slice(-6)}`;
        const accessCode = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;

        // Check if team name or email already exists (Case Insensitive)
        const { rows: existing } = await pool.query(
            'SELECT team_name, email FROM teams WHERE LOWER(team_name) = LOWER($1) OR email = $2',
            [cleanTeamName, email]
        );

        if (existing.length > 0) {
            const match = existing[0];
            let errorMsg = 'Team already exists';
            if (match.email === email) errorMsg = `Email '${email}' is already in use by another team.`;
            else errorMsg = `Team name '${cleanTeamName}' is already taken.`;

            console.warn(`[CREATE TEAM] Duplicate: ${errorMsg}`);
            return res.status(400).json({
                success: false,
                error: errorMsg
            });
        }

        // Insert team
        console.log(`[CREATE TEAM] Inserting: ID=${teamId}, Name=${cleanTeamName}, Code=${cleanLoginCode}`);
        const result = await pool.query(
            'INSERT INTO teams (team_id, team_name, email, login_code, access_code) VALUES ($1, $2, $3, $4, $5)',
            [teamId, cleanTeamName, email, cleanLoginCode, accessCode]
        );
        // console.log(`[CREATE TEAM] Insert result: Affected Rows = ${result.requestRowcount}`); // pg result structure varies, handled by not crashing

        // Start tracking time for Round 1 Stage 1 immediately
        await pool.query(
            'INSERT INTO team_progress (team_id, round, stage, status, started_at) VALUES ($1, 1, 1, \'in_progress\', NOW())',
            [teamId]
        );

        // Generate physical codes for Round 1, 2, 3, and 4
        const round1Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round2Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round3Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round4Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;

        await pool.query(
            'INSERT INTO physical_codes (team_id, round, code) VALUES ($1, 1, $2), ($3, 3, $4), ($5, 4, $6), ($7, 2, $8)',
            [teamId, round1Code, teamId, round3Code, teamId, round4Code, teamId, round2Code]
        );

        // Send credentials email (Async / Fire-and-Forget)
        // We do NOT await this so the UI is instant.
        sendTeamCredentialsEmail(email, teamName, loginCode)
            .then(() => console.log(`[EMAIL SENT] Credentials sent to ${email}`))
            .catch(err => console.error(`[EMAIL FAILED] Could not send to ${email}:`, err));

        res.json({
            success: true,
            message: 'Team created successfully',
            teamId,
            loginCode
        });
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Resend Credentials (Admin)
app.post('/api/admin/resend-credentials', async (req, res) => {
    try {
        const { teamId } = req.body;

        const { rows: teams } = await pool.query(
            'SELECT * FROM teams WHERE team_id = $1',
            [teamId]
        );

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Team not found'
            });
        }

        const team = teams[0];
        await sendTeamCredentialsEmail(team.email, team.team_name, team.login_code);

        res.json({
            success: true,
            message: 'Credentials resent successfully'
        });
    } catch (error) {
        console.error('Resend credentials error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Delete Team (Admin)
app.post('/api/admin/delete-team', async (req, res) => {
    try {
        const { teamId } = req.body;

        if (!teamId) {
            return res.status(400).json({ error: 'Team ID is required' });
        }

        // Perform cascaded deletion manually to be safe (though DB might have cascading FKs, this is explicit)
        await pool.query('DELETE FROM submissions WHERE team_id = $1', [teamId]);
        await pool.query('DELETE FROM team_progress WHERE team_id = $1', [teamId]);
        await pool.query('DELETE FROM physical_codes WHERE team_id = $1', [teamId]);

        // Finally delete the team
        const result = await pool.query('DELETE FROM teams WHERE team_id = $1 RETURNING team_name', [teamId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Team not found' });
        }

        console.log(`[ADMIN] Team deleted: ${result.rows[0].team_name} (${teamId})`);

        res.json({
            success: true,
            message: `Team ${result.rows[0].team_name} deleted successfully`
        });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during deletion'
        });
    }
});

// ==================== EMAIL FUNCTIONS ====================

async function sendWelcomeEmail(email, teamName, teamId, accessCode) {
    const mailOptions = {
        from: `"${process.env.EVENT_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: `Welcome to ${process.env.EVENT_NAME}`,
        html: `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff41; padding: 20px; border: 2px solid #00ff41;">
                <h1 style="color: #00ff41; text-align: center; text-shadow: 0 0 10px #00ff41;">CODECRYPT</h1>
                <h2 style="text-align: center; color: #00ffcc;">Intellect '26</h2>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-left: 4px solid #00ff41;">
                    <h3 style="color: #00ffcc;">Welcome, ${teamName}!</h3>
                    <p>Your team has been successfully registered for CODECRYPT.</p>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border: 1px solid #00ff41;">
                    <h3 style="color: #00ffcc;">🔐 Your Credentials:</h3>
                    <p><strong>Team ID:</strong> <code style="background: #0a0a0a; padding: 5px; color: #00ff41;">${teamId}</code></p>
                    <p><strong>Access Code:</strong> <code style="background: #0a0a0a; padding: 5px; color: #00ff41;">${accessCode}</code></p>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #00ffcc;">📅 Event Details:</h3>
                    <ul>
                        <li>Date: ${process.env.EVENT_DATE}</li>
                        <li>Venue: ${process.env.VENUE}</li>
                        <li>Platform: <a href="${process.env.FRONTEND_URL}" style="color: #00ffcc;">${process.env.FRONTEND_URL}</a></li>
                    </ul>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">⚠️ Keep your credentials safe. You'll need them to login on the event day.</p>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                    This is an automated email. Please do not reply.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('❌ Email error:', error);
    }
}

// Email Sender: Switched to EmailJS (HTTP API) to bypass SMTP blocks
// user needs: EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY
async function sendViaEmailJS(toEmail, subject, htmlContent) {
    const endpoint = 'https://api.emailjs.com/api/v1.0/email/send';

    // Construct the payload matching EmailJS API
    const data = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // Required for server-side auth
        template_params: {
            to_email: toEmail,
            subject: subject,
            html_content: htmlContent // Requires {{{html_content}}} in your EmailJS Template
        }
    };

    try {
        console.log(`[EMAILJS] Sending to ${toEmail}...`);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log(`✅ [EMAILJS] Success: ${toEmail}`);
            return true;
        } else {
            const errText = await response.text();
            console.error(`❌ [EMAILJS] Failed: ${response.status} - ${errText}`);
            return false;
        }
    } catch (error) {
        console.error('❌ [EMAILJS] Network Error:', error);
        return false;
    }
}

async function sendAdvantageCodeEmail(email, teamName, code) {
    const subject = `🚀 Final Advantage Code for ${process.env.EVENT_NAME}`;
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border: 2px solid #00ffcc;">
                <h2 style="color: #00ffcc; text-align: center;">ADVANTAGE UNLOCKED</h2>
                <p>Team <strong>${teamName}</strong>,</p>
                <div style="background: linear-gradient(90deg, #333, #000); padding: 20px; text-align: center; border: 1px solid #ffcc00; margin: 20px 0;">
                    <h1 style="color: #ffcc00; font-size: 40px; margin: 0; letter-spacing: 5px;">${code}</h1>
                    <p style="color: #ffcc00; font-size: 14px; margin-top: 15px;">⚠️ Enter this code to unlock the Final Round</p>
                </div>
                <p style="color: #999; font-size: 12px; text-align: center;">Sent by System</p>
            </div>
    `;
    return await sendViaEmailJS(email, subject, html);
}

async function sendRound3AccessCodeEmail(email, teamName, code) {
    const subject = `⚠️ SECURITY ALERT: Round 3 Access Code`;
    const html = `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #000; color: #ff3333; padding: 20px; border: 2px solid #ff3333;">
                <h1 style="color: #ff3333; text-align: center;">SYSTEM BREACH</h1>
                <h3 style="color: #fff; text-align: center;">Team: ${teamName}</h3>
                <div style="background: #111; padding: 30px; margin: 20px 0; border: 1px dotted #ff3333; text-align: center;">
                    <h3 style="color: #fff; margin-bottom: 15px;">🔓 VERIFICATION CODE</h3>
                    <p style="font-size: 32px; font-weight: bold; color: #ff3333; letter-spacing: 3px; margin: 0;">${code}</p>
                </div>
                 <p style="color: #666; font-size: 12px; text-align: center;">Security Subroutine v9.2.1</p>
            </div>
    `;
    return await sendViaEmailJS(email, subject, html);
}

async function sendTeamCredentialsEmail(email, teamName, loginCode) {
    const subject = `🎮 Your CODECRYPT Login Credentials`;
    const html = `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff41; padding: 20px; border: 2px solid #00ff41;">
                <h1 style="color: #00ff41; text-align: center;">CODECRYPT</h1>
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-left: 4px solid #00ff41;">
                    <h3 style="color: #00ffcc;">Welcome, ${teamName}!</h3>
                </div>
                <div style="border: 2px solid #00ff41; padding: 20px; text-align: center;">
                    <h3 style="color: #00ffcc; margin-bottom: 5px;">LOGIN CODE</h3>
                    <p style="font-size: 14px; color: #888; margin-top: 0;">(Use this to log in)</p>
                    <p style="font-size: 36px; font-weight: bold; color: #fff; background: #003300; padding: 10px; display: inline-block;">${loginCode}</p>
                </div>
                <p style="text-align: center; margin-top: 30px; color: #666;">Provide this code to your team members.</p>
            </div>
    `;
    return await sendViaEmailJS(email, subject, html);
}

app.listen(PORT, () => {
    console.log(`CODECRYPT Backend running on port ${PORT}`);
});
