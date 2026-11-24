import {readFile} from 'node:fs/promises';
import pool from '../db/db.js';
import {transaction} from '../lib/core.js';
try {
 await transaction(async c=>{ await c.query(await readFile(new URL('../schema.sql',import.meta.url),'utf8')); await c.query(await readFile(new URL('../migrations/mvp.sql',import.meta.url),'utf8')); });
 console.log('MVP schema ready');
} finally { await pool.end(); }
