const userDb = require('../models/userModel')
const cartDb = require('../models/cartModel')
const addressDb = require('../models/userAddressModel')
const productDb = require('../models/productModel')
const orderDb = require('../models/orderModel')
const { ObjectId } = require('mongoose').Types;
const Razorpay = require('razorpay')
const crypto = require("crypto");
const { log } = require('console')

var instance = new Razorpay({
  key_id : process.env.KEY_ID ,
  key_secret: process.env.KEY_SECRET,
})


const loadCheckOut = async(req,res)=>{

    try{

      // console.log("entering loadChecout");
      const userId =req.session.user_id;
      const addressData = await addressDb.findOne({userId:userId})

      
      
      

      const userData = await userDb.findOne ({_id:userId})
      const cartData = await cartDb.findOne({user:userId}).populate("products.productId").exec()
      // console.log(cartData);
      const products = cartData.products;

      const cart = await cartDb.findOne({user:userId})
      let cartQuantity = 0
    if(cart){cartQuantity = cart.products.length}


    const total = await cartDb.aggregate([
                    {
                        $match :{user : new ObjectId(userId)}
                    },
                    {
                        $unwind : '$products'
                    },
                    {
                        $project :{
                            price :  '$products.price',
                            quantity : '$products.quantity'
                        }
                    },
                    {
                        $group :{
                            _id : null,
                            total : {
                                $sum : {
                                    $multiply : ["$quantity","$price"],
                                }
                            }
                        }
                    }
                  ]).exec();

    // console.log("the total is :", total  );


    let stock = []
    let countCart =[]
    // console.log("stock :",stock);
    // console.log("countCart :",countCart);


    for (let i = 0; i < products.length; i++) {
      stock.push(cartData.products[i].productId.quantity);
      countCart.push(cartData.products[i].quantity);
    }

    let inStock = true;
    let proIndex = 0;


    for (let i = 0; i < stock.length; i++) {
      if (stock[i] > countCart[i] || stock[i] == countCart[i]) {
        inStock = true;
      } else {
        inStock = false;
        proIndex = i;
        break;
      }
    }

    const proName = cartData.products[proIndex].productId.productName;


    if (userId) { 
      if (inStock === true) {
        if (addressData) {
          if (addressData.addresses.length > 0) {
            const address = addressData.addresses;
            const Total = total.length > 0 ? total[0].total : 0;
            const totalamount = Total;
            // const userId = userData._id;

            res.render("checkOut", {
              userId: userId,
              products: products,
              total: Total,
              totalamount,
              user: userData,
              address,
              cartQuantity
            });
          } else {
            res.redirect("/checkout");
          }
        } else {
          res.redirect("/profile");
        }
      } else {
        res.render("cart", { message: proName, userId: userId, cartQuantity });
      }
    } else {
      res.redirect("/loadLogin");
    }

    }catch(error){
        console.log(error);
    }
}




