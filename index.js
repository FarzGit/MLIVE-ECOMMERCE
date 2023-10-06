
const mongoose =require('mongoose')
const express = require('express')
const app = express()
const path = require("path")

mongoose.connect("mongodb://127.0.0.1:27017/Mlive_Project");


app.use("/css",express.static(path.join(__dirname,"public")))


const userRoute = require("./routes/userRoute")
app.use("/",userRoute)





const PORT = process.env.PORT || 4000
app.listen(PORT,function(){
    console.log("servernis running...");
})
