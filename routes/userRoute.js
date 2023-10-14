const express = require("express")
const userRoute = express()
const session = require('express-session')
const  config = require('../config/config')
const userAuth = require('../middleware/userAuth')

userRoute.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
    })
  );

const userController = require("../controller/userController")

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");


userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.get("/login",userController.loadlogin)
userRoute.get("/login",userController.loadlogin)
userRoute.get("/register",userController.loadResgister)
userRoute.post('/register',userController.verifyOtp);
userRoute.get('/userOtp',userController.loadOtp);
userRoute.post('/userOtp',userController.insertUser)
userRoute.get("/",userController.loadHome)
userRoute.post("/login",userController.verifyLogin);





module.exports = userRoute