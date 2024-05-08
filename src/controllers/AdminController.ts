import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    email,
    foodType,
    ownerName,
    password,
    phone,
    pincode,
  } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    return res.json({ message: "vendor exists" });
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
    pincode: pincode,
    foods: [],
    lat: 0,
    lng: 0,
  });

  return res.status(201).json(createdVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  } else {
    return res.status(204).end();
  }
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  } else {
    return res.status(404).end();
  }
};

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();

  if (transactions) {
    return res.json(transactions);
  } else {
    return res.sendStatus(404);
  }
};

export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const transaction = await Transaction.findById(id);

  if (transaction) {
    return res.json(transaction);
  } else {
    return res.sendStatus(404);
  }
};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id, status } = req.body;

  if (_id) {
    const profile = await DeliveryUser.findById(_id);

    if (profile) {
      profile.verified = status;
      const result = await profile.save();
      return res.json(result);
    }
  } else {
    return res.sendStatus(404);
  }

  return res.status(400).json({ message: "unable to verify delivery user" });
};

export const GetDeliveryUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUsers = await DeliveryUser.find();

  if (deliveryUsers) {
    return res.json(deliveryUsers);
  }

  return res.status(400).json({ message: "unable to get delivery users" });
};
