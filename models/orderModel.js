const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  deliveryDetails: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    
  },
  uniqueId: {
    type: Number,
  },
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      statusLevel: {
        type: Number,
        default: 0
      },
      productPrice: {
        type: Number,
        // required: true,
      },
      totalPrice: {
        type: Number,
        // required: true,
      },
      OrderStatus: {
        type: String,
        require:true

      },
      paymentStatus:{
        type:String,
        require:true
      },
      returnOrderStatus:{
        status:{
          type:String
        },
        reason:{
          type:String
        }
        
      },
     
      
      updatedAt:{
        type:Date,
        default:Date.now
      }
      
    },
    
  ],
  
  deliveryDate: {
    type: Date,
  },
  
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
  },
 
  paymentMethod: {
    type: String,
  },
  orderId: {
    type: String,
  },
  paymentId: {
    type: String
  },
  discount: {
    type: String
  },
  expectedDelivery:{
    type:Date,
    required:true
  },
});

module.exports = mongoose.model("order", orderSchema);
