
import mongoose, { Schema, Document  } from "mongoose";

export interface OrderDoc extends Document{
  orderId :string,
  items: [any],
  totalAmount: [any],
  orderDate: Date,
  paidThrough: string,
  paymentResponse: string,
  orderStatus: string,
  
}

const OrderSchema = new Schema({
  orderId :{ type: String, required: true},
  items :[
    {
      food: { type: Schema.Types.ObjectId, ref:"food", required: true},
      unit: { type: Number, required: true},
    }
  ],
  totalAmount :{ type: Number, required: true},
  orderDate :{ type: Date},
  paidThrough :{ type: String},
  paymentResponse :{type :String},
  orderStatus :{type :String},
},{
  timestamps: true,
  toJSON: {
    transform(doc, ret){
      delete ret.__v,
      delete ret.createdAt,
      delete ret.updatedAt
    }
  }
});

const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export {Order};
