const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    user:{
        type : mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    products :[{
        productId :{
            type:mongoose.Types.ObjectId,
            ref : "Product",
            required:true
        },
        quantity : {
            type : Number,
            default : 1
        },
        price:{
            type:Number,
            default:0
        },
        totalPrice:{
            type:Number,
            default:0
        }
    }]
})



module.exports = mongoose.model('Cart',cartSchema)