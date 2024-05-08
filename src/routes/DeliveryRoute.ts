


import express from "express";
import { 
  DeliveryUserLogin,
  DeliveryUserSingup,
  EditDeliveryUserProfile,
  GetDeliveryUserProfile,
  UpdateDeliveryUserStatus} from "../controllers";
import { Authenticate } from "../middlewares";


const router = express.Router();


/** ------ SIGNup / CREATE CUSTOMER --------- */
router.post('/signup', DeliveryUserSingup);

/** ------ LOGIN --------- */ 
router.post('/login', DeliveryUserLogin);

/** ------ AUTHENTICATION MIDDLEWARE--------- */ 

router.use(Authenticate);

/** ------ CHANGE SERVICE STATUS --------- */ 
router.put('/change-status', UpdateDeliveryUserStatus);


/** ------ PROFILE --------- */
router.get('/profile', GetDeliveryUserProfile);
router.patch('/profile', EditDeliveryUserProfile);

export {router as DeliveryRoute}








