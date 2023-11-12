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
},
{
    timestamps: true
})


module.exports = mongoose.model("Category",categorySchema)