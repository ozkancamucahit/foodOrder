
import mongoose, { Schema, Document  } from "mongoose";

export interface TransactionDoc extends Document{
  customer :string;
  vendorId :string;
  orderId :string;
  orderValue :string;
  offerUsed :string;
  status :string;
  paymentMode :string;
  paymentResponse :string;
}

const TransactionSchema = new Schema({
  customer :{ type: String},
  vendorId :{ type: String},
  orderId :{ type: String},
  orderValue :{ type: String},
  offerUsed :{ type: String},
  status :{type :String},
  paymentMode :{type :String},
  paymentResponse :{type :String},
},{
  timestamps: true,
  toJSON: {
    transform(doc, ret){
      delete ret.__v
    }
  }
});

const Transaction = mongoose.model<TransactionDoc>('transaction', TransactionSchema);

export {Transaction};
