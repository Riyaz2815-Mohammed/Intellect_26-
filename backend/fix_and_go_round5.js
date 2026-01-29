const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixAndSetup() {
    console.log('🔌 Connecting to database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'codecrypt'
    });

    try {
        console.log('🛠️ Checking/updating schema...');

        // Add columns if they usually exist (using stored procedures or just try-catch ALTERs is simpler here)
        // We'll just try to add them. If they exist, it errors, which we ignore.
        const alters = [
            "ALTER TABLE teams ADD COLUMN round INT DEFAULT 1",
            "ALTER TABLE teams ADD COLUMN stage INT DEFAULT 1",
            "ALTER TABLE teams ADD COLUMN score INT DEFAULT 0",
            "ALTER TABLE teams ADD COLUMN is_active BOOLEAN DEFAULT 1"
        ];

        for (const sql of alters) {
            try {
                await pool.query(sql);
                console.log(`  Processed: ${sql}`);
            } catch (e) {
                // Ignore "duplicate column" errors
                if (e.code !== 'ER_DUP_FIELDNAME') console.log(`  Note on ${sql}: ${e.message}`);
            }
        }

        console.log('✅ Schema updated.');

        // NOW SETUP ROUND 5 TEAMS
        const variants = [
            { id: 'TM-A001', name: 'Team Alpha', code: 'ALPHA' },
            { id: 'TM-B002', name: 'Team Beta', code: 'BETA' },
            { id: 'TM-C003', name: 'Team Gamma', code: 'GAMMA' },
            { id: 'TM-D004', name: 'Team Delta', code: 'DELTA' }
        ];

        for (const v of variants) {
            console.log(`Setting up ${v.name}...`);
            await pool.query('DELETE FROM teams WHERE team_id = ?', [v.id]);
            await pool.query(`
                INSERT INTO teams (team_id, team_name, email, login_code, access_code, current_round, current_stage, total_score, is_active)
                VALUES (?, ?, ?, ?, ?, 5, 1, 1000, 1)
            `, [v.id, v.name, `${v.id}@test.com`, v.code, `ACC-${v.code}`]);
        }

        console.log('\n✅ ROUND 5 READY! LOGIN WITH:');
        console.table(variants.map(v => ({ User: v.name, LoginCode: v.code })));

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

fixAndSetup();
