const express = require("express");
const adminRoute = express();
const session = require("express-session");
const config = require("../config/config");
const adminController = require("../controller/adminController");
const productController = require("../controller/productController");
const adminAuth = require('../middleware/adminAuth')
const path = require("path");
const multer = require("multer");





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/adminAssets/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/webp" ||
      file.mimetype === "image/avif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg, .jpeg, .webp format allowed!"));
    }
  },
});







adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

adminRoute.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

adminRoute.get("/",adminAuth.isLogout, adminController.loadAdminLogin);
adminRoute.post("/", adminController.verifyAdminLogin);
adminRoute.get("/home",adminAuth.isLogin, adminController.loadAdminHome);
adminRoute.get("/category",adminAuth.isLogin,adminController.loadCategoryPage);
adminRoute.get("/add_category",adminAuth.isLogin,adminController.loadAddCategory);
adminRoute.post("/add_category",adminController.addCategory);
adminRoute.get("/edit_category",adminAuth.isLogin,adminController.loadEditCategory);
adminRoute.post("/edit_category",adminController.editCategory);
adminRoute.get("/is_active",adminAuth.isLogin,adminController.listOrNot);
adminRoute.get("/customer",adminAuth.isLogin,adminController.loadCustomers);
adminRoute.get("/is_blockedUser",adminAuth.isLogin,adminController.blockUnblock);
adminRoute.get("/logout",adminAuth.isLogin,adminController.adminLogout)

adminRoute.get("/Product",adminAuth.isLogin, productController.loadProducts);
adminRoute.get('/adminProductDetails',adminAuth.isLogin,productController.loadAdminProductDetails)
adminRoute.get("/addProduct",adminAuth.isLogin, productController.loadAddProducts);
adminRoute.post('/addProduct',upload.array("image",4),productController.addProduct)
adminRoute.get('/editProduct',adminAuth.isLogin,productController.loadEditProduct)
adminRoute.post("/editProduct", upload.array("image", 4), productController.editProduct)

adminRoute.get("/is_activeProduct",adminAuth.isLogin,productController.productListorUnlist)



adminRoute.get("/userOrders",adminAuth.isLogin,adminController.loaduserOrders)
adminRoute.get("/orderFullDetails",adminAuth.isLogin,adminController.adminOrderFullDetails)
adminRoute.post('/orderFullDetails/changeStatus',adminAuth.isLogin,adminController. changeOrderStatus )
adminRoute.post('/adminCancelOrder', adminAuth.isLogin, adminController.adminCancelOrder);






module.exports = adminRoute;
