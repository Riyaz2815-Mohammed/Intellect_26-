const mysql = require('mysql2/promise');
require('dotenv').config();

async function setRound5() {
    console.log('🔌 Connecting to database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'codecrypt'
    });

    try {
        // Create 4 test teams, one for each variant
        const variants = [
            { id: 'TM-A001', name: 'Team Alpha (Variant A)', code: 'ALPHA' },
            { id: 'TM-B002', name: 'Team Beta (Variant B)', code: 'BETA' },
            { id: 'TM-C003', name: 'Team Gamma (Variant C)', code: 'GAMMA' },
            { id: 'TM-D004', name: 'Team Delta (Variant D)', code: 'DELTA' }
        ];

        for (const v of variants) {
            console.log(`Setting up ${v.name}...`);
            // Delete existing
            await pool.query('DELETE FROM teams WHERE team_id = ?', [v.id]);

            // Insert new in Round 5
            await pool.query(`
                INSERT INTO teams (team_id, team_name, email, login_code, round, stage, score, is_active)
                VALUES (?, ?, ?, ?, 5, 1, 1000, 1)
            `, [v.id, v.name, `${v.id}@test.com`, v.code]);
        }

        console.log('\n✅ SETUP COMPLETE!');
        console.log('You can now login with:');
        variants.forEach(v => {
            console.log(`  - Team: "${v.name}" | Code: "${v.code}"  -> (Will see Variant ${v.id.charAt(3)})`);
        });

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

setRound5();
