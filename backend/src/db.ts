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
    user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || ''),
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || ''),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || ''),
    password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || ''),
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || ''),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
