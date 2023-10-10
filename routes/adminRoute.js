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
adminRoute.get('/category',adminController.loadCategoryPage)
adminRoute.get('/add_category',adminController.loadAddCategory)
adminRoute.post('/add_category',adminController.addCategory)
adminRoute.get('/edit_category',adminController.loadEditCategory)
adminRoute.post('/edit_category',adminController.editCategory)

adminRoute.get('/customer',adminController.loadCustomerPage)



module.exports = adminRoute