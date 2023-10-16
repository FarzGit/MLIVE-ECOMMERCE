const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true 
    },

    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        required:true
    },
    
      is_blocked: {
        type: Boolean,
        default: false,
      },
      token:{
        type:String,
        default:''
       },
       createdAt: {
        type: Date,
        default: Date.now,
      },
    


},  {
    timestamps:true
  })



module.exports = mongoose.model('User',userSchema)