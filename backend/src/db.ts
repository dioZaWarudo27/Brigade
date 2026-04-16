import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.DATABASE_URL) {
    console.log("🟢 Database: DATABASE_URL detected.");
} else {
    console.warn("⚠️ Database: DATABASE_URL NOT detected. Falling back to individual credentials.");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'GymTracker'),
    password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || '12345678'),
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
