import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const {Pool}=pg;

const pool = new Pool({
  ...(process.env.DATABASE_URL
    ? {connectionString: process.env.DATABASE_URL}
    : {user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME,
       password: process.env.DB_PASSWORD, port: process.env.DB_PORT}),
  options: process.env.DB_OPTIONS,
  max: 10,
  connectionTimeoutMillis: 5000,
})

export default pool;
