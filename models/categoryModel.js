const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        requires:true
    },
    is_active:{
        type:Boolean,
        default:true
    }
})


module.exports = mongoose.model("category",categorySchema)