const removeAddress = async (req,res)=>{
  try{
console.log("entered into remove address");

    const id = req.body.id;
    console.log(id);
  
    const result = await addressDb.updateOne(
      { userId: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );
    console.log("result is: ",result);

    
      res.json({ remove: false });
    

  }
  catch(error){
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
}



const placeOrder = async(req,res)=>{
  try{
    const userId = req.session.user_id
    const address = req.body.address
    const cartData = await cartDb.findOne({user: userId})
    // const products = cartData.products
    const total = parseInt(req.body.total)
    // console.log("total is :",total);
    const paymentMethod = req.body.payment
    const userData = await userDb.findOne({_id:userId})
    // console.log("user Data",userData);
    const name = userData.firstName;
    const uniNum = Math.floor(Math.random() * 900000) + 100000;
    const status = paymentMethod === "COD" ? "placed" : "pending";
    const statusLevel = status === "placed" ? 1: 0;

    


    const today = new Date();
    const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + 7);

      console.log(deliveryDate);


      const cartProducts = cartData.products.map((productItem) => ({
        productId: productItem.productId,
        quantity: productItem.quantity,
        OrderStatus: "Placed",
        statusLevel: 1,
        paymentStatus: "Pending",
        "returnOrderStatus.status":"none",
        "returnOrderStatus.reason":"none",
        "cancelOrder.reason" :"none"
        
      }));


    const order = new orderDb({
      deliveryDetails: address,
      uniqueId: uniNum,
      userId: userId,
      firstName: name,
      paymentMethod: paymentMethod,
      products: cartProducts,
      totalAmount: total,
      date: new Date(),
      expectedDelivery:deliveryDate,

      

    });
    const orderData = await order.save();
      const orderid = order._id;


    if(orderData){
      if (paymentMethod === 'COD') {
        console.log("entered into cod");
        await cartDb.deleteOne({ user: req.session.user_id });
        for (const item of cartData.products) {
          const productId = item.productId._id;
          console.log("pro :",productId);
          const quantity = parseInt(item.quantity, 10);
          console.log("the count is :",quantity);
       const result= await productDb.updateOne({ _id: productId },{$inc:{quantity:-quantity}})
      //  console.log(result)
        }
        res.json({ success: true ,orderid });
      }else {
        const orderId = orderData._id;
        // console.log("orderId id :", orderId);
    const totalAmount = orderData.totalAmount;
    console.log("totalAmount is:",totalAmount);

    if(paymentMethod === 'onlinePayment'){

      console.log("entered onlinePayment");

      var options ={
        amount : totalAmount *100,
        currency: 'INR',
        receipt : "" + orderId
      }
      instance.orders.create(options, (error, order) => {
        res.json({order})
    })

    }
    console.log("end of online payment");
    
      }
      
      
      
    }
      


      
  }catch(error){
    console.log(error);
  }
}



const verifyPayment = async(req,res)=>{
  try{
    const cartData = await cartDb.findOne({user:req.session.user_id})
    const products = cartData.products
    const details = req.body;
    // console.log("details is:",details);
    const hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);

    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");
    // console.log("hmacValue",hmacValue);

    if (hmacValue === details.payment.razorpay_signature) {
      // console.log('jjj',hmacValue === details.payment.razorpay_signature);
      for (let i = 0; i < products.length; i++) {
        const productId = products[i].productId;
        const quantity = products[i].quantity;
        await productDb.findByIdAndUpdate(
          { _id: productId },
          { $inc: { quantity: -quantity } }
        );
      }
      const result =await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: {  'products.$[].paymentStatus':'success' } }
      );
      console.log("result is :",result);

      await orderDb.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { paymentId: details.payment.razorpay_payment_id } }
      );
      await cartDb.deleteOne({ user: req.session.user_id });
      const orderid = details.order.receipt;

      
     
      res.json({ codsuccess: true, orderid });

    }else {
      await orderDb.findByIdAndRemove({ _id: details.order.receipt });
      res.json({ success: false });
    }

  }catch(error){
    console.log(error);
  }
}



const orderPlacedPageLoad = async(req,res)=>{
  try{

          console.log("successfully ordered");

    // const orderId = req.params.orderid
    // const order = await orderDb.findById(orderId);

    // if (!order) {
    //   // Handle the case where the order with the given ID is not found
    //   res.status(404).send("Order not found");
    //   return;
    // }

    // const cart = await cartDb.findOne({ user: req.session.user_id });
    // let cartCount=0; 
    // if (cart) {
    //   cartCount = cart.products.length;
    // }
    

    res.render("orderPlaced"); // Pass the order data to the vie

  }catch(error){
    console.log(error);
  }
}




const loadOrderPage = async(req,res)=>{
  try{

    const userId = req.session.user_id
    const cart = await cartDb.findOne({user:userId})
    const userData = await userDb.findById({_id:userId})
    let cartCount=0; 


    if(cart){
      cartCount = cart.products.lenght
    }

    const orderData = await orderDb.find({userId:userId}).sort({date:-1})

    // console.log("orderData :",orderData);

    res.render('orders',{user:userData,orders:orderData,cartCount})


  }catch(error){
    console.log(error);
  }
}


const orderDetails = async(req,res)=>{
  try {

    const userId = req.session.user_id
    const userData = await userDb.findById({_id:userId})
    const id = req.query.id;

    console.log(id);
    const orderedProduct = await orderDb.findOne({ _id: id }).populate(
      "products.productId"
    );

    // console.log("orderedData is :", orderedProduct); 


    // const currentDate = new Date();   
    // const deliveryDate = orderedProduct.deliveryDate;
    // const timeDiff = currentDate - deliveryDate;
    // const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

    const cart = await cartDb.findOne({ user: req.session.user_id });
    let cartCount=0; 
    // let wishCount=0;
    if (cart) {
      cartCount = cart.products.length;
    }
    

    res.render("orderDetails", {
      user: userData,
      orders: orderedProduct,
      cartCount,
    });
  } catch (error) {
    console.log(error.message);
  }
}



