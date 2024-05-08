import { NextFunction, Request, Response } from "express";
import { DeliveryUser, Food, FoodDoc, Transaction, Vendor } from "../models";
import { plainToClass, plainToInstance } from "class-transformer";
import { CartItem, CreateDeliveryUserInputs, CreateUserInputs, EditUserProfileInputs, OrderInputs, UserLoginInputs } from "../dto/User.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOtp } from "../utility";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";

export const DeliveryUserSingup = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUserInput = plainToClass(CreateDeliveryUserInputs, req.body);

  const inputErrors = await validate(deliveryUserInput, {validationError: {target: true}});

  if (inputErrors.length >0) {
    return res.status(400).json(inputErrors);
  }

  const {email, password, phone, address, firstName, lastName, pincode} = deliveryUserInput;
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const existingDeliveryUser = await DeliveryUser.findOne({email: email});

  if(existingDeliveryUser !== null){
    return res.status(400).json({message : "Delivery User exists with same email"});
  }

  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    pincode: pincode,
    firstName: firstName,
    LastName: lastName,
    address: address,
    verified: false,
    lat: 0,
    lon: 0,
    isAvailable: false
  });
  
  if(result){

    const signature = GenerateSignature({
      _id: result.id,
      email: result.email,
      verified: result.verified
    });

    // send the result to client
    return res.status(200).json({
      signature: signature, 
      verified: result.verified,
      email: result.email});
  }
  else{
    return res.status(400).json({message : "Error with signUP"});
  }
}


export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {

  const loginInputs = plainToInstance(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, req.body);
  
  if (loginErrors.length >0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password} = loginInputs;

  const deliveryUser = await DeliveryUser.findOne({email: email});
  
  if(deliveryUser){
    const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);

    if(validation){
      const signature = GenerateSignature({
        _id: deliveryUser.id,
        email: deliveryUser.email,
        verified: deliveryUser.verified
      });
  
      // send the deliveryUser to client
      return res.status(200).json({
        signature: signature, 
        verified: deliveryUser.verified,
        email: deliveryUser.email});
    }
  }
  return res.status(400).json({message : "INVALID Credentials"});
  
}

export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;

  if(deliveryUser){
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if(profile){
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({message : "Error with User Info"});
}


export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;
  const profileInputs = plainToInstance(EditUserProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {validationError: {target: true}});

  if (profileErrors.length >0) {
    return res.status(400).json(profileErrors);
  }

  const { LastName, address, firstName} = profileInputs;

  if(deliveryUser){
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if(profile){

      profile.firstName = firstName;
      profile.LastName = LastName;
      profile.address = address;

      const result = await profile.save();
      
      return res.status(200).json(result);
    }
    
  }
}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;

  if (deliveryUser) {

    const {lat, lng} = req.body;
    const profile = await DeliveryUser.findById(deliveryUser._id);
    
    if (profile){
      if (lat && lng){
        profile.lat = lat;
        profile.lon = lng;
      }

      profile.isAvailable = !profile.isAvailable;

      const result = await profile.save();

      return res.json(result);
    }
  }

  return res.status(400).json({message : 'Error with update status'});

}












