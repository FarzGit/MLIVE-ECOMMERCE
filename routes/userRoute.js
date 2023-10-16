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

userRoute.get("/login",userAuth.isLogout,userController.loadlogin)
userRoute.get("/register",userAuth.isLogout,userController.loadResgister)
userRoute.post('/register',userController.verifyOtp);
userRoute.get('/userOtp',userAuth.isLogout,userController.loadOtp);
userRoute.post('/userOtp',userController.insertUser)
userRoute.get('/resend-otp',userController.resendOtp)
userRoute.get("/",userAuth.isLogout,userController.loadHome)
userRoute.post("/login",userController.verifyLogin);
userRoute.get('/forgot-password',userController.loadForgotPassword)
userRoute.post('/forgot-password',userController.ForgotPassword)
userRoute.get('/reset-password',userController.resetLoad)
userRoute.post('/reset-password',userController.resetPassword)
userRoute.get("/logout",userAuth.isLogin,userController.userLogout)





module.exports = userRoute