const addCheckoutAddress = async(req,res)=>{
  try{

    console.log("entered in to add address")

    const user = req.session.user_id;
    const addressData = await addressDb.findOne({ userId: user });
    console.log("address data :",addressData);
    if (addressData) {
      const updated = await addressDb.updateOne(
        { userId: user },
        {
          $push: {
            addresses: {
              fullName: req.body.fullName,
              mobile: req.body.mobile,
              country: req.body.country,
              city: req.body.city,
              state: req.body.state,
              pincode: req.body.pincode,
            },
          },
        }
      );
      console.log(updated)
      if (updated) {
        res.redirect("/checkout");
      } else {
        res.redirect("/checkout");
        console.log("not added");
      }
    } else {
      res.redirect("/checkout");
    }

  }catch(error){
    console.log(error);
  }
}

 const loadCheckoutEditAddress =async(req,res)=>{
  try{

    console.log("hai");
    const id = req.query.id
    console.log(id);
    const userId = req.session.user_id
    const userData = await userDb.findById({_id:userId})

    let userAddress = await addressDb.findOne({ userId: userId  },{addresses:{$elemMatch:{_id:id}}})

    const address= userAddress.addresses

    console.log(address);

    

    res.render('editCheckOutAddress', {user:userId,addresses:address[0]})

  }catch(error){
    console.log(error);
  }

}



const editCheckoutAddress = async(req,res)=>{
  try{
     console.log("entere address edit");
    const addressId =req.body.id
    console.log("addressId :",addressId);
    
    const userId = req.session.user_id
    console.log(userId);
    


    const pushAddress = await addressDb.updateOne(
      { userId: userId , "addresses._id":addressId},
      {
        $set: {
          
           "addresses.$.fullName": req.body.fullName,
           "addresses.$.mobile": req.body.mobile,
           "addresses.$.country": req.body.country,
           "addresses.$.city": req.body.city,
           "addresses.$.state": req.body.state,
           "addresses.$.pincode": req.body.pincode,
          
        },
      }
    );
    console.log(pushAddress);
    res.redirect("/checkout");
    

  }catch(error){
    console.log(error);
  }

}

const cancelOrder = async (req,res)=>{
  console.log('hi');
  try {
    const { orderId, productId } = req.body;
    // orderId = orderId.toString
    console.log(orderId);

    const order = await orderDb.findById(orderId);

    // console.log(order);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product within the order by its ID (using .toString() for comparison)
    const productInfo = order.products.find(
      (product) => product.productId.toString() === productId
    );
    console.log(productInfo);
    productInfo.OrderStatus = "Cancelled";
    productInfo.updatedAt = Date.now()
    const result = await order.save();

    const quantity = productInfo.quantity
    // console.log("quantity",quantity);
    const proId = productInfo.productId
    // console.log("proId",proId);

    const updateQuantity = await productDb.findOneAndUpdate(
      {_id:proId},
      {$inc:{quantity:quantity}}
    )

    console.log(updateQuantity);

    // console.log(result);
    res.json({ cancel: 1 });
  } catch (error) {
    console.log(error.message);
  }
}


const productReturn = async(req,res)=>{
  try{
    console.log('entered in product return');
    const orderId = req.body.orderid
    const returnAmout = req.body.totalPrice
    const returnReason = req.body.reason
    const amount = parseInt(returnAmout)
    const orderData = await orderDb.findOne({_id:orderId})
    const products = orderData.products
    const userData = await userDb.findOne({})
    let totalWalletBalance = userData.wallet + amount

    const result = await userDb.findByIdAndUpdate(
      {_id:req.session.user_id},
      {
        $inc:{wallet:amount},
        $push:{
          walletHistory:{
            transactionDate: new Date(),
            transactionAmount: amount,
            transactionDetails: "Returned Product Amount Credited.",
            transactionType:"credit",
            currentBalance:totalWalletBalance
          },
        },
      },
      {new: true}
    );
    
    if(result){
      const updatedData = await orderDb.updateOne(
        {_id:orderId},
        {$set:{"products.$[].returnOrderStatus.reason":returnReason , "products.$[].OrderStatus":"Returned","products.$[].statusLevel":6 }}
      )
      if(updatedData){
        for(i=0 ; i<products.length; i++){
          const productId = products[i].productId;
          const quantity = products[i].quantity;
          await productDb.findByIdAndUpdate(
            {_id:productId},
            {$inc:{quantity:quantity}}
          )
        }
        res.redirect('/orders')
      }else{
        console.log('order Not Updated');
      }
    }else{
      console.log('user not found');
    }

  }catch(error){
    console.log(error);
  }
}







module.exports={
    loadCheckOut,
    removeAddress,
    placeOrder,
    orderPlacedPageLoad,
    loadOrderPage,
    orderDetails,
    addCheckoutAddress,
    loadCheckoutEditAddress,
    editCheckoutAddress,
    cancelOrder,
    verifyPayment,
    productReturn
    

}