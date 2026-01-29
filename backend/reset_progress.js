const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetApp() {
    console.log('🔌 Connecting to database for FULL RESET...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'codecrypt'
    });

    try {
        console.log('🗑️ Clearing progress logs...');
        await pool.query('DELETE FROM team_progress');
        await pool.query('DELETE FROM submissions');

        console.log('🔄 Resetting all teams to Round 1, Stage 0...');
        // Note: Stage 0 and Round 0 often trigger the "Start Round" lobby in this app
        await pool.query('UPDATE teams SET current_round = 1, current_stage = 1, total_score = 0');

        console.log('✅ DATABASE RESET COMPLETE.');
        console.log('Teams will now start from the beginning upon next login/refresh.');

    } catch (err) {
        console.error('❌ Reset Error:', err);
    } finally {
        await pool.end();
    }
}

resetApp();
