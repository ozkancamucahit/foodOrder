
import mongoose from 'mongoose';
import { ENV_DB_URL } from "../config";



export default async () => {

  try {
    await mongoose.connect(ENV_DB_URL);
    console.log('DB CONNECTED');
  } catch (ex) {
    console.log(ex);
  }
}




