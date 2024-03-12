
import express from "express";
import { AdminRoute, VendorRoute } from "./routes";
import bodyParser from "body-parser";
import mongoose from 'mongoose';

require('dotenv').config();
import { ENV_DB_URL } from "./config";

console.log('initializing project');

const app = express();
console.clear()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/admin', AdminRoute);
app.use('/vendor', VendorRoute);


mongoose
  .connect(ENV_DB_URL)
  .then(result => {
    console.log('DB result :>> CONNECTED');
  })
  .catch(err => console.log('DB err :>> ', err))

app.listen(8017, () => {
  console.clear();
  console.log('APP is listening on 8017');
});


