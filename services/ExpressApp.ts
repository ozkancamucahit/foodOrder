
import express, {Application} from "express";
import bodyParser from "body-parser";
import path from 'path';
import { AdminRoute, UserRoute, VendorRoute } from "../routes";
import { ShoppingRoute } from "../routes/ShoppingRoute";

require('dotenv').config();


export default async (app :Application) => {
  console.clear()
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  
  app.use('/images', express.static(path.join(__dirname, 'images')));
  
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);
  app.use('/shopping', ShoppingRoute);
  app.use('/user', UserRoute);

  return app;
}




