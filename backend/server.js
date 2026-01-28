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
    host: process.env.SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

// Test email connection on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// ==================== AUTHENTICATION ====================

// Team Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { teamName, loginCode } = req.body;

        const [teams] = await pool.query(
            'SELECT * FROM teams WHERE team_name = ? AND login_code = ? AND is_active = TRUE',
            [teamName, loginCode]
        );

        if (teams.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid team name or login code'
            });
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

            // Round 4 Phase 2: Send email with advantage code
            if (round === 4 && stage === 2 && result.triggerEmail) {
                const code = `INT26-R4-${Math.floor(1000 + Math.random() * 9000)}`;

                // Store code in database
                await pool.query(
                    'INSERT INTO physical_codes (team_id, round, code) VALUES (?, 4, ?) ON DUPLICATE KEY UPDATE code = ?, is_used = FALSE',
                    [teamId, code, code]
                );

                // Send email
                await sendAdvantageCodeEmail(team.email, team.team_name, code);

                result.emailSent = true;
                result.code = code; // For testing/debugging
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

// Create Team (Admin)
app.post('/api/admin/create-team', async (req, res) => {
    try {
        const { teamName, email, loginCode } = req.body;

        // Generate team ID
        const teamId = `TM-${Date.now().toString().slice(-6)}`;
        const accessCode = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;

        // Check if team name or email already exists
        const [existing] = await pool.query(
            'SELECT team_id FROM teams WHERE team_name = ? OR email = ?',
            [teamName, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Team name or email already exists'
            });
        }

        // Insert team
        await pool.query(
            'INSERT INTO teams (team_id, team_name, email, login_code, access_code) VALUES (?, ?, ?, ?, ?)',
            [teamId, teamName, email, loginCode, accessCode]
        );

        // Generate physical codes for Round 1 and Round 3
        const round1Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;
        const round3Code = `CRPT-${Math.floor(1000 + Math.random() * 9000)}`;

        await pool.query(
            'INSERT INTO physical_codes (team_id, round, code) VALUES (?, 1, ?), (?, 3, ?)',
            [teamId, round1Code, teamId, round3Code]
        );

        // Send credentials email
        await sendTeamCredentialsEmail(email, teamName, loginCode);

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

        const [teams] = await pool.query(
            'SELECT * FROM teams WHERE team_id = ?',
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

// Toggle Team Active Status (Admin)
app.post('/api/admin/toggle-team', async (req, res) => {
    try {
        const { teamId, isActive } = req.body;

        await pool.query(
            'UPDATE teams SET is_active = ? WHERE team_id = ?',
            [isActive, teamId]
        );

        res.json({
            success: true,
            message: `Team ${isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Toggle team error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
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

async function sendAdvantageCodeEmail(email, teamName, code) {
    const mailOptions = {
        from: `"${process.env.EVENT_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: `🎯 ADVANTAGE CODE - Round 4 Complete!`,
        html: `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff41; padding: 20px; border: 2px solid #00ff41;">
                <h1 style="color: #00ff41; text-align: center; text-shadow: 0 0 10px #00ff41;">CODECRYPT</h1>
                <h2 style="text-align: center; color: #00ffcc;">🎯 ADVANTAGE ROUND COMPLETE</h2>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-left: 4px solid #00ff41;">
                    <h3 style="color: #00ffcc;">Congratulations, ${teamName}!</h3>
                    <p>You have successfully completed both phases of Round 4: SQL Advantage Round.</p>
                    <p style="margin-top: 15px;">✅ Phase 1: Match the Logic - COMPLETE</p>
                    <p>✅ Phase 2: Fix the System - COMPLETE</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a3a0a 100%); padding: 30px; margin: 20px 0; border: 2px solid #00ff41; text-align: center;">
                    <h3 style="color: #00ffcc; margin-bottom: 15px;">🔑 YOUR ADVANTAGE CODE</h3>
                    <div style="background: #0a0a0a; padding: 20px; margin: 15px 0; border: 1px dashed #00ff41;">
                        <p style="font-size: 32px; font-weight: bold; color: #00ff41; letter-spacing: 3px; text-shadow: 0 0 15px #00ff41; margin: 0;">
                            ${code}
                        </p>
                    </div>
                    <p style="color: #ffcc00; font-size: 14px; margin-top: 15px;">⚠️ Enter this code to unlock the Final Round</p>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #00ffcc;">📍 Backup Location:</h3>
                    <p>If you didn't receive this email, visit: <strong style="color: #00ff41;">ADMIN DESK</strong></p>
                    <p style="font-size: 12px; color: #999; margin-top: 10px;">Show this email or your Team ID to get your code.</p>
                </div>
                
                <div style="background: rgba(255, 204, 0, 0.1); padding: 15px; margin: 20px 0; border-left: 4px solid #ffcc00;">
                    <p style="color: #ffcc00; margin: 0;"><strong>⏰ Next Steps:</strong></p>
                    <ol style="color: #ffcc00; margin: 10px 0;">
                        <li>Return to the game platform</li>
                        <li>Enter your advantage code</li>
                        <li>Prepare for the Final Round</li>
                    </ol>
                </div>
                
                <p style="text-align: center; margin-top: 30px; font-size: 18px; color: #00ffcc;">
                    🚀 Good luck in the Final Round!
                </p>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                    This is an automated email from ${process.env.EVENT_NAME}<br>
                    Please do not reply to this message.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Advantage code email sent to ${email} with code: ${code}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

async function sendTeamCredentialsEmail(email, teamName, loginCode) {
    const mailOptions = {
        from: `"${process.env.EVENT_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject: `🎮 Your CODECRYPT Login Credentials`,
        html: `
            <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #00ff41; padding: 20px; border: 2px solid #00ff41;">
                <h1 style="color: #00ff41; text-align: center; text-shadow: 0 0 10px #00ff41;">CODECRYPT</h1>
                <h2 style="text-align: center; color: #00ffcc;">🎮 TEAM CREDENTIALS</h2>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0; border-left: 4px solid #00ff41;">
                    <h3 style="color: #00ffcc;">Welcome to CODECRYPT, ${teamName}!</h3>
                    <p>Your team has been registered for the event. Use the credentials below to login.</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a3a0a 100%); padding: 30px; margin: 20px 0; border: 2px solid #00ff41; text-align: center;">
                    <h3 style="color: #00ffcc; margin-bottom: 15px;">🔐 YOUR LOGIN CREDENTIALS</h3>
                    
                    <div style="background: #0a0a0a; padding: 15px; margin: 15px 0; border: 1px dashed #00ff41;">
                        <p style="color: #00ffcc; margin: 5px 0; font-size: 14px;">TEAM NAME</p>
                        <p style="font-size: 24px; font-weight: bold; color: #00ff41; letter-spacing: 2px; margin: 5px 0;">
                            ${teamName}
                        </p>
                    </div>
                    
                    <div style="background: #0a0a0a; padding: 15px; margin: 15px 0; border: 1px dashed #00ff41;">
                        <p style="color: #00ffcc; margin: 5px 0; font-size: 14px;">LOGIN CODE</p>
                        <p style="font-size: 28px; font-weight: bold; color: #00ff41; letter-spacing: 3px; text-shadow: 0 0 15px #00ff41; margin: 5px 0;">
                            ${loginCode}
                        </p>
                    </div>
                </div>
                
                <div style="background: #1a1a1a; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #00ffcc;">📅 Event Details:</h3>
                    <ul style="line-height: 1.8;">
                        <li>Event: ${process.env.EVENT_NAME}</li>
                        <li>Date: ${process.env.EVENT_DATE}</li>
                        <li>Venue: ${process.env.VENUE}</li>
                        <li>Platform: <a href="${process.env.FRONTEND_URL}" style="color: #00ffcc;">${process.env.FRONTEND_URL}</a></li>
                    </ul>
                </div>
                
                <div style="background: rgba(255, 204, 0, 0.1); padding: 15px; margin: 20px 0; border-left: 4px solid #ffcc00;">
                    <p style="color: #ffcc00; margin: 0;"><strong>⚠️ IMPORTANT:</strong></p>
                    <ul style="color: #ffcc00; margin: 10px 0; line-height: 1.6;">
                        <li>Keep these credentials safe and confidential</li>
                        <li>You will need both Team Name and Login Code to access the system</li>
                        <li>Rounds unlock automatically after completion</li>
                        <li>Your score is based on correctness and speed</li>
                    </ul>
                </div>
                
                <p style="text-align: center; margin-top: 30px; font-size: 18px; color: #00ffcc;">
                    🚀 See you at the event!
                </p>
                
                <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
                    This is an automated email from ${process.env.EVENT_NAME}<br>
                    If you have any questions, contact the admin desk.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Team credentials email sent to ${email} for team: ${teamName}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`CODECRYPT Backend running on port ${PORT}`);
});
