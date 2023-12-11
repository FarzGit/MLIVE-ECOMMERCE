const express = require("express");
const adminRoute = express();
const session = require("express-session");
const config = require("../config/config");
const adminController = require("../controller/adminController");
const productController = require("../controller/productController");
const couponController = require("../controller/couponController");
const offerController = require("../controller/offerController");
const bannerController = require("../controller/bannerController");
const adminAuth = require('../middleware/adminAuth')
const fileUpload = require('../middleware/fileUpload')
const chatController = require('../controller/chatController')
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

// adminRoute.use(
//   session({
//     secret: config.sessionSecret,
//     resave: false,
//     saveUninitialized: true,
//   })
// );



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




adminRoute.get('/couponManagement',adminAuth.isLogin,couponController.loadCouponMangements);
adminRoute.get('/addcouponManagement',adminAuth.isLogin,couponController.loadAddCouponMangements)
adminRoute.post('/addcouponManagement',adminAuth.isLogin,couponController.addNewCoupon)
adminRoute.get('/editcouponManagement',adminAuth.isLogin,couponController.loadEditCouponMangements)
adminRoute.post('/editcouponManagement',adminAuth.isLogin,couponController.editCoupon)
adminRoute.get('/deletecouponManagement',adminAuth.isLogin,couponController.deleteCoupon)




adminRoute.get('/offer',adminAuth.isLogin,offerController.loadOffer)
adminRoute.get("/addOffer",adminAuth.isLogin,offerController.loadaddOffer)
adminRoute.get("/editOffer/:id",adminAuth.isLogin,offerController.loadEditOffer)
adminRoute.post("/addOffer",adminAuth.isLogin,offerController.AddOffer)
adminRoute.post("/editOffer",adminAuth.isLogin,offerController.postEditOffer)
adminRoute.patch('/cancelOffer',adminAuth.isLogin,offerController.cancelOffer)
adminRoute.patch('/apply_offer',adminAuth.isLogin,productController.applyProductOffer)
adminRoute.patch('/remove_offer',adminAuth.isLogin,productController.removeProductOffer)
// adminRoute.get('/applyOfferProduct',adminAuth.isLogin,offerController.applyOfferProduct)




adminRoute.get('/add_banner',adminAuth.isLogin,bannerController.loadAddbanner)
adminRoute.post('/add_banner',fileUpload.uploadBanner.single('image'),adminAuth.isLogin,bannerController.addBanners)
adminRoute.get('/banners',adminAuth.isLogin,bannerController.loadBanners)
adminRoute.get('/editBanner',adminAuth.isLogin,bannerController.loadeditBanner)
adminRoute.post('/editBanner',fileUpload.uploadBanner.single('image'),adminAuth.isLogin,bannerController.editBanner)
adminRoute.get('/deleteBanner',adminAuth.isLogin,bannerController.deleteBanner)
adminRoute.get('/listUnlist',adminAuth.isLogin,bannerController.listAndUnList)




adminRoute.get('/adminChat',adminAuth.isLogin,chatController.adminChatPageLoad)







// adminRoute.get('/adminerror-500',adminController.load500Error)
adminRoute.get('/*',adminController.load400Error)








module.exports = adminRoute;
