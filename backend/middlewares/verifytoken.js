import jwt from 'jsonwebtoken';
import pool from '../db/db.js';
import {createAccessToken} from '../models/JWTtokenmodel.js';
export const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.NODE_ENV==='production'?'none':'strict',path:'/'};
export async function verifyToken(req,res,next) {
 try {
  const refresh=req.cookies.refreshToken;
  if(!refresh) return res.status(401).json({error:'Please log in'});
  let payload;
  try {payload=jwt.verify(refresh,process.env.REFRESH_TOKEN_SECRET);} catch {return res.status(401).json({error:'Session expired. Please log in again'});}
  const {rows}=await pool.query('SELECT u.id,u.username,u.coins,u.role,u.rating,r.id AS session_id FROM users u JOIN refreshtokens r ON r.user_id=u.id WHERE r.token=$1 AND r.expiry>NOW() AND u.id=$2',[refresh,payload.id]);
  if(!rows.length) return res.status(401).json({error:'Session expired. Please log in again'});
  let valid=false;
  try {valid=String(jwt.verify(req.cookies.accessToken,process.env.ACCESS_TOKEN_SECRET).id)===String(payload.id);} catch { /* Renew from the revocable session. */ }
  if(!valid) res.cookie('accessToken',createAccessToken(payload.id),{...cookieOptions,maxAge:15*60*1000});
  req.user=rows[0];next();
 } catch(e) {next(e);}
}
export function requireAdmin(req,res,next) {if(req.user.role!=='admin') return res.status(403).json({error:'Admin access required'});next();}
