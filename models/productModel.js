


const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  brand:{
    type:String,
    required:true
  },

  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
    required:true
},
  
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image:{
    type:Array,
    required:true
},
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  is_active:{
    type:Boolean,
    default:true
    
  }
  

});

module.exports = mongoose.model("product", productSchema);








