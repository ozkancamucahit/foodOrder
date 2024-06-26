


import express from "express";
import { AddToCart, CreateOrder, CreatePayment, DeleteCart, 
  EditUserProfile, GetCart, GetOrderById, GetOrders, 
  GetUserProfile, RequestOTP, UserLogin, UserSingup, UserVerify, 
  VerifyOffer} from "../controllers";
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
router.post('/cart', AddToCart);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);

// Apply Offers
router.get('/offer/verify/:id', VerifyOffer);


//PAYMENT
router.post('/create-payment', CreatePayment);

// ORDER
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderById);


// PAYMENT

export {router as UserRoute}








