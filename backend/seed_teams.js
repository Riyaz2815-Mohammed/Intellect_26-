require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'codecrypt',
    multipleStatements: true
});

async function seedTeams() {
    try {
        const connection = await pool.getConnection();
        console.log('🔌 Connected to database...');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE submissions');
        await connection.query('TRUNCATE TABLE team_progress');
        await connection.query('TRUNCATE TABLE physical_codes');
        await connection.query('TRUNCATE TABLE teams');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // Insert Teams
        console.log('👥 Creating 4 Teams...');
        const teams = [
            ['TM-001', 'Team Alpha', 'alpha@example.com', 'LOGIN-1111', 'ALPHA-001'],
            ['TM-002', 'Team Beta', 'beta@example.com', 'LOGIN-2222', 'BETA-002'],
            ['TM-003', 'Team Gamma', 'gamma@example.com', 'LOGIN-3333', 'GAMMA-003'],
            ['TM-004', 'Team Delta', 'delta@example.com', 'LOGIN-4444', 'DELTA-004']
        ];

        await connection.query(
            'INSERT INTO teams (team_id, team_name, email, login_code, access_code) VALUES ?',
            [teams]
        );

        // Insert Physical Codes (Round 1 & Round 3)
        console.log('🔑 Generating Physical Codes...');
        const codes = [
            ['TM-001', 1, 'CRPT-1111'], ['TM-001', 3, 'CRPT-3311'],
            ['TM-002', 1, 'CRPT-2222'], ['TM-002', 3, 'CRPT-3322'],
            ['TM-003', 1, 'CRPT-3333'], ['TM-003', 3, 'CRPT-3333'],
            ['TM-004', 1, 'CRPT-4444'], ['TM-004', 3, 'CRPT-3344']
        ];

        await connection.query(
            'INSERT INTO physical_codes (team_id, round, code) VALUES ?',
            [codes]
        );

        console.log('✅ SEEDING COMPLETE');
        console.log('---------------------------------------------------');
        console.log('TEAM ALPHA:  Alpha  / LOGIN-1111  (R1: CRPT-1111)');
        console.log('TEAM BETA:   Beta   / LOGIN-2222  (R1: CRPT-2222)');
        console.log('TEAM GAMMA:  Gamma  / LOGIN-3333  (R1: CRPT-3333)');
        console.log('TEAM DELTA:  Delta  / LOGIN-4444  (R1: CRPT-4444)');
        console.log('---------------------------------------------------');
        console.log('ADMIN LOGIN: admin  / admin123');
        console.log('---------------------------------------------------');

        connection.release();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding teams:', error);
        process.exit(1);
    }
}

seedTeams();
