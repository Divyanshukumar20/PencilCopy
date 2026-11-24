import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {rateLimit} from 'express-rate-limit';
import userRoutes from './routes/routes.js';
import chapters from './routes/chapters.js';
import platform from './routes/platform.js';
import payments,{webhook} from './routes/payments.js';
export const origin=process.env.FRONTEND_ORIGIN||'http://localhost:5173';
if(process.env.NODE_ENV==='production'&&!process.env.FRONTEND_ORIGIN)throw new Error('Set FRONTEND_ORIGIN for production');
export const app=express();
app.disable('x-powered-by');
app.use(cors({origin,credentials:true}));
app.post('/api/payments/webhook',express.raw({type:'application/json',limit:'256kb'}),webhook);
app.use(express.json({limit:'256kb'}));app.use(cookieParser());
app.use((req,res,next)=>{
 res.setHeader('Cache-Control','no-store');
 if(!['GET','HEAD','OPTIONS'].includes(req.method)&&
    (req.headers.origin?req.headers.origin!==origin:process.env.NODE_ENV==='production'))return res.status(403).json({error:'Origin not allowed'});
 next();
});
app.use('/api',rateLimit({windowMs:60000,limit:300,message:{error:'Too many requests. Please slow down.'}}));
app.get('/',(req,res)=>res.json({service:'PencilCopy',status:'ok'}));
app.use('/users',userRoutes);app.use('/api/chapters',chapters);app.use('/api/payments',payments);app.use('/api',platform);
app.use((req,res)=>res.status(404).json({error:'Route not found'}));
app.use((err,req,res,next)=>{
 if(res.headersSent)return next(err);
 const status=err.status|| (err.code==='23505'?409:500);
 if(status>=500)console.error(err.code||err.name,err.message);
 res.status(status).json({error:err.code==='23505'?'This record already exists':status<500?err.message:'Something went wrong. Please try again.'});
});
