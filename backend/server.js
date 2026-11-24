import {createServer} from 'node:http';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './db/db.js';
import {app,origin} from './app.js';
import {finalizeContests,leaderboard} from './lib/assessments.js';
export const server=createServer(app);
export const io=new Server(server,{cors:{origin,credentials:true},allowRequest:(req,cb)=>cb(null,!req.headers.origin||req.headers.origin===origin)});
app.set('io',io);
io.use(async(socket,next)=>{
 try {
  const p=jwt.verify(socket.handshake.auth.token,process.env.ACCESS_TOKEN_SECRET,{audience:'socket'});
  const {rowCount}=await pool.query('SELECT 1 FROM refreshtokens WHERE id=$1 AND user_id=$2 AND expiry>NOW()',[p.session,p.id]);
  if(!rowCount)throw new Error();socket.data.userId=p.id;socket.data.session=p.session;next();
 }catch {next(new Error('Please log in again'));}
});
io.on('connection',socket=>{
 socket.on('contest:join',async(id,ack)=>{
  const reply=typeof ack==='function'?ack:()=>{};
  try {
   if(!/^\d+$/.test(String(id)))return reply({error:'Invalid contest'});
   const {rowCount}=await pool.query("SELECT 1 FROM assessments a WHERE a.id=$1 AND a.kind='contest' AND a.published AND EXISTS(SELECT 1 FROM refreshtokens WHERE id=$2 AND user_id=$3 AND expiry>NOW())",[id,socket.data.session,socket.data.userId]);
   if(!rowCount)return reply({error:'Contest unavailable'});
   for(const room of socket.rooms)if(room.startsWith('contest:'))socket.leave(room);
   socket.join(`contest:${id}`);reply({ok:true});socket.emit('leaderboard:update',await leaderboard(id));
  }catch {reply({error:'Could not join contest'});}
 });
});
let running=false;
export const ticker=setInterval(async()=>{
 if(running)return;running=true;
 try {await finalizeContests();for(const room of io.sockets.adapter.rooms.keys())if(room.startsWith('contest:'))io.to(room).emit('leaderboard:update',await leaderboard(room.slice(8)));}
 catch(e){console.error('Contest settlement failed',e.code||e.message);}finally{running=false;}
},5000);ticker.unref();
