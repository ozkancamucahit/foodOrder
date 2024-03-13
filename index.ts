
import express from "express";
import { AdminRoute, VendorRoute } from "./routes";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import path from 'path';

require('dotenv').config();
import { ENV_DB_URL, JWT_SECRET } from "./config";

console.log('initializing project');

const app = express();
console.clear()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/admin', AdminRoute);
app.use('/vendor', VendorRoute);


mongoose
  .connect(ENV_DB_URL)
  .then(result => {
    console.log('DB result :>> CONNECTED');
  })
  .catch(err => console.log('DB err :>> ',ENV_DB_URL, err))

app.listen(8017, () => {
  console.clear();
  console.log('APP is listening on 8017');
  console.log('ENV_DB_URL :>> ', ENV_DB_URL);
  console.log('JWT_SECRET :>> ', JWT_SECRET);
});


