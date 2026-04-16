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

async function checkFoodLogs() {
    try {
        const columnsRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'food_logs'
        `);
        console.table(columnsRes.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkFoodLogs();
