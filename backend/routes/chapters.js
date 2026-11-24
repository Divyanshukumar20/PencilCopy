import express from 'express';
import pool from '../db/db.js';
import {readFile} from 'node:fs/promises';
import { verifyToken } from '../middlewares/verifytoken.js';
import {asyncRoute} from '../lib/core.js';
const router = express.Router();
router.use(verifyToken);

router.get('/', async(req,res)=>{
 try {
  const result=await pool.query(`SELECT c.id,c.slug,c.title,c.subject,c.coin_cost,
   (u.chapter_id IS NOT NULL) AS unlocked FROM chapters c
   LEFT JOIN chapter_unlocks u ON u.chapter_id=c.id AND u.user_id=$1
   ORDER BY c.id`,[req.user.id]);
  res.json(result.rows);
 } catch(e){ console.error(e);res.status(500).json({error:'Could not load chapters'}); }
});
router.get('/wallet', async(req,res)=>{
 try {
  const r=await pool.query('SELECT coins FROM users WHERE id=$1',[req.user.id]);
  if(!r.rowCount)return res.status(401).json({error:'Unknown user'});
  res.json({coins:r.rows[0].coins});
 } catch(e){console.error(e);res.status(500).json({error:'Could not load wallet'});}
});
router.get('/:slug/access',async(req,res)=>{
 try {
  const r=await pool.query(`SELECT c.id,c.title,c.slug,c.coin_cost,
   (EXISTS(SELECT 1 FROM chapter_unlocks x WHERE x.chapter_id=c.id AND x.user_id=$1)) AS unlocked
   FROM chapters c WHERE c.slug=$2`,[req.user.id,req.params.slug]);
  if(!r.rowCount)return res.status(404).json({error:'Chapter not found'});
  res.json(r.rows[0]);
 } catch(e){console.error(e);res.status(500).json({error:'Could not check access'});}
});
router.get('/:slug/content',async(req,res)=>{
 try{
  const r=await pool.query(`SELECT 1 FROM chapter_unlocks x JOIN chapters c ON c.id=x.chapter_id WHERE x.user_id=$1 AND c.slug=$2`,[req.user.id,req.params.slug]);
  if(!r.rowCount)return res.status(403).json({error:'Unlock chapter first'});
  if(req.params.slug!=='cn')return res.status(404).json({error:'Content not published'});
  const content=JSON.parse(await readFile(new URL('../content/complexNumbers.json',import.meta.url),'utf8'));
  res.setHeader('Cache-Control','private, no-store');
  res.json(content);
 }catch(e){console.error(e);res.status(500).json({error:'Could not load content'});}
});
router.post('/:slug/unlock' ,asyncRoute(async(req,res)=>{
 const client=await pool.connect();
 try {
  await client.query('BEGIN');
  const user=await client.query('SELECT coins FROM users WHERE id=$1 FOR UPDATE',[req.user.id]);
  if(!user.rowCount){await client.query('ROLLBACK');return res.status(401).json({error:'Unknown user'});}
  const chapter=await client.query('SELECT id,coin_cost FROM chapters WHERE slug=$1',[req.params.slug]);
  if(!chapter.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Chapter not found'});}
  const {id,coin_cost}=chapter.rows[0];
  if(req.params.slug!=='cn'){await client.query('ROLLBACK');return res.status(409).json({error:'This chapter is not published yet'});}
  const exists=await client.query('SELECT 1 FROM chapter_unlocks WHERE user_id=$1 AND chapter_id=$2',[req.user.id,id]);
  if(exists.rowCount){await client.query('COMMIT');return res.json({unlocked:true,alreadyOwned:true,coins:user.rows[0].coins});}
  if(user.rows[0].coins < coin_cost){await client.query('ROLLBACK');return res.status(402).json({error:'Not enough coins',needed:coin_cost,coins:user.rows[0].coins});}
  await client.query('UPDATE users SET coins=coins-$1 WHERE id=$2',[coin_cost,req.user.id]);
  await client.query('INSERT INTO chapter_unlocks(user_id,chapter_id) VALUES($1,$2)',[req.user.id,id]);
  await client.query('INSERT INTO coin_transactions(user_id,delta,reason,chapter_id) VALUES($1,$2,$3,$4)',[req.user.id,-coin_cost,'chapter_unlock',id]);
  await client.query('COMMIT');
  res.json({unlocked:true,coins:user.rows[0].coins-coin_cost});
 }catch(e){await client.query('ROLLBACK');console.error(e);res.status(500).json({error:'Unlock failed'});}
 finally{client.release();}
}));
export default router;
