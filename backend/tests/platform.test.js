import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,createHmac} from 'node:crypto';
import 'dotenv/config';
import pg from 'pg';
import {io as clientIO} from 'socket.io-client';
// A disposable schema keeps real accounts, coins and test content untouched.
const schema=`pc_test_${randomUUID().replaceAll('-','')}`;
const control=new pg.Client({user:process.env.DB_USER,host:process.env.DB_HOST,database:process.env.DB_NAME,password:process.env.DB_PASSWORD,port:process.env.DB_PORT});
await control.connect();await control.query(`CREATE SCHEMA ${schema}`);
process.env.DB_OPTIONS=`-c search_path=${schema}`;
process.env.ACCESS_TOKEN_SECRET='integration-test-access-secret';process.env.REFRESH_TOKEN_SECRET='integration-test-refresh-secret';
process.env.RAZORPAY_WEBHOOK_SECRET='integration-test-webhook-secret';
// Empty values stay empty if db.js loads dotenv again in a configured developer environment.
process.env.RAZORPAY_KEY_ID='';process.env.RAZORPAY_KEY_SECRET='';
const {default:pool}=await import('../db/db.js');
const {server,io,ticker}=await import('../server.js');
const {grade,eloChanges}=await import('../lib/core.js');
const {validSignature}=await import('../routes/payments.js');
const {createRefreshToken}=await import('../models/JWTtokenmodel.js');
let base,cookie1,cookie2,adminCookie,problemId,mockId,attemptId,contestId,contestAttempt1,contestAttempt2;
const users={};
async function request(path,{cookie,method='GET',body,headers={}}={}) {
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body!==undefined?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});
 const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:r.status,data,cookies:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')};
}
await test('PencilCopy MVP integration',async t=>{
 try {
 await pool.query(await readFile(new URL('../schema.sql',import.meta.url),'utf8'));await pool.query(await readFile(new URL('../migrations/mvp.sql',import.meta.url),'utf8'));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
 await t.test('signup, unique sessions, authentication and role enforcement',async()=>{
  for(const name of ['student1','student2','admin_test']) {
   const r=await request('/users/signup',{method:'POST',body:{username:name,password:'TestPass123!'}});assert.equal(r.status,201,JSON.stringify(r.data));users[name]=r.data.id;
  }
  await pool.query("UPDATE users SET role='admin' WHERE id=$1",[users.admin_test]);
  const login=async name=>{const r=await request('/users/login',{method:'POST',body:{username:name,password:'TestPass123!'}});assert.equal(r.status,200);return r.cookies;};
  cookie1=await login('student1');cookie2=await login('student2');adminCookie=await login('admin_test');
  assert.notEqual(createRefreshToken(users.student1),createRefreshToken(users.student1));
  assert.equal((await request('/api/dashboard')).status,401);
  assert.equal((await request('/api/admin/overview',{cookie:cookie1})).status,403);
  assert.equal((await request('/api/admin/overview',{cookie:adminCookie})).status,200);
  assert.equal((await request('/api/chapters/cn/unlock',{cookie:cookie1,method:'POST',headers:{Origin:'https://evil.example'}})).status,403);
 });
 await t.test('backend chapter authorization and concurrent unlock debit once',async()=>{
  assert.equal((await request('/api/chapters/cn/content',{cookie:cookie1})).status,403);
  const results=await Promise.all([1,2].map(()=>request('/api/chapters/cn/unlock',{cookie:cookie1,method:'POST'})));
  assert.ok(results.every(r=>r.status===200));
  assert.equal((await request('/api/chapters/wallet',{cookie:cookie1})).data.coins,50);
  assert.equal((await request('/api/chapters/cn/content',{cookie:cookie1})).status,200);
  assert.equal((await request('/api/chapters/cn/content',{cookie:cookie2})).status,403);
  assert.equal((await request('/api/chapters/r/unlock',{cookie:cookie2,method:'POST'})).status,409);
 });
 const q={title:'Test complex modulus',subject:'Mathematics',topic:'Complex Numbers',difficulty:'Easy',prompt:'Find |3+4i|',options:['1','2','5','7'],answer:2,explanation:'sqrt(9+16)=5',published:true};
 await t.test('admin question creation and server-side practice scoring',async()=>{
  assert.equal((await request('/api/admin/problems',{cookie:cookie1,method:'POST',body:q})).status,403);
  const r=await request('/api/admin/problems',{cookie:adminCookie,method:'POST',body:q});assert.equal(r.status,201);problemId=r.data.id;
  const detail=await request(`/api/problems/${problemId}`,{cookie:cookie1});assert.equal(detail.data.answer,undefined);assert.equal(detail.data.explanation,undefined);
  assert.equal((await request(`/api/problems/${problemId}/submit`,{cookie:cookie1,method:'POST',body:{answer:2}})).data.correct,true);
  assert.equal((await request(`/api/problems/${problemId}/submit`,{cookie:cookie1,method:'POST',body:{answer:9}})).status,400);
 });
 await t.test('mock start idempotency, ownership, saved answers and immutable submission',async()=>{
  const r=await request('/api/admin/assessments',{cookie:adminCookie,method:'POST',body:{title:'Test mock',kind:'mock',duration_minutes:10,problemIds:[problemId]}});assert.equal(r.status,201);mockId=r.data.id;
  const starts=await Promise.all([1,2].map(()=>request(`/api/assessments/${mockId}/start`,{cookie:cookie1,method:'POST'})));assert.equal(starts[0].data.id,starts[1].data.id);attemptId=starts[0].data.id;
  assert.equal((await request(`/api/attempts/${attemptId}`,{cookie:cookie2})).status,404);
  const open=await request(`/api/attempts/${attemptId}`,{cookie:cookie1});assert.equal(open.data.questions[0].answer,undefined);
  assert.equal((await request(`/api/attempts/${attemptId}/answers`,{cookie:cookie1,method:'PUT',body:{questionId:problemId,answer:2}})).status,200);
  assert.equal((await request(`/api/attempts/${attemptId}/submit`,{cookie:cookie1,method:'POST',body:{score:999}})).data.score,4);
  assert.equal((await request(`/api/attempts/${attemptId}/submit`,{cookie:cookie1,method:'POST'})).data.score,4);
  assert.equal((await request(`/api/attempts/${attemptId}/answers`,{cookie:cookie1,method:'PUT',body:{questionId:problemId,answer:1}})).status,409);
  assert.equal((await request(`/api/attempts/${attemptId}`,{cookie:cookie1})).data.questions[0].answer,2);
 });
 await t.test('server expires attempt and rejects late answers',async()=>{
  const {data:a}=await request(`/api/assessments/${mockId}/start`,{cookie:cookie2,method:'POST'});
  await pool.query("UPDATE attempts SET deadline=NOW()-INTERVAL '1 second' WHERE id=$1",[a.id]);
  assert.equal((await request(`/api/attempts/${a.id}/answers`,{cookie:cookie2,method:'PUT',body:{questionId:problemId,answer:2}})).status,409);
  const expired=await request(`/api/attempts/${a.id}`,{cookie:cookie2});assert.equal(expired.data.score,0);assert.ok(expired.data.submitted_at);
 });
 await t.test('contest scheduling, hidden solutions, settlement and Elo only once',async()=>{
  const {data:cq}=await request('/api/admin/problems',{cookie:adminCookie,method:'POST',body:{...q,title:'Fresh contest question',published:false}});
  const r=await request('/api/admin/assessments',{cookie:adminCookie,method:'POST',body:{title:'Test live contest',kind:'contest',duration_minutes:10,starts_at:new Date(Date.now()+60000),ends_at:new Date(Date.now()+600000),problemIds:[cq.id]}});assert.equal(r.status,201,JSON.stringify(r.data));contestId=r.data.id;
  assert.equal((await request(`/api/assessments/${contestId}/start`,{cookie:cookie1,method:'POST'})).status,409);
  await pool.query("UPDATE assessments SET starts_at=NOW()-INTERVAL '1 second' WHERE id=$1",[contestId]);
  contestAttempt1=(await request(`/api/assessments/${contestId}/start`,{cookie:cookie1,method:'POST'})).data.id;
  contestAttempt2=(await request(`/api/assessments/${contestId}/start`,{cookie:cookie2,method:'POST'})).data.id;
  assert.equal((await request(`/api/problems/${cq.id}`,{cookie:cookie1})).status,404);
  await request(`/api/attempts/${contestAttempt1}/answers`,{cookie:cookie1,method:'PUT',body:{questionId:cq.id,answer:2}});
  await request(`/api/attempts/${contestAttempt1}/submit`,{cookie:cookie1,method:'POST'});
  assert.equal((await request(`/api/attempts/${contestAttempt1}`,{cookie:cookie1})).data.questions[0].answer,undefined);
  await pool.query("UPDATE assessments SET starts_at=NOW()-INTERVAL '2 minutes',ends_at=NOW()-INTERVAL '1 second' WHERE id=$1",[contestId]);
  await pool.query("UPDATE attempts SET deadline=NOW()-INTERVAL '1 second' WHERE id=$1",[contestAttempt2]);
  assert.equal((await request('/api/admin/finalize',{cookie:adminCookie,method:'POST'})).data.finalized,1);
  assert.equal((await request('/api/admin/finalize',{cookie:adminCookie,method:'POST'})).data.finalized,0);
  const {rows}=await pool.query('SELECT old_rating,new_rating,delta FROM rating_history WHERE assessment_id=$1 ORDER BY user_id',[contestId]);assert.deepEqual(rows.map(r=>r.delta),[16,-16]);
  assert.equal((await request(`/api/attempts/${contestAttempt1}`,{cookie:cookie1})).data.questions[0].answer,2);
 });
 await t.test('Socket.IO rejects anonymous clients and delivers authenticated contest scores',async()=>{
  const denied=clientIO(base,{auth:{token:'invalid'},reconnection:false});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Socket auth timeout')),3000);denied.on('connect_error',()=>{clearTimeout(timer);resolve();});});denied.disconnect();
  const {data}=await request('/api/socket-ticket',{cookie:cookie2});
  const socket=clientIO(base,{auth:{token:data.token},reconnection:false});
  try {const scores=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Socket leaderboard timeout')),3000);socket.on('connect',()=>socket.emit('contest:join',contestId,ack=>{if(ack.error)reject(new Error(ack.error));}));socket.on('leaderboard:update',rows=>{clearTimeout(timer);resolve(rows);});socket.on('connect_error',reject);});assert.equal(scores[0].score,4);assert.equal(scores.length,2);}finally{socket.disconnect();}
 });
 await t.test('signed captured payment webhook credits once and rejects tampering',async()=>{
  await pool.query('INSERT INTO payment_orders(id,user_id,amount,coins) VALUES($1,$2,4900,100)',['order_test',users.student1]);
  const event={event:'payment.captured',payload:{payment:{entity:{id:'pay_test',order_id:'order_test',status:'captured',amount:4900,currency:'INR'}}}};
  const body=JSON.stringify(event),signature=createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');
  assert.equal((await request('/api/payments/webhook',{method:'POST',body,headers:{'x-razorpay-signature':'bad'}})).status,400);
  const r=await Promise.all([1,2].map(()=>request('/api/payments/webhook',{method:'POST',body,headers:{'x-razorpay-signature':signature}})));assert.ok(r.every(x=>x.status===200));
  assert.equal((await request('/api/chapters/wallet',{cookie:cookie1})).data.coins,150);
  assert.equal((await request('/api/payments/orders/order_test/reconcile',{cookie:cookie2,method:'POST'})).status,404);
  const {rows:[ledger]}=await pool.query("SELECT COUNT(*)::int n FROM coin_transactions WHERE reason='payment:pay_test'");assert.equal(ledger.n,1);
  assert.equal(validSignature(body+' ',signature,process.env.RAZORPAY_WEBHOOK_SECRET),false);
  assert.equal((await request('/api/payments/packs',{cookie:cookie1})).data.enabled,false);
 });
 await t.test('Checkout order and verification enforce owner, signature, capture and amount',async()=>{
  process.env.RAZORPAY_KEY_ID='rzp_test_example';process.env.RAZORPAY_KEY_SECRET='checkout-secret';
  const originalFetch=globalThis.fetch;let payment={id:'pay_checkout',order_id:'order_checkout',amount:4900,currency:'INR',status:'authorized'};
  globalThis.fetch=async(url,options)=>{
   if(String(url).startsWith('https://api.razorpay.com/v1/')){
    if(String(url).endsWith('/orders')){const body=JSON.parse(options.body);assert.equal(body.amount,4900);return Response.json({id:'order_checkout'});}
    if(String(url).endsWith('/payments/pay_checkout'))return Response.json(payment);
    throw new Error('Unexpected provider request');
   }return originalFetch(url,options);
  };
  try {
   const order=await request('/api/payments/orders',{cookie:cookie1,method:'POST',body:{packId:'starter',amount:1,coins:999999}});assert.equal(order.status,201);assert.equal(order.data.amount,4900);assert.equal(order.data.key,'rzp_test_example');
   const body={razorpay_order_id:'order_checkout',razorpay_payment_id:'pay_checkout',razorpay_signature:createHmac('sha256','checkout-secret').update('order_checkout|pay_checkout').digest('hex')};
   assert.equal((await request('/api/payments/verify',{cookie:cookie2,method:'POST',body})).status,404);
   assert.equal((await request('/api/payments/verify',{cookie:cookie1,method:'POST',body:{...body,razorpay_signature:'0'.repeat(64)}})).status,400);
   assert.equal((await request('/api/payments/verify',{cookie:cookie1,method:'POST',body})).status,409);
   payment={...payment,status:'captured',amount:100};assert.equal((await request('/api/payments/verify',{cookie:cookie1,method:'POST',body})).status,409);
   payment.amount=4900;assert.equal((await request('/api/payments/verify',{cookie:cookie1,method:'POST',body})).data.credited,true);
   assert.equal((await request('/api/payments/verify',{cookie:cookie1,method:'POST',body})).data.alreadyCredited,true);
   assert.equal((await request('/api/chapters/wallet',{cookie:cookie1})).data.coins,250);
  } finally {globalThis.fetch=originalFetch;process.env.RAZORPAY_KEY_ID='';process.env.RAZORPAY_KEY_SECRET='';}
 });
 await t.test('refresh fallback and logout revocation',async()=>{
  const refreshOnly=cookie1.split('; ').filter(c=>c.startsWith('refreshToken=')).join('; ');
  const parallel=await Promise.all([1,2,3].map(()=>request('/users/me',{cookie:refreshOnly})));assert.ok(parallel.every(r=>r.status===200));
  await request('/users/logout',{cookie:cookie1,method:'POST'});assert.equal((await request('/users/me',{cookie:cookie1})).status,401);
 });
 await t.test('scoring and tie policy',()=>{
  assert.equal(grade([{id:'1',answer:0},{id:'2',answer:1},{id:'3',answer:2}],{'1':0,'2':0}),3);
  assert.deepEqual(eloChanges([{user_id:'1',score:4,rating:1200},{user_id:'2',score:4,rating:1200}]).map(p=>p.delta),[0,0]);
 });
 } finally {
  clearInterval(ticker);await new Promise(resolve=>io.close(resolve));await pool.end();await control.query(`DROP SCHEMA ${schema} CASCADE`);await control.end();
 }
});
