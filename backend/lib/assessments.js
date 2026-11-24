import pool from '../db/db.js';
import {transaction,grade,eloChanges} from './core.js';
export async function settleExpired() {
 await transaction(async c=>{
  const {rows}=await c.query('SELECT * FROM attempts WHERE submitted_at IS NULL AND deadline<=NOW() FOR UPDATE SKIP LOCKED');
  for(const a of rows) await c.query('UPDATE attempts SET score=$1,submitted_at=deadline WHERE id=$2',[grade(a.questions,a.answers),a.id]);
 });
}
export async function finalizeContests() {
 await settleExpired();
 return transaction(async c=>{
  // Serialize rating updates across contests, including multiple server processes.
  await c.query('SELECT pg_advisory_xact_lock(721230)');
  const {rows:contests}=await c.query("SELECT * FROM assessments WHERE kind='contest' AND ends_at<=NOW() AND NOT finalized ORDER BY ends_at,id FOR UPDATE");
  for(const contest of contests) {
   const pending=await c.query('SELECT * FROM attempts WHERE assessment_id=$1 AND submitted_at IS NULL FOR UPDATE',[contest.id]);
   for(const a of pending.rows)await c.query('UPDATE attempts SET score=$1,submitted_at=LEAST(deadline,NOW()) WHERE id=$2',[grade(a.questions,a.answers),a.id]);
   const {rows}=await c.query('SELECT a.user_id,a.score,u.rating FROM attempts a JOIN users u ON u.id=a.user_id WHERE assessment_id=$1 AND submitted_at IS NOT NULL ORDER BY a.user_id FOR UPDATE OF u',[contest.id]);
   for(const p of eloChanges(rows)) {
    await c.query('UPDATE users SET rating=rating+$1 WHERE id=$2',[p.delta,p.user_id]);
    await c.query('INSERT INTO rating_history(user_id,assessment_id,old_rating,new_rating,delta) VALUES($1,$2,$3,$4,$5)',[p.user_id,contest.id,p.rating,p.rating+p.delta,p.delta]);
   }
   await c.query('UPDATE assessments SET finalized=true WHERE id=$1',[contest.id]);
  }
  return contests.length;
 });
}
export async function leaderboard(id) {
 const {rows}=await pool.query('SELECT u.username,a.score,a.submitted_at FROM attempts a JOIN users u ON u.id=a.user_id WHERE assessment_id=$1 AND submitted_at IS NOT NULL ORDER BY a.score DESC,a.submitted_at,a.id LIMIT 100',[id]);
 let rank=0,last;
 return rows.map((r,i)=>{if(r.score!==last)rank=i+1;last=r.score;return {...r,rank};});
}
