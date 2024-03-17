import { NextFunction, Request, Response } from "express";
import { FoodDoc, Vendor } from "../models";


export const GetFoodAvailability = async (req: Request, res: Response, next: NextFunction) => {

  const pincode = req.params.pincode;
  const result = await Vendor.find({pincode: pincode, serviceAvailable: true})
  .sort([['rating', 'descending']])
  .populate('foods');

  if(result.length > 0){
    return res.status(200).json(result);

  }
  else{
    res.status(204).end();
  }
}


export const GetTopRestaurants = async (req: Request, res: Response, next: NextFunction) => {

  const pincode = req.params.pincode;
  const result = await Vendor.find({pincode: pincode, serviceAvailable: true})
  .sort([['rating', 'descending']])
  .limit(10);
  

  if(result.length > 0){
    return res.status(200).json(result);

  }
  else{
    res.status(204).end();
  }
  
  
}


export const GetFoodsIn30Mins = async (req: Request, res: Response, next: NextFunction) => {

  const pincode = req.params.pincode;
  const result = await Vendor.find({pincode: pincode, serviceAvailable: true})
  .populate('foods');
  

  if(result.length > 0){
    let foodResults : any[] = [];

    result.map( vendor => {
      const foods = vendor.foods as [FoodDoc];
      foodResults.push(...foods.filter(food => food.readyTime <= 30));
      
    });

    return res.status(200).json(foodResults);

  }
  else{
    res.status(204).end();
  }
  
  
}


export const SearchFoods = async (req: Request, res: Response, next: NextFunction) => {

  const pincode = req.params.pincode;
  const result = await Vendor.find({pincode: pincode, serviceAvailable: true})
  .populate('foods');
  

  if(result.length > 0){
    
    let foodResults : any[] = [];

    result.map( item => {
      foodResults.push(...item.foods);
    });

    return res.status(200).json(foodResults);

  }
  else{
    res.status(204).end();
  }
}

export const GetRestaurantById = async (req: Request, res: Response, next: NextFunction) => {

  const id = req.params.id;
  const result = await Vendor.findById(id);

  if(result){
    return res.status(200).json(result);
  }
  else{
    res.status(204).end();
  }
}
