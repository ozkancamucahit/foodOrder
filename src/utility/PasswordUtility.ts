

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { VendorPayload } from '../dto';
import { JWT_SECRET } from '../config';
import { Request } from 'express';
import { AuthPayload } from '../dto/Auth.dto';

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
}

export const GeneratePassword = async (password :string, salt: string) => {
  return await bcrypt.hash(password, salt);
}

export const ValidatePassword = async (enteredPassword :string, savedPassword :string, salt: string) => {
  return await GeneratePassword(enteredPassword, salt) === savedPassword;
}

export const GenerateSignature = (payload :AuthPayload) => {
  console.log('JWT_SECRET :>> ', JWT_SECRET);
  const signature = jwt.sign(payload, JWT_SECRET, {expiresIn: '3d'});
  return signature;
}

export const ValidateSignature = async (req: Request) => {

  const signature = req.get('Authorization');

  if(signature){
    const paylaod = await jwt.verify(signature.split(' ')[1], JWT_SECRET) as AuthPayload;

    req.user = paylaod;
    return true;

  }

  return false
}  


