require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 // Fail fast if cannot connect
});

async function setupSchema() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to Supabase. Running Schema Migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, '../database/supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Run schema
        await client.query(schemaSql);

        console.log('✅ Schema migrated successfully.');
        console.log('---------------------------------------------------');
        console.log('Tables created: teams, team_progress, submissions, etc.');

    } catch (error) {
        console.error('❌ Schema setup error:', error);
    } finally {
        client.release();
        pool.end();
    }
}

setupSchema();
