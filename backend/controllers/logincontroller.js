import { loginUsers } from "../models/loginmodel.js";
import { createAccessToken,createRefreshToken,storeRefreshToken } from "../models/JWTtokenmodel.js";
import {cookieOptions} from '../middlewares/verifytoken.js';

export const login = async (req,res) =>{
    const {username,password} = req.body
    try{
        const user = await loginUsers(username,password)
        
        if(user.error){
          return res.status(401).json({error: user.error})
        }
        
        const accessToken = createAccessToken(user.id)
        const refreshToken = createRefreshToken(user.id)
        
        await storeRefreshToken(user.id, refreshToken)
        res.cookie('accessToken',accessToken,{...cookieOptions,maxAge:15*60*1000})
        res.cookie('refreshToken',refreshToken,{...cookieOptions,maxAge:7*24*60*60*1000})

        res.status(200).json(user);
        
    }
    catch(err){
        console.error('Login failed',err.code || err.name);
        res.status(500).json({error:'Login temporarily unavailable'});
    }
}
