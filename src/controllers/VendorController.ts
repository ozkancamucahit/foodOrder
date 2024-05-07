import { NextFunction, Request, Response } from "express";
import { CreateOfferInputs, EditVendorInputs, VendorLoginInputs } from "../dto";
import { Food } from "../models";
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./AdminController";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";


export const VendorLogin = async (req: Request, res: Response, next: NextFunction) => {

  const {email, password} = <VendorLoginInputs>req.body;

  const existingVendor = await  FindVendor('', email);

  if(existingVendor !== null){
    //validate

    const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);

    if(validation){
      const signature = GenerateSignature({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name 
      });

      return res.json(signature);
    }
    else{
      return res.status(400).json({message: "Invalid credentials"});
    }
  }
  else{
    return res.status(400).json({message: "Invalid credentials"});
  }
}


export const GetVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const existingVendor = await FindVendor(user._id);
    return res.json(existingVendor);
  }
  
  return res.status(204).end();

}

export const UpdateVendorProfile = async (req: Request, res: Response, next: NextFunction) => {

  const {address,foodTypes,name,phone} = <EditVendorInputs>req.body;
  const user = req.user;

  if(user){
    const existingVendor = await FindVendor(user._id);

    if(existingVendor !== null){
      existingVendor.name = name;
      existingVendor.address = address;
      existingVendor.phone = phone;
      existingVendor.foodType = foodTypes;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  
  return res.status(204).end();


}

export const UpdateVendorCoverImage = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){

    const vendor = await FindVendor(user._id);

    if(vendor !== null){

      const files = req.files as [Express.Multer.File]
      const images = files.map((file :Express.Multer.File) => file.filename);

      vendor.coverImages.push(...images);
      const result = await vendor.save();
      return res.json(result);
    }
  }
  return res.status(500).json({message: "Something went wrong. Please try again later."});
}

export const UpdateVendorService = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const existingVendor = await FindVendor(user._id);

    if(existingVendor !== null){
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  
  return res.status(204).end();


}

export const AddFood = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const {name, category, description, foodType, price, readyTime} = <CreateFoodInputs>req.body;

    const vendor = await FindVendor(user._id);

    if(vendor !== null){

      const files = req.files as [Express.Multer.File]
      const images = files.map((file :Express.Multer.File) => file.filename);

      const createdFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        category: category,
        description: description,
        foodType: foodType,
        price: price,
        readyTime: readyTime,
        images: images,
        rating: 0
      });

      vendor.foods.push(createdFood);
      const result = await vendor.save();
      return res.json(result);
    }
    
    
  }
  
  return res.status(500).json({message: "Something went wrong. Please try again later."});
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const foods = await Food.find({vendorId: user._id});
    if(foods !== null){
      return res.json(foods);
    }

  }
  
  return res.status(204).end();
}


export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const orders = await Order.find({vendorId: user._id}).populate('items.food');

    if (orders != null){
      return res.json(orders);
    }
  }
  return res.status(400).json({message: "Order info not found"});
}

export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.id;

  if(orderId){
    const order = await Order.findById(orderId).populate('items.food');

    if (order != null){
      return res.json(order);
    }
  }
  return res.status(400).json({message: "Order info not found"});
}

export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.id;
  const {status, remarks, time} = req.body;

  if(orderId){
    const order = await Order.findById(orderId).populate('items.food');

    if (order != null){
      order.orderStatus = status;
      order.remarks = remarks;
      if(time){
        order.readyTime = time;
      }
      const orderResult = await order.save();

      if (orderResult !== null){
        return res.json(orderResult);
      }
    }
  }
  return res.status(400).json({message: "Unable to process order"});
}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const offers = await Offer.find().populate('vendors');

    let currentOffers = Array();
    if(offers){
      
      
      offers.map(item => {
        if(item.vendors){
          item.vendors.map(vendor => {
            if(vendor._id.toString() === user._id){
              currentOffers.push(item);
            }
          });
        }

        if (item.offerType === 'GENERIC'){
          currentOffers.push(item);
        }
        
        
      });

      return res.json(currentOffers)

    }

    else{
      // no offer found
      return res.sendStatus(204);
    }
  }


  return res.status(400).json({message: "Unable to process request"});
}


export const AddOffer = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const {title, description, offerType, offerAmount, pincode,
      promoCode, promoType, startValidity, endValidity, bank, bins, minValue
      ,isActive
    } = <CreateOfferInputs>req.body;

    const vendor = await FindVendor(user._id);

    console.log('Found Vendor :>> ', vendor);

    if(vendor){
      const offer = await Offer.create({
        title,
        description,
        offerType,
        offerAmount,
        pincode,
        promoCode,
        promoType,
        startValidity,
        endValidity,
        bank,
        bins,
        isActive,
        minValue,
        vendors:[vendor]
      });

      console.log('offer :>> ', offer);
      return res.json(offer);

    }

  return res.status(400).json({message: "Unable to add offer"});

  }

  return res.status(400).json({message: "Unable to process offer"});

}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;
  const offerId = req.params.id

  if(user){
    const {title, description, offerType, offerAmount, pincode,
      promoCode, promoType, startValidity, endValidity, bank, bins, minValue
      ,isActive
    } = <CreateOfferInputs>req.body;

    const currentOffer = await Offer.findById(offerId);

    if (currentOffer){
      const vendor = await FindVendor(user._id);

      if(vendor){

          currentOffer.title = title;
          currentOffer.description = description;
          currentOffer.offerType = offerType;
          currentOffer.offerAmount = offerAmount;
          currentOffer.pincode = pincode;
          currentOffer.promoCode = promoCode;
          currentOffer.promoType = promoType;
          currentOffer.startValidity = startValidity;
          currentOffer.endValidity = endValidity;
          currentOffer.bank = bank;
          currentOffer.bins = bins;
          currentOffer.isActive = isActive;
          currentOffer.minValue = minValue;

          const result = await currentOffer.save();

        return res.json(result);
      }

      return res.status(400).json({message: "Unable to find vendor"});
    }

    

  return res.status(400).json({message: "Unable to add offer"});

  }

  return res.status(400).json({message: "Unable to process offer"});
}




