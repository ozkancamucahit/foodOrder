


import express from "express";
import { EditUserProfile, GetUserProfile, RequestOTP, UserLogin, UserSingup, UserVerify } from "../controllers";
import { Authenticate } from "../middlewares";


const router = express.Router();


/** ------ SIGNup / CREATE CUSTOMER --------- */
router.post('/signup', UserSingup);

/** ------ LOGIN --------- */ 
router.post('/login', UserLogin);

/** ------ AUTHENTICATION MIDDLEWARE--------- */ 

router.use(Authenticate);


/** ------ VERIFY CUSTOMER ACCOUNT --------- */
router.patch('/verify', UserVerify);

/** ------ OTP / REQUESTING OPT --------- */
router.get('/otp', RequestOTP);

/** ------ PROFILE --------- */
router.get('/profile', GetUserProfile);
router.patch('/profile', EditUserProfile);


// CART
// ORDER
// PAYMENT

export {router as UserRoute}








