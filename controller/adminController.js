const adminDb = require("../models/adminModel");
const categoryDb = require("../models/categoryModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const orderDb = require("../models/orderModel");
const productDb = require("../models/productModel");
const { findIncome, countSales, findSalesData, findSalesDataOfYear, findSalesDataOfMonth, formatNum } = require('../helpers/orderHelper')




// =======================================================rendering the admin home================================================================


const loadAdminHome = async (req, res) => {
  try {

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const jan1OfTheYear =  new Date(today.getFullYear(), 0, 1);

    const totalIncome = await findIncome()
    const thisMonthIncome = await findIncome(firstDayOfMonth)
    const thisYearIncome = await findIncome(jan1OfTheYear)

    const totalUsersCount = formatNum(await User.find({}).count())
    const usersOntheMonth = formatNum(await User.find({updatedAt:{$gte: firstDayOfMonth}}).count())

    const totalSalesCount = formatNum(await countSales()) 
    const salesOnTheYear = formatNum(await countSales(jan1OfTheYear)) 
    const salesOnTheMonth = formatNum(await countSales(firstDayOfMonth)) 
    const salesOnPrevMonth = formatNum(await countSales( firstDayOfPreviousMonth, firstDayOfPreviousMonth ))

    let salesYear = 2023 
    // console.log(req.query.salesYear);  
    if(req.query.salesYear){
      salesYear = parseInt(req.query.salesYear)
    }

    if(req.query.year){
      salesYear = parseInt(req.query.year)
      displayValue = req.query.year
      xDisplayValue = 'Months'
    }

    let monthName = ''
        if(req.query.month){
            salesMonth = 'Weeks',
            monthName = getMonthName(req.query.month)
            displayValue = `${salesYear} - ${monthName}`
        }

        const totalYears = await orderDb.aggregate([
          {$group:{_id:{createdAt:{$dateToString:{format: '%Y', date: '$createdAt'}}}}},
          { $sort: {'_id:createdAt': -1 }}
        ])


        const displayYears =[]

        totalYears.forEach((year)=>{
          displayYears.push(year._id.createdAt)
        })


        console.log("displayYears",displayYears);




        let orderData
        
        if(req.query.year && req.query.month){
          orderData = await findSalesDataOfMonth(salesYear, req.query.month)
          console.log("///\\\\ :",orderData);
        }else if(req.query.year && !req.query.month){
          orderData = await findSalesDataOfYear(salesYear)
        }else{
          orderData = await findSalesData()
        }

        let months =[]
        let sales = []
       

        if(req.query.year && req.query.month){
          // console.log("entered")

          orderData.forEach((year) => { months.push(`Week ${year._id.weekNumber}`) })
          orderData.forEach((sale) => { sales.push(Math.round(sale.sales)) })

      }else if(req.query.year && !req.query.month){

          orderData.forEach((month) => {months.push(getMonthName(month._id.createdAt))})
          orderData.forEach((sale) => { sales.push(Math.round(sale.sales))})

      }else{

          orderData.forEach((year) => { months.push(year._id.createdAt) })
          orderData.forEach((sale) => { sales.push(Math.round(sale.sales)) })

      }


      console.log("sales is :",sales);
      console.log("months is :",months);
      let totalSales = sales.reduce((acc,curr) => acc += curr , 0)
      // console.log("totalSale is:",totalSales)

      let categories = []
      let categorySales = []

      const categoryData = await orderDb.aggregate([
                      {$match:{"products.OrderStatus":"Delivered"}},
                      {$unwind:"$products"},
                      {
                        $lookup:{
                            from: 'products', 
                            localField: 'products.productId',
                            foreignField: '_id',
                            as: 'populatedProduct'
                        }
                      },
                      {
                        $unwind: '$populatedProduct'
                      },
                      {
                        $lookup: {
                            from: 'categories', 
                            localField: 'populatedProduct.category',
                            foreignField: '_id',
                            as: 'populatedCategory'
                        }
                    },
                    {
                      $unwind: '$populatedCategory'
                    },
                    {
                      $group: {
                          _id: '$populatedCategory.name', sales: { $sum: '$totalAmount' } // Assuming 'name' is the field you want from the category collection
                      }
                  }




      ]);

      // console.log("categoryData is :",categoryData);

     


      categoryData.forEach((cat) => {
        categories.push(cat._id),
        categorySales.push(cat.sales)
    })

    // console.log("categorySales:", categorySales)
    // console.log("categories:", categories)


    let paymentData = await orderDb.aggregate([
      { 
          $unwind: "$products" }, // unwind the products array
      { 
          $match: { 
              "products.OrderStatus": "Delivered", 
              paymentMethod: { $exists: true } 
          }
      },
      { 
          $group: { 
              _id: '$paymentMethod', 
              count: { $sum: 1 }
          }
      }
  ]);

  // console.log("paymentData:",paymentData);

        let paymentMethods = []
        let paymentCount = []

        paymentData.forEach((data) => {
          paymentMethods.push(data._id)
          paymentCount.push(data.count)
      })



      let orderDataToDownload = await orderDb.find({ "products.OrderStatus": "Delivered" }).sort({ createdAt: 1 }).populate('products.productId');
      if(req.query.fromDate && req.query.toDate){
        const { fromDate, toDate } = req.query
        orderDataToDownload = await orderDb.find({ "products.OrderStatus": "Delivered", createdAt: { $gte: fromDate, $lte: toDate }}).sort({ createdAt: 1 })

    }


    res.render("adminHome",{
      totalUsersCount, 
      usersOntheMonth,
      totalSalesCount,
      salesOnTheYear,
      totalIncome,
      thisMonthIncome,
      thisYearIncome,
      salesOnTheMonth,
      salesOnPrevMonth,
      salesYear,
      displayYears,
      totalSales,
      months,
      sales,
      categories,
      categorySales,
      paymentMethods,
      paymentCount,
      orderDataToDownload

    });
  } catch (error) {
    console.log(error);
  }
};



function getMonthName(monthNumber) {

  if(typeof monthNumber === 'string'){
      monthNumber = parseInt(monthNumber)
  }

  if (monthNumber < 1 || monthNumber > 12) {
      return "Invalid month number";
  }

  const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  
  return monthNames[monthNumber - 1];
}


// =======================================================loadAdminLoginPage================================================================

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    log(error);
  }
};

