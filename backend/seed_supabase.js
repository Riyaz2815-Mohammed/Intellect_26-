require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase connections
});

async function seedTeams() {
    const client = await pool.connect();

    try {
        console.log('🔌 Connected to Supabase...');

        // Start transaction
        await client.query('BEGIN');

        // Clear existing data (Order matters due to foreign keys)
        console.log('🧹 Clearing existing data...');
        await client.query('TRUNCATE TABLE submissions CASCADE');
        await client.query('TRUNCATE TABLE team_progress CASCADE');
        await client.query('TRUNCATE TABLE physical_codes CASCADE');
        await client.query('TRUNCATE TABLE teams CASCADE');

        // Insert Teams (Alpha, Beta, Gamma, Delta)
        console.log('👥 Creating 4 Teams...');
        const teamsQuery = `
            INSERT INTO teams (team_id, team_name, email, login_code, access_code)
            VALUES 
            ($1, $2, $3, $4, $5),
            ($6, $7, $8, $9, $10),
            ($11, $12, $13, $14, $15),
            ($16, $17, $18, $19, $20)
        `;

        const teamValues = [
            'TM-001', 'Team Alpha', 'alpha@example.com', 'LOGIN-1111', 'ALPHA-001',
            'TM-002', 'Team Beta', 'beta@example.com', 'LOGIN-2222', 'BETA-002',
            'TM-003', 'Team Gamma', 'gamma@example.com', 'LOGIN-3333', 'GAMMA-003',
            'TM-004', 'Team Delta', 'delta@example.com', 'LOGIN-4444', 'DELTA-004'
        ];

        await client.query(teamsQuery, teamValues);

        // Insert Physical Codes
        console.log('🔑 Generating Physical Codes...');
        const codesQuery = `
            INSERT INTO physical_codes (team_id, round, code)
            VALUES
            ($1, 1, $2), ($1, 3, $3),
            ($4, 1, $5), ($4, 3, $6),
            ($7, 1, $8), ($7, 3, $9),
            ($10, 1, $11), ($10, 3, $12)
        `;

        const codeValues = [
            'TM-001', 'CRPT-1111', 'CRPT-3311',
            'TM-002', 'CRPT-2222', 'CRPT-3322',
            'TM-003', 'CRPT-3333', 'CRPT-3355',
            'TM-004', 'CRPT-4444', 'CRPT-3344'
        ];

        await client.query(codesQuery, codeValues);

        // Commit transaction
        await client.query('COMMIT');

        console.log('✅ SEEDING COMPLETE');
        console.log('---------------------------------------------------');
        console.log('TEAM ALPHA:  Alpha  / LOGIN-1111');
        console.log('TEAM BETA:   Beta   / LOGIN-2222');
        console.log('TEAM GAMMA:  Gamma  / LOGIN-3333');
        console.log('TEAM DELTA:  Delta  / LOGIN-4444');
        console.log('---------------------------------------------------');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding teams:', error);
    } finally {
        client.release();
        pool.end();
    }
}

seedTeams();
