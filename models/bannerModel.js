// const mongoose = require('mongoose');

// const bannerSchema = new mongoose.Schema({
//     image: {
//       type: String, // You can store the image URL or file path as a string
//       required: true,
//     },
//     subtext: {
//       type: String,
//       required: true,
//     },
//     mainHead: {
//       type: String,
//       required: true,
//     },
//     bannerNumber:{
//         type:Number,
//         required: true
//     },
//     link:{
//         type:String,
//         required: true
//     }
//   });


//   module.exports = mongoose.model('banner', bannerSchema);



const mongoose = require( 'mongoose' )

const Schema = mongoose.Schema

const bannerSchema = Schema( {

    typeHead : {
        type : String 
    },

    mainHead : {
        type : String
    },

    // description : {
    //     type : String 
    // },

    image : {
        type : String 
    },
    bannerURL :{
        type: String
    },

    status : {
        default : true,
        type: Boolean
    }

})

module.exports = mongoose.model( 'banner', bannerSchema)


