
import express, {Request, Response, NextFunction} from "express";
import { GetVendorProfile, UpdateVendorProfile, UpdateVendorService, VendorLogin } from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({message: 'Hello from vendor route'});
});

router.post('/login', VendorLogin);

// require authentication for below actions
router.use(Authenticate);
// router.get('/profile', Authenticate, GetVendorProfile);
router.get('/profile', Authenticate, GetVendorProfile);
router.patch('/profile', UpdateVendorProfile);
router.patch('/service', UpdateVendorService);





export {router as VendorRoute}




