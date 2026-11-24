import  jwt  from "jsonwebtoken";
import pool from "../db/db.js";
import {randomUUID} from 'node:crypto';

export const createAccessToken = (id) => {
    return jwt.sign({id},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '15m'})
}

export const createRefreshToken =  (id) =>{
    return jwt.sign({id},process.env.REFRESH_TOKEN_SECRET,{expiresIn: '7d',jwtid:randomUUID()})
}


export const storeRefreshToken = async (userId , refreshToken) => {
   const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
        `insert into refreshTokens (user_id,token,expiry) values ($1,$2,$3)`,
        [userId,refreshToken,expiry]
    );
}

export const findRefreshToken = async (refreshToken) => {
     const result = await pool.query(
        `select * from refreshTokens where token = $1`,
        [refreshToken]
     )
     return result.rows[0];
}

export const deleteRefreshToken = async (refreshToken) => {
    await pool.query(
        `delete from refreshTokens where token = $1`,
        [refreshToken]
    );
}
