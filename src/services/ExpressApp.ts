
import express, {Application} from "express";
import path from 'path';
import { AdminRoute, UserRoute, VendorRoute } from "../routes";
import { ShoppingRoute } from "../routes/ShoppingRoute";

require('dotenv').config();


export default async (app :Application) => {
  
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  const imagePath = path.join(__dirname, '../images');
  
  app.use('/images', express.static(path.join(imagePath)));
  app.get("/", (req, res) => res.send("Express on Vercel"));
  app.use('/admin', AdminRoute);
  app.use('/vendor', VendorRoute);
  app.use('/shopping', ShoppingRoute);
  app.use('/user', UserRoute);

  return app;
}