// =======================================================Verify Admin Login================================================================


const verifyAdminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await adminDb.findOne({ email: email });

    if (adminData && adminData.email === email) {
      if (password == adminData.password) {
        req.session.admin_id = adminData;
        res.redirect("/admin/home");
      } else {
        res.render("adminLogin", {
          message: "your email or password is incorrect",
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};




// =======================================================rendering the category page================================================================



const loadCategoryPage = async (req, res) => {
  try {
    const perPage = 5; // Number of products per page
    let page = parseInt(req.query.page) || 1;
    const totalProducts = await categoryDb.countDocuments({});
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    const categoryDetails = await categoryDb
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render("Category", {
      categoryData: categoryDetails,
      currentPage: page,
      pages: totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};



// =======================================================rendering the addCategory page================================================================



const loadAddCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error);
  }
};


// =======================================================posting category ================================================================


const addCategory = async (req, res) => {
  try {
    const name = req.body.name;
    if (name.trim().length == 0) {
      res.redirect("/admin/category");
    } else {
      const already = await categoryDb.findOne({
        name: { $regex: name, $options: "i" },
      });
      if (already) {
        res.render("addCategory", { message: "The Catogory already exits" });
      } else {
        const categoryData = new categoryDb({ name: name });
        const addData = await categoryData.save();
        console.log(categoryData);
        console.log(addData);

        if (addData) {
          res.redirect("/admin/category");
        } else {
          res.render("addCategory", { message: "Something went Wrong" });
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// =======================================================rendering the editCategory================================================================


const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);

    const details = await categoryDb.findById({ _id: id });

    res.render("editCategory", { data: details });
  } catch (error) {
    console.log(error);
  }
};

// =======================================================post the editCategory================================================================


const editCategory = async (req, res) => {
  try {
    const name = req.body.name;

    if (name.trim().lenght == 0) {
      res.redirect("/admin/category");
    } else {
      await categoryDb.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { name: req.body.name } }
      );
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error);
  }
};

// ============================================list or unlist the category ===========================================================================


const listOrNot = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await categoryDb.findOne({ _id: id });
    if (categoryData.is_active == true) {
      const List = await categoryDb.updateOne(
        { _id: id },
        { $set: { is_active: false } }
      );

      if (List) {
        req.session.category_id = false;
      }
      res.redirect("/admin/category");
    }
    if (categoryData.is_active == false) {
      await categoryDb.updateOne({ _id: id }, { $set: { is_active: true } });

      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadCustomers = async (req, res) => {
  try {
    let userData = await getAllUserData();
    res.render("Customers", { data: userData });
  } catch (error) {
    console.log(error);
  }
};

const getAllUserData = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    let userData = await User.find({});
    resolve(userData);
  });
};

const blockUnblock = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findById(id);
    console.log("user id is : ", user);

    const userData = await User.findById({ _id: id });

    if (userData.is_blocked === true) {
      await User.updateOne({ _id: id }, { $set: { is_blocked: false } });
    }
    if (user) {
      if (req.session.user_id === id) {
        req.session.user_id = null;
      }
    }
    if (userData.is_blocked === false) {
      let block = await User.updateOne(
        { _id: id },
        { $set: { is_blocked: true } }
      );
      // res.redirect("/admin/customer")
      if (block) {
        req.session.category_id = false;
      }
    }
    res.redirect("/admin/customer");
  } catch (error) {
    console.log(error);
  }
};

