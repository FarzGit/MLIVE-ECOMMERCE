const mongoose = require('mongoose')


const userAddressSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    addresses: [
      {
        country: {
          type: String,
          required: true,
        },
        fullName: {
          type: String,
          required: true,
        },
        mobile: {
          type: Number,
          required: true,
        },
        pincode: {
          type: Number,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        }
      }
    ]
  });


  module.exports = mongoose.model('address',userAddressSchema)