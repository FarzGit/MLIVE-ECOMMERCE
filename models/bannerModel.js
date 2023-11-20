const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: {
      type: String, // You can store the image URL or file path as a string
      required: true,
    },
    subtext: {
      type: String,
      required: true,
    },
    mainHead: {
      type: String,
      required: true,
    },
    bannerNumber:{
        type:Number,
        required: true
    },
    link:{
        type:String,
        required: true
    }
  });


  module.exports = mongoose.model('banner', bannerSchema);


