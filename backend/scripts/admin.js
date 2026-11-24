import pool from '../db/db.js';
const username=process.argv[2];
if(!username) {console.error('Usage: npm run admin -- exact_username');process.exit(1);}
try {const r=await pool.query("UPDATE users SET role='admin' WHERE username=$1 RETURNING username",[username]); if(!r.rowCount) throw new Error('User not found. Sign up first.'); console.log('Admin enabled:',r.rows[0].username);} finally {await pool.end();}
