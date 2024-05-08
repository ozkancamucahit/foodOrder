


import mongoose, {Schema, Document, Model}  from 'mongoose';
import { OrderDoc } from './Order';

interface DeliveryUserDoc extends Document{
  email: string;
  password: string;
  salt: string;
  firstName: string;
  LastName: string;
  address: string;
  phone: string;
  pincode: string;
  verified: boolean;
  lat: number;
  lon: number;
  isAvailable: boolean;
};

const DeliveryUserSchema = new Schema(
  {
    email: {type: String, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    firstName: {type: String},
    LastName: {type: String},
    address: {type: String},
    phone: {type: String, required: true},
    pincode: {type: String},
    verified: {type: String, required: true},
    lat: {type: Number},
    lon: {type: Number},
    isAvailable: {type: Boolean}
  },
  {
    toJSON:{
      transform(doc, ret){
        delete ret.password;
        delete ret.salt;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.__v;
      }
    },
    timestamps: true
  }
);

const DeliveryUser = mongoose.model<DeliveryUserDoc>('delivery_user', DeliveryUserSchema); 

export {DeliveryUser};










