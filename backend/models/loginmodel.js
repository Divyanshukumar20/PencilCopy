import pool from "../db/db.js"
import bcrypt from 'bcrypt';

export const loginUsers = async (username,password) =>{
    const result = await pool.query(
        `select * from users where username = $1`,
        [username]
    )

    if(result.rows.length === 0){
        return {error : "Invalid Credentials"}
    }
    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.hashedpassword)
    
    if(!valid){
        return {error : "Invalid Credentials"}
    }
    return {id:user.id,username:user.username,coins:user.coins,role:user.role};
}

export const idToUsername = async (id) =>{
    const user = await pool.query(
        'select username from users where id = $1',
        [id]
    )
    return user.rows[0].username;
}