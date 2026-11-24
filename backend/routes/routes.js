import express from 'express'
import { login } from '../controllers/logincontroller.js'
import { signup } from '../controllers/signupcontroller.js'
import { verifyToken } from '../middlewares/verifytoken.js'
import {body,validationResult} from 'express-validator'
import { existingUser } from '../controllers/signupcontroller.js'
import { deleteRefreshToken } from '../models/JWTtokenmodel.js'
import { idToUsername } from '../models/loginmodel.js'
import {asyncRoute} from '../lib/core.js'
import {rateLimit} from 'express-rate-limit'

const authLimit=rateLimit({windowMs:15*60*1000,limit:100,message:{error:'Too many attempts. Try again later.'}});

const router = express.Router()

router.post('/login',authLimit,body('username').isString().isLength({min:3,max:60}),body('password').isString().isLength({min:6,max:72}),(req,res,next)=>{if(!validationResult(req).isEmpty())return res.status(400).json({error:'Enter a valid username and password'});next();},login)
router.post('/existinguser',authLimit,existingUser)
router.post('/signup',authLimit,[

    body('username')
        .isString().isLength({min: 3,max:60})
        .withMessage('Username must be at least 3 characters long')
        .matches(/^[A-Za-z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('password')
        .isString().isLength({min: 6,max:72})
        .withMessage('Password must be at least 6 characters long')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('Password must contain at least one special character'),
],
(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errMessages = {}
      errors.array().forEach(err => {
        if(!errMessages[err.path])
        errMessages[err.path] = err.msg;
      });  
      return res.status(400).json({ errors: errMessages });
    }
    next();
},
signup)


router.get('/me',verifyToken,(req,res)=>{const {session_id,...user}=req.user;res.json(user);})
router.get('/protected',verifyToken,asyncRoute(async (req,res) =>{
    const ids = req.user.id;
    const username = await idToUsername(ids)
    res.status(200).json({message:"Protected route accessed successfully",username:username})
}))

router.post('/logout', asyncRoute(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
        await deleteRefreshToken(refreshToken);
    }
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out successfully' })
}))
export default router;