const loaduserOrders = async (req, res) => {
  try {
    const orders = await orderDb.find();

    const productWiseOrdersArray = [];

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;

        const product = await productDb
          .findById(productId)
          .select("productName images price");
        const userDetails = await User.findById(order.userId).select("email");

        if (product) {
          // Push the order details with product details into the array
          productWiseOrdersArray.push({
            user: userDetails,
            product: product,
            orderDetails: {
              _id: order._id,
              userId: order.userId,
              deliveryDetails: order.deliveryDetails,
              date: order.date,
              totalAmount: productInfo.quantity * product.price,
              OrderStatus: productInfo.OrderStatus,
              StatusLevel: productInfo.statusLevel,
              paymentStatus: productInfo.paymentStatus,
              paymentMethod: order.paymentMethod,
              quantity: productInfo.quantity,
            },
          });
        }
      }
    }

    res.render("userOrders", { orders: productWiseOrdersArray });
  } catch (error) {
    console.log(error.message);
  }
};

const adminOrderFullDetails = async (req, res) => {
  try {
    const { orderId, productId } = req.query;

    const order = await orderDb.findById(orderId);

    // if (!order) {
    //   return res
    //     .status(404)
    //     .render('error-404');
    // }
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    const product = await productDb
      .findById(productId)
      .select("productName image price");

    const productOrder = {
      orderId: order._id,
      product: product,
      orderDetails: {
        _id: order._id,
        userId: order.userId,
        deliveryDetails: order.deliveryDetails,
        date: order.date,
        totalAmount: order.totalAmount,
        OrderStatus: productInfo.OrderStatus,
        StatusLevel: productInfo.statusLevel,
        paymentMethod: order.paymentMethod,
        paymentStatus: productInfo.paymentStatus,
        quantity: productInfo.quantity,
      },
    };

    res.render("orderFullDetails", {
      product: productOrder,
      orderId,
      productId,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { status, orderId, productId } = req.body;
    const order = await orderDb.findById(orderId);
    // find status level

    const statusMap = {
      Shipped: 2,
      OutforDelivery: 3,
      Delivered: 4,
    };

    const selectedStatus = status;
    const statusLevel = statusMap[selectedStatus];

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product within the order by its ID (using .toString() for comparison)
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    console.log(productInfo);
    productInfo.OrderStatus = status;
    productInfo.statusLevel = statusLevel;
    productInfo.updatedAt = Date.now();

    const result = await order.save();

    console.log(result);

    res.redirect(
      `/admin/orderFullDetails?orderId=${orderId}&productId=${productId}`
    );
  } catch (error) {
    console.log(error.message);
  }
};

const adminCancelOrder = async (req, res) => {
  try {
    const { orderId, productId } = req.body;

    const order = await orderDb.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );

    if (productInfo) {
      productInfo.OrderStatus = "Cancelled";
      productInfo.updatedAt = Date.now();

      await order.save();

      return res.json({ cancel: 1, message: "Order successfully cancelled" });
    } else {
      return res
        .status(404)
        .json({ message: "Product not found in the order." });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "An error occurred" });
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.admin_id = false;
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadAdminLogin,
  verifyAdminLogin,
  loadAdminHome,
  loadCategoryPage,
  loadAddCategory,
  loadCustomers,
  addCategory,
  loadEditCategory,
  editCategory,
  listOrNot,
  blockUnblock,
  adminLogout,
  loaduserOrders,
  adminOrderFullDetails,
  changeOrderStatus,
  adminCancelOrder,
};
