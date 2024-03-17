import { NextFunction, Request, Response } from "express";
import { FoodDoc, Vendor } from "../models";
import { plainToClass, plainToInstance } from "class-transformer";
import { CreateUserInputs, EditUserProfileInputs, UserLoginInputs } from "../dto/User.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOtp } from "../utility";
import { User } from "../models/User";

export const UserSingup = async (req: Request, res: Response, next: NextFunction) => {

  const userInput = plainToClass(CreateUserInputs, req.body);

  const inputErrors = await validate(userInput, {validationError: {target: true}});

  if (inputErrors.length >0) {
    return res.status(400).json(inputErrors);
  }

  const {email, password, phone} = userInput;
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const {otp, expiry} = GenerateOtp();

  const existingUser = User.findOne({email: email});

  if(existingUser !== null){
    return res.status(400).json({message : "User exists with same email"});
  }

  const result = await User.create({
    email: email,
    password: userPassword,
    salt: salt,
    otp: otp,
    phone: phone,
    otp_expiry: expiry,
    firstName: '',
    LastName: '',
    address: '',
    verified: false,
    lat: 0,
    lon: 0
  });
  
  if(result){
    // send otp to user

    await onRequestOtp(otp, phone);
    // generate the signature

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


export const UserLogin = async (req: Request, res: Response, next: NextFunction) => {

  const loginInputs = plainToInstance(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, req.body);
  
  if (loginErrors.length >0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password} = loginInputs;

  const user = await User.findOne({email: email});
  
  if(user){
    const validation = await ValidatePassword(password, user.password, user.salt);

    if(validation){
      const signature = GenerateSignature({
        _id: user.id,
        email: user.email,
        verified: user.verified
      });
  
      // send the user to client
      return res.status(200).json({
        signature: signature, 
        verified: user.verified,
        email: user.email});
    }
  }
  return res.status(400).json({message : "INVALID Credentials"});
  
}


export const UserVerify = async (req: Request, res: Response, next: NextFunction) => {

  const {otp} = req.body;

  const user = req.user;

  if(user){
    const profile = await User.findById(user._id);

    if(profile){
      if(profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()){
        profile.verified = true;
        const updatedCustomerResponse = await profile.save();

        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified
        });

        return res.status(200).json({signature: signature, verified: updatedCustomerResponse.verified, email: updatedCustomerResponse.email});
      }
    }
  }
  return res.status(400).json({message : "Error with OTP Validation"});
}


export const RequestOTP = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const profile = await User.findById(user._id);

    if(profile){
      const { otp, expiry} = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOtp(otp, profile.phone);
      
      return res.status(200).json({message : "OTP send to your number"});
    }
    
  }
  
  return res.status(400).json({message : "Error with requesting OTP"});
}

export const GetUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;


  if(user){
    const profile = await User.findById(user._id);

    if(profile){
      
      return res.status(200).json(profile);
    }
    
  }

  return res.status(400).json({message : "Error with User Info"});

}


export const EditUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;
  const profileInputs = plainToInstance(EditUserProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {validationError: {target: true}});

  if (profileErrors.length >0) {
    return res.status(400).json(profileErrors);
  }

  const { LastName, address, firstName} = profileInputs;

  if(user){
    const profile = await User.findById(user._id);

    if(profile){

      profile.firstName = firstName;
      profile.LastName = LastName;
      profile.address = address;

      const result = await profile.save();
      
      return res.status(200).json(result);
    }
    
  }
}


