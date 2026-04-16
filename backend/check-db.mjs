import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'GymTracker',
    password: process.env.DB_PASSWORD || '12345678',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkDB() {
    try {
        console.log("Checking database connection...");
        const res = await pool.query('SELECT NOW()');
        console.log("Connection Success! Current time in DB:", res.rows[0].now);

        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables found:", tablesRes.rows.map(r => r.table_name).join(', '));

        for (const table of ['posts', 'post_images', 'post_workouts', 'gym']) {
            console.log(`\n--- Schema for table: ${table} ---`);
            const columnsRes = await pool.query(`
                SELECT column_name, data_type, is_nullable, character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            console.table(columnsRes.rows);
            
            const constraintsRes = await pool.query(`
                SELECT
                    tc.constraint_name, 
                    tc.table_name, 
                    kcu.column_name, 
                    tc.constraint_type
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                WHERE tc.table_name = $1;
            `, [table]);
            console.log("Constraints:");
            console.table(constraintsRes.rows);
        }

        process.exit(0);
    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
}

checkDB();
