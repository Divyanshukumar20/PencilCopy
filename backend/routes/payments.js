import express from 'express';
import {createHmac,timingSafeEqual} from 'node:crypto';
import pool from '../db/db.js';
import {verifyToken} from '../middlewares/verifytoken.js';
import {asyncRoute as wrap,transaction,fail} from '../lib/core.js';
export const packs=[{id:'starter',coins:100,amount:4900},{id:'practice',coins:300,amount:12900}];
// Do not offer checkout until both server verification and webhook recovery work.
const configured=()=>Boolean(process.env.RAZORPAY_KEY_ID&&process.env.RAZORPAY_KEY_SECRET&&process.env.RAZORPAY_WEBHOOK_SECRET);
export function validSignature(data,signature,secret) {
 if(!secret||typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature))return false;
 return timingSafeEqual(Buffer.from(createHmac('sha256',secret).update(data).digest('hex'),'hex'),Buffer.from(signature,'hex'));
}
async function razorpay(path,body) {
 if(!configured())fail(503,'Payments are not configured yet');
 const response=await fetch(`https://api.razorpay.com/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)fail(502,'Payment provider unavailable. Please retry later');return response.json();
}
export async function creditPayment(payment,userId) {
 return transaction(async c=>{
  const {rows:[order]}=await c.query('SELECT * FROM payment_orders WHERE id=$1 FOR UPDATE',[payment.order_id]);
  if(!order)fail(404,'Order not found');
  if(userId && String(order.user_id)!==String(userId))fail(403,'Order belongs to another account');
  if(payment.status!=='captured'||payment.amount!==order.amount||payment.currency!==order.currency||typeof payment.id!=='string')fail(409,'Payment has not been captured for the expected amount');
  if(order.status==='paid') {
   if(order.payment_id!==payment.id)fail(409,'Order already credited with a different payment');
   return {credited:true,alreadyCredited:true};
  }
  await c.query("UPDATE payment_orders SET status='paid',payment_id=$1 WHERE id=$2",[payment.id,order.id]);
  await c.query('UPDATE users SET coins=coins+$1 WHERE id=$2',[order.coins,order.user_id]);
  await c.query('INSERT INTO coin_transactions(user_id,delta,reason) VALUES($1,$2,$3)',[order.user_id,order.coins,`payment:${payment.id}`]);return {credited:true,coinsAdded:order.coins};
 });
}
export const webhook=wrap(async(req,res)=>{
 if(!validSignature(req.body,req.headers['x-razorpay-signature'],process.env.RAZORPAY_WEBHOOK_SECRET))fail(400,'Invalid webhook signature');
 const event=JSON.parse(req.body.toString('utf8'));
 if(event.event==='payment.captured')await creditPayment(event.payload.payment.entity);
 res.json({received:true});
});
const router=express.Router();router.use(verifyToken);
router.get('/packs',(req,res)=>res.json({enabled:configured(),packs}));
router.get('/orders',wrap(async(req,res)=>{const {rows}=await pool.query('SELECT id,coins,amount,status,created_at FROM payment_orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',[req.user.id]);res.json(rows);}));
router.post('/orders',wrap(async(req,res)=>{
 if(!configured())fail(503,'Payments are not configured yet');
 const pack=packs.find(p=>p.id===req.body.packId);if(!pack)fail(400,'Choose a valid coin pack');
 const order=await razorpay('orders',{amount:pack.amount,currency:'INR',receipt:`pc_${req.user.id}_${Date.now()}`});
 await pool.query('INSERT INTO payment_orders(id,user_id,amount,coins) VALUES($1,$2,$3,$4)',[order.id,req.user.id,pack.amount,pack.coins]);
 res.status(201).json({id:order.id,amount:pack.amount,currency:'INR',key:process.env.RAZORPAY_KEY_ID});
}));
router.post('/verify',wrap(async(req,res)=>{
 const {razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:signature}=req.body||{};
 if(typeof orderId!=='string'||typeof paymentId!=='string'||!/^pay_[a-zA-Z0-9]+$/.test(paymentId))fail(400,'Invalid payment details');
 const {rows:[order]}=await pool.query('SELECT id FROM payment_orders WHERE id=$1 AND user_id=$2',[orderId,req.user.id]);if(!order)fail(404,'Order not found');
 if(!validSignature(`${order.id}|${paymentId}`,signature,process.env.RAZORPAY_KEY_SECRET))fail(400,'Invalid payment signature');
 const payment=await razorpay(`payments/${paymentId}`);if(payment.order_id!==order.id)fail(400,'Payment order mismatch');
 res.json(await creditPayment(payment,req.user.id));
}));
// Reconcile captured payments when a user closes Checkout before its callback arrives.
router.post('/orders/:id/reconcile',wrap(async(req,res)=>{
 const {rows:[order]}=await pool.query('SELECT * FROM payment_orders WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!order)fail(404,'Order not found');
 if(order.status==='paid')return res.json({credited:true});
 const payments=await razorpay(`orders/${encodeURIComponent(order.id)}/payments`);
 const captured=payments.items.find(p=>p.status==='captured'&&p.order_id===order.id);
 if(!captured)fail(409,'No captured payment yet. Try again shortly');res.json(await creditPayment(captured,req.user.id));
}));
export default router;
