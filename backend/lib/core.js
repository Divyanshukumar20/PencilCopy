import pool from '../db/db.js';
export const asyncRoute = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export const fail = (status,message) => { const e = new Error(message); e.status=status; throw e; };
export const idValue = value => { if (!/^\d+$/.test(String(value))) fail(400,'Invalid ID'); return String(value); };
export async function transaction(fn) {
 const c=await pool.connect();
 try { await c.query('BEGIN'); const result=await fn(c); await c.query('COMMIT'); return result; }
 catch(e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}
export const publicQuestion = q => ({id:q.id,title:q.title,subject:q.subject,topic:q.topic,difficulty:q.difficulty,prompt:q.prompt,options:q.options});
export function grade(questions,answers) {
 return questions.reduce((score,q)=>score+(answers[q.id] === undefined ? 0 : Number(answers[q.id])===q.answer ? 4 : -1),0);
}
export function eloChanges(players) {
 if(players.length<2) return players.map(p=>({...p,delta:0}));
 return players.map(p=>({...p,delta:Math.round(32*players.filter(o=>o.user_id!==p.user_id).reduce((sum,o)=>sum+(p.score>o.score?1:p.score===o.score?.5:0)-1/(1+10**((o.rating-p.rating)/400)),0)/(players.length-1))}));
}
