import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';
import {verifyToken,requireAdmin} from '../middlewares/verifytoken.js';
import {asyncRoute as wrap,fail,idValue,transaction,publicQuestion,grade} from '../lib/core.js';
import {settleExpired,finalizeContests,leaderboard} from '../lib/assessments.js';
const router=express.Router();
router.use(verifyToken);
// Contest questions stay unavailable in practice until the contest ends.
const available=`p.published AND NOT EXISTS(SELECT 1 FROM assessments a,jsonb_array_elements(a.questions) q WHERE a.kind='contest' AND a.published AND a.ends_at>NOW() AND q->>'id'=p.id::text)`;
router.get('/dashboard',wrap(async(req,res)=>{
 const [stats,attempts,history,wallet]=await Promise.all([
  pool.query('SELECT COUNT(*)::int AS submissions,COUNT(DISTINCT problem_id) FILTER(WHERE correct)::int AS solved FROM submissions WHERE user_id=$1',[req.user.id]),
  pool.query('SELECT t.id,t.title,t.kind,a.id AS attempt_id,a.score,a.submitted_at,a.deadline FROM attempts a JOIN assessments t ON t.id=a.assessment_id WHERE user_id=$1 ORDER BY a.started_at DESC LIMIT 20',[req.user.id]),
  pool.query('SELECT r.*,a.title FROM rating_history r JOIN assessments a ON a.id=r.assessment_id WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',[req.user.id]),
  pool.query('SELECT delta,reason,created_at FROM coin_transactions WHERE user_id=$1 ORDER BY id DESC LIMIT 20',[req.user.id])
 ]);
 const {session_id,...user}=req.user;
 res.json({user,stats:stats.rows[0],attempts:attempts.rows,ratings:history.rows,transactions:wallet.rows});
}));
router.get('/problems',wrap(async(req,res)=>{
 const search=String(req.query.search||'').slice(0,100),subject=String(req.query.subject||''),difficulty=String(req.query.difficulty||'');
 const {rows}=await pool.query(`SELECT p.id,p.title,p.subject,p.topic,p.difficulty,
 (SELECT COUNT(*)::int FROM submissions s WHERE s.problem_id=p.id) AS attempts,
 (SELECT ROUND(100.0*COUNT(*) FILTER(WHERE correct)/NULLIF(COUNT(*),0)) FROM submissions s WHERE s.problem_id=p.id) AS acceptance,
 EXISTS(SELECT 1 FROM submissions s WHERE s.problem_id=p.id AND s.user_id=$1 AND s.correct) AS solved
 FROM problems p WHERE ${available} AND (p.title ILIKE $2 OR p.topic ILIKE $2) AND ($3='' OR p.subject=$3) AND ($4='' OR p.difficulty=$4) ORDER BY p.id LIMIT 200`,[req.user.id,`%${search}%`,subject,difficulty]);res.json(rows);
}));
router.get('/problems/:id',wrap(async(req,res)=>{
 const {rows}=await pool.query(`SELECT p.* FROM problems p WHERE p.id=$1 AND ${available}`,[idValue(req.params.id)]);
 if(!rows.length)fail(404,'Problem unavailable');res.json(publicQuestion(rows[0]));
}));
router.post('/problems/:id/submit',wrap(async(req,res)=>{
 const answer=req.body.answer;if(!Number.isInteger(answer)||answer<0||answer>3)fail(400,'Choose one answer');
 const {rows}=await pool.query(`SELECT p.* FROM problems p WHERE p.id=$1 AND ${available}`,[idValue(req.params.id)]);
 if(!rows.length)fail(404,'Problem unavailable');const q=rows[0];
 await pool.query('INSERT INTO submissions(user_id,problem_id,answer,correct) VALUES($1,$2,$3,$4)',[req.user.id,q.id,answer,answer===q.answer]);
 res.json({correct:answer===q.answer,answer:q.answer,explanation:q.explanation});
}));
router.get('/assessments',wrap(async(req,res)=>{
 await finalizeContests();
 const {rows}=await pool.query(`SELECT t.id,t.title,t.kind,t.duration_minutes,t.starts_at,t.ends_at,t.finalized,jsonb_array_length(t.questions) AS question_count,a.id AS attempt_id,a.submitted_at FROM assessments t LEFT JOIN attempts a ON a.assessment_id=t.id AND a.user_id=$1 WHERE t.published ORDER BY t.id DESC`,[req.user.id]);res.json({items:rows,serverTime:new Date()});
}));
router.post('/assessments/:id/start',wrap(async(req,res)=>{
 const result=await transaction(async c=>{
  // A user lock also serializes concurrent start requests for a mock.
  await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[req.user.id]);
  const {rows:[t]}=await c.query('SELECT * FROM assessments WHERE id=$1 AND published FOR SHARE',[idValue(req.params.id)]);
  if(!t)fail(404,'Test unavailable');
  const {rows:[existing]}=await c.query('SELECT id FROM attempts WHERE user_id=$1 AND assessment_id=$2',[req.user.id,t.id]);
  if(existing)return existing;
  const now=Date.now();
  if(t.kind==='contest' && (now<+t.starts_at||now>=+t.ends_at))fail(409,'Contest is not currently open');
  // A mock must not reveal questions reserved for a scheduled/live contest.
  if(t.kind==='mock') {
   const {rowCount}=await c.query("SELECT 1 FROM assessments a,jsonb_array_elements(a.questions) q WHERE a.kind='contest' AND a.published AND a.ends_at>NOW() AND q->>'id'=ANY($1)",[t.questions.map(q=>String(q.id))]);
   if(rowCount)fail(409,'This mock is temporarily reserved for a contest');
  }
  const deadline=new Date(Math.min(now+t.duration_minutes*60000,t.kind==='contest'?+t.ends_at:Infinity));
  const {rows:[attempt]}=await c.query('INSERT INTO attempts(user_id,assessment_id,questions,deadline) VALUES($1,$2,$3,$4) RETURNING id',[req.user.id,t.id,JSON.stringify(t.questions),deadline]);return attempt;
 });res.json(result);
}));
router.get('/attempts/:id',wrap(async(req,res)=>{
 await settleExpired();
 const {rows:[a]}=await pool.query('SELECT a.*,t.title,t.kind,t.ends_at FROM attempts a JOIN assessments t ON t.id=a.assessment_id WHERE a.id=$1 AND a.user_id=$2',[idValue(req.params.id),req.user.id]);
 if(!a)fail(404,'Attempt not found');
 const reveal=a.submitted_at && (a.kind==='mock'||Date.now()>=+a.ends_at);
 res.json({...a,questions:a.questions.map(q=>reveal?{...publicQuestion(q),answer:q.answer,explanation:q.explanation}:publicQuestion(q)),serverTime:new Date()});
}));
router.put('/attempts/:id/answers',wrap(async(req,res)=>{
 const result=await transaction(async c=>{
  const {rows:[a]}=await c.query('SELECT * FROM attempts WHERE id=$1 AND user_id=$2 FOR UPDATE',[idValue(req.params.id),req.user.id]);
  if(!a)fail(404,'Attempt not found');if(a.submitted_at||Date.now()>=+a.deadline)fail(409,'Attempt is closed');
  const questionId=String(req.body.questionId),answer=req.body.answer;
  if(!a.questions.some(q=>String(q.id)===questionId)||!(answer===null||Number.isInteger(answer)&&answer>=0&&answer<4))fail(400,'Invalid answer');
  if(answer===null)delete a.answers[questionId];else a.answers[questionId]=answer;
  await c.query('UPDATE attempts SET answers=$1 WHERE id=$2',[JSON.stringify(a.answers),a.id]);return {saved:true};
 });res.json(result);
}));
router.post('/attempts/:id/submit',wrap(async(req,res)=>{
 const a=await transaction(async c=>{
  const {rows:[a]}=await c.query('SELECT * FROM attempts WHERE id=$1 AND user_id=$2 FOR UPDATE',[idValue(req.params.id),req.user.id]);
  if(!a)fail(404,'Attempt not found');
  if(!a.submitted_at) {a.score=grade(a.questions,a.answers);await c.query('UPDATE attempts SET score=$1,submitted_at=LEAST(NOW(),deadline) WHERE id=$2',[a.score,a.id]);}return a;
 });
 req.app.get('io')?.to(`contest:${a.assessment_id}`).emit('leaderboard:update',await leaderboard(a.assessment_id));
 res.json({score:a.score});
}));
router.get('/assessments/:id/leaderboard',wrap(async(req,res)=>{const id=idValue(req.params.id);const {rows:[t]}=await pool.query("SELECT id FROM assessments WHERE id=$1 AND kind='contest' AND published",[id]);if(!t)fail(404,'Contest not found');res.json(await leaderboard(id));}));
router.get('/socket-ticket',wrap(async(req,res)=>res.json({token:jwt.sign({id:req.user.id,session:req.user.session_id},process.env.ACCESS_TOKEN_SECRET,{audience:'socket',expiresIn:'5m'})})));
router.use('/admin',requireAdmin);
router.get('/admin/overview',wrap(async(req,res)=>{
 const [users,problems,assessments]=await Promise.all([pool.query('SELECT id,username,role,coins,rating FROM users ORDER BY id DESC LIMIT 100'),pool.query('SELECT * FROM problems ORDER BY id DESC'),pool.query('SELECT id,title,kind,starts_at,ends_at,finalized,published FROM assessments ORDER BY id DESC')]);res.json({users:users.rows,problems:problems.rows,assessments:assessments.rows});
}));
function validateProblem(b) {
 for(const key of ['title','subject','topic','difficulty','prompt','explanation'])if(typeof b[key]!=='string'||!b[key].trim()||b[key].length>10000)fail(400,`Invalid ${key}`);
 if(!['Physics','Chemistry','Mathematics'].includes(b.subject)||!['Easy','Medium','Hard'].includes(b.difficulty)||!Array.isArray(b.options)||b.options.length!==4||b.options.some(v=>typeof v!=='string'||!v.trim()||v.length>2000)||!Number.isInteger(b.answer)||b.answer<0||b.answer>3)fail(400,'Provide four options and a valid correct answer');
 return [b.title.trim(),b.subject,b.topic.trim(),b.difficulty,b.prompt,JSON.stringify(b.options),b.answer,b.explanation,b.published!==false];
}
router.post('/admin/problems',wrap(async(req,res)=>{const {rows:[q]}=await pool.query('INSERT INTO problems(title,subject,topic,difficulty,prompt,options,answer,explanation,published) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',validateProblem(req.body));res.status(201).json(q);}));
router.put('/admin/problems/:id',wrap(async(req,res)=>{const {rowCount}=await pool.query('UPDATE problems SET title=$1,subject=$2,topic=$3,difficulty=$4,prompt=$5,options=$6,answer=$7,explanation=$8,published=$9 WHERE id=$10',[...validateProblem(req.body),idValue(req.params.id)]);if(!rowCount)fail(404,'Problem not found');res.json({saved:true});}));
router.post('/admin/assessments',wrap(async(req,res)=>{
 const b=req.body;
 if(typeof b.title!=='string'||!b.title.trim()||b.title.length>200||!['mock','contest'].includes(b.kind)||!Number.isInteger(b.duration_minutes)||b.duration_minutes<1||b.duration_minutes>180||!Array.isArray(b.problemIds)||!b.problemIds.length||b.problemIds.length>100)fail(400,'Invalid test details');
 const ids=[...new Set(b.problemIds.map(idValue))];
 const {rows:questions}=await pool.query('SELECT * FROM problems WHERE id=ANY($1::bigint[]) ORDER BY id',[ids]);if(questions.length!==ids.length)fail(400,'Some questions do not exist');
 let starts=null,ends=null;
 if(b.kind==='contest'){
  starts=new Date(b.starts_at);ends=new Date(b.ends_at);
  if(!Number.isFinite(+starts)||!Number.isFinite(+ends)||+starts<=Date.now()||+ends<=+starts)fail(400,'Choose a future start and a later end time');
  if(questions.some(q=>q.published))fail(400,'Contests require unpublished questions to keep answers private');
  const used=await pool.query("SELECT 1 FROM assessments a,jsonb_array_elements(a.questions) q WHERE q->>'id'=ANY($1) UNION ALL SELECT 1 FROM submissions WHERE problem_id=ANY($1::bigint[])",[ids]);
  if(used.rowCount)fail(400,'Contest questions must be fresh and not used in earlier tests or submissions');
 }
 const {rows:[t]}=await pool.query('INSERT INTO assessments(title,kind,duration_minutes,starts_at,ends_at,questions) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',[b.title.trim(),b.kind,b.duration_minutes,starts,ends,JSON.stringify(questions)]);res.status(201).json(t);
}));
router.post('/admin/finalize',wrap(async(req,res)=>res.json({finalized:await finalizeContests()})));
export default router;
