import pool from "../db/db.js";
import bcrypt from 'bcrypt';

export const signUpUser = async (username,password) =>{
    
    const existedUser = await pool.query(
        'select * from users where username = $1',
        [username]
    )
    if(existedUser.rows.length > 0){
        return {error: "User isn't available.Try another"}
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `insert into users(username,hashedpassword) values ($1,$2) returning id,username,coins,role`,
        [username,hashedPassword]
    )
    return result.rows[0]
}
