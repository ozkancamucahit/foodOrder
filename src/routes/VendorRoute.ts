
import express, {Request, Response, NextFunction} from "express";
import { AddFood, AddOffer, EditOffer, GetCurrentOrders, 
  GetFoods, GetOffers, GetOrderDetails, GetVendorProfile, ProcessOrder, 
  UpdateVendorCoverImage, UpdateVendorProfile, UpdateVendorService, VendorLogin } from "../controllers";
import { Authenticate } from "../middlewares";
import multer from 'multer';


const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'images');
  },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname);
  }
});

const images = multer({storage: imageStorage}).array('images', 10);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({message: 'Hello from vendor route'});
});

router.post('/login', VendorLogin);

// require authentication for below actions
router.use(Authenticate);
// router.get('/profile', Authenticate, GetVendorProfile);
router.get('/profile',      GetVendorProfile);
router.patch('/profile',    UpdateVendorProfile);
router.patch('/coverImage', images, UpdateVendorCoverImage);
router.patch('/service',    UpdateVendorService);

router.get('/foods', GetFoods);

router.post('/food', images, AddFood);


// Orders

router.get('/orders',             GetCurrentOrders);
router.put('/order/:id/process',  ProcessOrder);
router.get('/order/:id',          GetOrderDetails);

// OFFERS

router.get('/offers',     GetOffers);
router.post('/offer',     AddOffer);
router.put('/offer/:id',  EditOffer);


export {router as VendorRoute}




