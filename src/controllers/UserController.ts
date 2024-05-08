import { NextFunction, Request, Response } from "express";
import { DeliveryUser, Food, FoodDoc, Transaction, Vendor } from "../models";
import { plainToClass, plainToInstance } from "class-transformer";
import { CartItem, CreateUserInputs, EditUserProfileInputs, OrderInputs, UserLoginInputs } from "../dto/User.dto";
import { validate } from "class-validator";
import { GenerateOtp, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword, onRequestOtp } from "../utility";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";

export const UserSingup = async (req: Request, res: Response, next: NextFunction) => {

  const userInput = plainToClass(CreateUserInputs, req.body);

  const inputErrors = await validate(userInput, {validationError: {target: true}});

  if (inputErrors.length >0) {
    return res.status(400).json(inputErrors);
  }

  const {email, password, phone} = userInput;
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  //  const {otp, expiry} = GenerateOtp();

  const existingUser = await User.findOne({email: email});

  if(existingUser !== null){
    console.log('existingUser :>> ', existingUser);
    return res.status(400).json({message : "User exists with same email"});
  }

  const result = await User.create({
    email: email,
    password: userPassword,
    salt: salt,
    otp: 1717, //otp,
    phone: phone,
    otp_expiry: new Date(), //expiry,
    firstName: '',
    LastName: '',
    address: '',
    verified: false,
    lat: 0,
    lon: 0,
    orders: []
  });
  
  if(result){
    // send otp to user

    // await onRequestOtp(otp, phone);
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

/************ CART SECTION    ************** */
export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if(user){

    const profile = await User.findById(user._id).populate('cart.food');
    let cartItems = Array();
    const { _id, unit} = <CartItem>req.body;
    const food = await Food.findById(_id);


    if (food) {
      if(profile != null){
        cartItems = profile.cart;

        if (cartItems.length > 0){
          // check and update unit
          let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id)

          if(existFoodItem.length > 0){
            const index = cartItems.indexOf(existFoodItem[0]);
            if (unit > 0){
              cartItems[index] = {food, unit};
            }
            else{
              cartItems.splice(index, 1);
            }
          }else{
            cartItems.push({food, unit});
          }
          
          
        }
        else{
          // add new item to cart
          cartItems.push({food, unit});
        }

        if (cartItems){
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.json(cartResult.cart);
        }

      }
    }
    
  }

  return res.status(400).json({message : "Error creating Cart"});
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if(user){

    const profile = await User.findById(user._id).populate('cart.food');
      if(profile != null){
          return res.json(profile.cart);
      }
  }
  return res.status(400).json({message : "Cart is empty"});
}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if(user){
    const profile = await User.findById(user._id).populate('cart.food');
      if(profile != null){
        profile.cart = [] as any;
        const cartResult = await profile.save();
        return res.json(cartResult);
      }
  }
  return res.status(400).json({message : "Cart is already empty"});
  
}

/************ CART SECTION END   ************** */

/************ DELIVERY NOTIFICATION   ************** */
export const assignOrderForDelivery = async (orderId: string, vendorId: string) => {

  const vendor = await Vendor.findById(vendorId);

  if (vendor){
    
    const areaCode = vendor.pincode;
    const vendorLat = vendor.lat;
    const vendorLng = vendor.lng;

    const deliveryPerson = await DeliveryUser.find({pincode: areaCode, verified: true, isAvailable: true})

    if(deliveryPerson){
      const currentOrder = await Order.findById(orderId);

      if (currentOrder){
        const response = await currentOrder.save();

        // notify to vendor for received new order w push not.
      }
      
    }

  }
  
  
}



/************ ORDER SECTION   ************** */

export const CreatePayment = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  const { amount, paymentMode, offerId} = req.body;
  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer){
      if (appliedOffer.isActive){
        payableAmount = (payableAmount - appliedOffer.offerAmount);
      }
    }
  }
  // perform payment gateway charge api call

  // create record on transsaction
  const transaction = await Transaction.create({
    customer: customer._id,
    vendorId: '',
    orderId: '',
    orderValue: payableAmount,
    offerUsed: offerId || 'NA',
    status: 'OPEN',
    paymentMode: paymentMode,
    paymentResponse: 'Payment is Cash on Delivery'
  });

  // return transaction ID

  return res.json(transaction);
  // return res.status(400).json({message : "Offer is not valid"});
}


const validateTransaction = async (txnId: string) => {

  const currentTransaction = await Transaction.findById(txnId);

  if (currentTransaction){
    if (currentTransaction.status.toLowerCase() !== 'failed'){
      return {status: true, currentTransaction};
    }
  }
  return {status: false, currentTransaction};
}

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  const { txnId, amount, items} = <OrderInputs>req.body;

  if(user){

    // TODO: validate transaction

    const { status, currentTransaction } = await validateTransaction(txnId);

    if(!status){
      return res.status(404).json({message: 'Error whren validating transaction'});
    }

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
    const profile = await User.findById(user._id);
    

    let cartItems = Array();
    let netAmount = 0.0;
    let vendorId;

    // CALCULATE ORDER AMOUNT 
    const foods = await Food.find().where('_id').in(items.map(item => item._id)).exec();

    foods.map(food => {
      items.map(({_id, unit}) => {
        if (food._id == _id){
          vendorId = food.vendorId;
          netAmount += (food.price * unit); 
          cartItems.push({food, unit});
        }
      })
    });

    if(cartItems){

      const currentOrder = await Order.create({
        orderId: orderId,
        items: cartItems,
        vendorId: vendorId,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "Waiting",
        remarks: '',
        deliveryId: '',
        readyTime: 45
      });

      if (currentOrder){
        profile.cart = [] as any;
        profile.orders.push(currentOrder);

        currentTransaction.vendorId = vendorId;
        currentTransaction.orderId = orderId;
        currentTransaction.status = 'CONFIRMED';

        await currentTransaction.save();
        await assignOrderForDelivery(currentOrder._id, vendorId);

        const profileSaveResponse = await profile.save();

        // return res.json(currentOrder); 
        return res.json(profileSaveResponse); 
      }
    }
  }

  return res.status(400).json({message : "Error creating Order"});

}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

  const user = req.user;

  if(user){
    const profile = await User.findById(user._id).populate("orders");

    if(profile){
      
      return res.status(200).json(profile.orders);
    }
    
  }
}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

  const orderId = req.params.id;
  
  if(orderId){
    const order = await Order.findById(orderId).populate("items.food");
    return res.json(order);
  }


}


export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => {

  const offerId = req.params.id;
  const customer = req.user;
  
  if(customer){
    const appliedOffer = await Offer.findById(offerId);
    
    if (appliedOffer){
        if (appliedOffer.promoType === 'USER'){ 



        }else{

          if(appliedOffer.isActive){
            return res.json({message: 'Offer is valid', offer: appliedOffer});
          }
        }
        return res.json({message: 'Offer is valid', offer: appliedOffer})
    }
    return res.status(404).json({message: 'Offer not found'})
  }
  return res.status(400).json({message : "Offer is not valid"});
}













