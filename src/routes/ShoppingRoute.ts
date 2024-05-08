import express, {Request, Response, NextFunction} from "express";
import { GetAvailableOffers, GetFoodAvailability, GetFoodsIn30Mins, GetRestaurantById, GetTopRestaurants, SearchFoods } from "../controllers";




const router = express.Router();

/** ------ FOOD AVAILABILITY --------- */
router.get('/:pincode', GetFoodAvailability);

/** ------ TOP RESTAURANTS --------- */ 
router.get('/top-restaurants/:pincode', GetTopRestaurants);


/** ------ FOODS AVAILABLE IN 30 MINS --------- */
router.get('/foods-in-30-mins/:pincode', GetFoodsIn30Mins);

/** ------ SEARCH FOODS --------- */
router.get('/search/:pincode', SearchFoods);

/** ------ FIND OFFERS --------- */
router.get('/offers/:pincode',  GetAvailableOffers);

/** ------ FIND RESTAURANT BY ID --------- */
router.get('/restaurant/:id', GetRestaurantById);






export {router as ShoppingRoute}
