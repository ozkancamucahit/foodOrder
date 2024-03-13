import { NextFunction, Request, Response } from "express";
import { CreateVendorInput, EditVendorInputs, VendorLoginInputs } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./AdminController";


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




