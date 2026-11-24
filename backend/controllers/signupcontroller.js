import { signUpUser } from "../models/signupmodel.js";
import pool from "../db/db.js";

export const signup = async (req,res) =>{
    const {username,password} = req.body

    try{
        const newUser = await signUpUser(username, password)
        if (newUser.error) {
            return res.status(400).json({ error: newUser.error })
        }
        res.status(201).json(newUser)
    }
    catch(err){
        if(err.code==='23505') return res.status(409).json({error:'Username already exists'});
        res.status(500).json({error: "Internal server error or DB error"})
    }
}

export const existingUser = async (req, res) => {
    const { username } = req.body;
    
    try{
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        )
        if (result.rows.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    }
    catch(err){
        return res.status(500).json({ error: "Internal server error or DB error" });
    }
}
