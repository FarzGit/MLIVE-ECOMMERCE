const express = require("express")
const adminRoute = express()
const session = require('express-session')
const  config = require('../config/config')
const adminController = require('../controller/adminController')


adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))

adminRoute.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: true,
    })
  );

adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')


adminRoute.get('/',adminController.loadAdminLogin)
adminRoute.post('/',adminController.verifyAdminLogin)
adminRoute.get('/home',adminController.loadAdminHome)


module.exports = adminRoute