const express = require("express")
const userRoute = express()

const userController = require("../controller/userController")

userRoute.set("view engine", "ejs");
userRoute.set("views", "./views/users");


userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.get("/",userController.loadlogin)
userRoute.get("/login",userController.loadlogin)
userRoute.get("/register",userController.loadResgister)
userRoute.post("/register",userController.insertUser)




module.exports = userRoute