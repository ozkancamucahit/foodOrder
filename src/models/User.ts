
import mongoose, {Schema, Document, Model}  from 'mongoose';
import { OrderDoc } from './Order';

interface UserDoc extends Document{
  email: string;
  password: string;
  salt: string;
  firstName: string;
  LastName: string;
  address: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lon: number;
  orders: [OrderDoc];

};

const UserSchema = new Schema(
  {
    email: {type: String, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    firstName: {type: String},
    LastName: {type: String},
    address: {type: String},
    phone: {type: String, required: true},
    verified: {type: String, required: true},
    otp: {type: Number, required: true},
    otp_expiry: {type: Date, required: true},
    lat: {type: Number},
    lon: {type: Number},
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'order'
      }
    ]
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

const User = mongoose.model<UserDoc>('user', UserSchema); 

export {User};







