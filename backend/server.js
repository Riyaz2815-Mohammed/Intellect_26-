const express = require('express');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'codecrypt',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Email Transporter (using nodemailer)
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ==================== AUTHENTICATION ====================

// Team Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { teamId, accessCode } = req.body;

        const [teams] = await pool.query(
            'SELECT * FROM teams WHERE team_id = ? AND access_code = ? AND is_active = TRUE',
            [teamId, accessCode]
        );

        if (teams.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const team = teams[0];
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
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== TEAM MANAGEMENT ====================

// Register Team
app.post('/api/teams/register', async (req, res) => {
    try {
        const { teamId, teamName, email, accessCode } = req.body;

        // Check if team already exists
        const [existing] = await pool.query(
            'SELECT team_id FROM teams WHERE team_id = ? OR email = ?',
            [teamId, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Team ID or Email already exists' });
        }

        // Insert team
        await pool.query(
            'INSERT INTO teams (team_id, team_name, email, access_code) VALUES (?, ?, ?, ?)',
            [teamId, teamName, email, accessCode]
        );

        // Generate physical codes
        const round1Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round3Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;

        await pool.query(
            'INSERT INTO physical_codes (team_id, round, code) VALUES (?, 1, ?), (?, 3, ?)',
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

// Get Team State
app.get('/api/teams/:teamId/state', async (req, res) => {
    try {
        const { teamId } = req.params;

        const [teams] = await pool.query(
            'SELECT * FROM teams WHERE team_id = ?',
            [teamId]
        );

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = teams[0];
        res.json({
            round: team.current_round,
            stage: team.current_stage,
            score: team.total_score
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
        const [teams] = await pool.query(
            'SELECT * FROM teams WHERE team_id = ?',
            [teamId]
        );

        if (teams.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = teams[0];

        // Validate answer (import your GameService logic here)
        const GameService = require('./gameService');
        const result = GameService.validateSubmission(round, stage, answer);

        // Log submission
        await pool.query(
            'INSERT INTO submissions (team_id, round, stage, submitted_answer, is_correct, points_awarded, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [teamId, round, stage, answer, result.success, result.points || 0, result.message]
        );

        if (result.success) {
            // Update team progress
            const newScore = team.total_score + (result.points || 0);
            const nextStage = stage + 1;

            await pool.query(
                'UPDATE teams SET total_score = ?, current_stage = ? WHERE team_id = ?',
                [newScore, nextStage, teamId]
            );

            // Mark stage as completed
            await pool.query(
                'INSERT INTO team_progress (team_id, round, stage, status, completed_at) VALUES (?, ?, ?, \'completed\', NOW()) ON DUPLICATE KEY UPDATE status = \'completed\', completed_at = NOW()',
                [teamId, round, stage]
            );

            // Round 4 Special: Send email with advantage code
            if (round === 4 && stage === 1 && result.triggerEmail) {
                const code = `INT26-R4-${Math.floor(1000 + Math.random() * 9000)}`;

                // Store code in database
                await pool.query(
                    'INSERT INTO physical_codes (team_id, round, code) VALUES (?, 4, ?) ON DUPLICATE KEY UPDATE code = ?, is_used = FALSE',
                    [teamId, code, code]
                );

                // Send email
                await sendAdvantageCodeEmail(team.email, team.team_name, code);

                result.emailSent = true;
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Physical Code
app.get('/api/game/physical-code/:teamId/:round', async (req, res) => {
    try {
        const { teamId, round } = req.params;

        const [codes] = await pool.query(
            'SELECT code FROM physical_codes WHERE team_id = ? AND round = ? AND is_used = FALSE',
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

        const [codes] = await pool.query(
            'SELECT * FROM physical_codes WHERE team_id = ? AND round = ? AND code = ? AND is_used = FALSE',
            [teamId, round, code]
        );

        if (codes.length === 0) {
            return res.json({ success: false, message: 'Invalid or already used code' });
        }

        // Mark as used
        await pool.query(
            'UPDATE physical_codes SET is_used = TRUE, used_at = NOW() WHERE id = ?',
            [codes[0].id]
        );

        res.json({ success: true, message: 'Code validated successfully' });
    } catch (error) {
        console.error('Validate code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ADMIN ENDPOINTS ====================

// Get Leaderboard
app.get('/api/admin/leaderboard', async (req, res) => {
    try {
        const [leaderboard] = await pool.query('SELECT * FROM leaderboard');
        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Teams
app.get('/api/admin/teams', async (req, res) => {
    try {
        const [teams] = await pool.query(
            'SELECT team_id, team_name, email, current_round, current_stage, total_score, is_active FROM teams ORDER BY total_score DESC'
        );
        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Override Team State
app.post('/api/admin/override', async (req, res) => {
    try {
        const { teamId, round, stage, score } = req.body;

        await pool.query(
            'UPDATE teams SET current_round = ?, current_stage = ?, total_score = ? WHERE team_id = ?',
            [round, stage, score, teamId]
        );

        res.json({ success: true, message: 'Team state updated' });
    } catch (error) {
        console.error('Override error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== EMAIL FUNCTIONS ====================

async function sendWelcomeEmail(email, teamName, teamId, accessCode) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to CODECRYPT - Intellect \'26',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #00ff41;">CODECRYPT - Intellect '26</h1>
                <h2>Welcome, ${teamName}!</h2>
                <p>Your team has been successfully registered for CODECRYPT.</p>
                
                <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #00ff41;">
                    <h3>Your Credentials:</h3>
                    <p><strong>Team ID:</strong> ${teamId}</p>
                    <p><strong>Access Code:</strong> ${accessCode}</p>
                </div>
                
                <p><strong>Event Details:</strong></p>
                <ul>
                    <li>Date: [EVENT_DATE]</li>
                    <li>Venue: [VENUE]</li>
                    <li>Platform: <a href="http://localhost:5173">http://localhost:5173</a></li>
                </ul>
                
                <p>Keep your credentials safe. You'll need them to login on the event day.</p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This is an automated email. Please do not reply.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Email error:', error);
    }
}

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`CODECRYPT Backend running on port ${PORT}`);
});
