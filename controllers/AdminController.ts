import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";



export const CreateVendor = async (req: Request, res: Response, next: NextFunction) => {
  const {name, address, email, foodType, ownerName, password, phone, pincode} = <CreateVendorInput>req.body;


  const existingVendor = await Vendor.findOne({email: email});

  if(existingVendor !== null){
    return res.json({message : "vendor exists"});
  }

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const createdVendor = await Vendor.create({
    name: name,
    address: address,
    email: email,
    foodType: foodType,
    salt: salt,
    ownerName: ownerName,
    serviceAvailable: false,
    password: userPassword,
    phone: phone,
    pincode: pincode
  });

  return res.json(createdVendor);


  
}

export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {

}

export const GetVendorById = async (req: Request, res: Response, next: NextFunction) => {

}


