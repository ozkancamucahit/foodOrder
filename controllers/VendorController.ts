import { NextFunction, Request, Response } from "express";
import { CreateVendorInput, EditVendorInputs, VendorLoginInputs } from "../dto";
import { Food, Vendor } from "../models";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./AdminController";
import { CreateFoodInputs } from "../dto/Food.dto";


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







