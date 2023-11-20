// const mongoose = require('mongoose')

// const offerSchema = mongoose.Schema({

//     name:{
//         type: String,
//         required : true
//     },
//     discount: {
//         type : Number,
//         required: true
//     },
//     startingDate: {
//         type: Date
//     },
//     expiryDate: {
//         type: Date,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['Available','Starting Soon','Cancelled','Expired'],
//         required: true
//     }
// },
// {
//     timestamps: true
// })

// module.exports = mongoose.model('Offers',offerSchema)





const mongoose = require( 'mongoose' ) 

const Schema = mongoose.Schema

const offerSchema = Schema({
    name : {
        type : String,
        required : true
    },

    startingDate : {
        type : Date,
        required : true
    },

    expiryDate : {
        type : Date,
        required : true
    },

    percentage : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean, 
        default : true
    }

},{
    timestamps : true
})

module.exports = mongoose.model('offer', offerSchema )