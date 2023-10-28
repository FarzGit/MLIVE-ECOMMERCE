const userDb = require('../models/userModel')
const cartDb = require('../models/cartModel')
const addressDb = require('../models/userAddressModel')
const productDb = require('../models/productModel')
const orderDb = require('../models/orderModel')
const { ObjectId } = require('mongoose').Types;


const loadCheckOut = async(req,res)=>{

    try{

      console.log("entering loadChecout");
      const userId =req.session.user_id;
      const addressData = await addressDb.findOne({userId:userId})
      

      const userData = await userDb.findOne ({_id:userId})
      const cartData = await cartDb.findOne({user:userId}).populate("products.productId").exec()
      console.log(cartData);
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

    console.log("the total is :", total  );


    let stock = []
    let countCart =[]
    console.log("stock :",stock);
    console.log("countCart :",countCart);


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
      console.log("called if userId api");
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
            res.redirect("/");
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
    await addressDb.updateOne(
      { userId: req.session.user_id },
      { $pull: { address: { _id: id } } }
    );

    res.json({ remove: true });

  }catch(error){
    console.log(error);
  }
}



const placeOrder = async(req,res)=>{
  try{
    const userId = req.session.user_id
    const address = req.body.address
    const cartData = await cartDb.findOne({user: userId})
    const products = cartData.products
    const total = parseInt(req.body.total)
    console.log("total is :",total);
    const paymentMethod = req.body.payment
    const userData = await userDb.findOne({_id:userId})
    console.log("user Data",userData);
    const name = userData.firstName;
    const uniNum = Math.floor(Math.random() * 900000) + 100000;
    const status = paymentMethod === "COD" ? "placed" : "pending";
    const statusLevel = status === "placed" ? 1: 0;

    const order = new orderDb({
      deliveryDetails: address,
      uniqueId: uniNum,
      userId: userId,
      firstName: name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount: total,
      date: new Date(),
      status: status,
      statusLevel: statusLevel

      

    });
    const orderData = await order.save();
      const orderid = order._id;



      if (order.status === "placed") {
        await cartDb.deleteOne({ userId: req.session.user_id });
        for (let i = 0; i < products.length; i++) {
          const pro = products[i].productId;
          console.log("pro :",pro);
          const count = parseInt(products[i].quantity);
          console.log("the count is :",count);
          
          console.log(await productDb.findOneAndUpdate(
            { _id: pro },
            { $inc: { quantity: -count } }
          ));
        }
        
        
      }
      

  }catch(error){
    console.log(error);
  }
}




const orderPlacedPageLoad = async(req,rse)=>{
  try{

    const cart = await cartDb.findOne({ user: req.session.user_id });
    let cartCount=0; 
    if (cart) {
      cartCount = cart.products.length;
    }
    

    res.render("orderPlaced", {  cartCount });

  }catch(error){
    console.log(error);
  }
}











// const useThisAddress = async(req,res)=>{

//     console.log("entered use this address");
//   try {
//     const userId = req.session.user_id
//     let userAddress = await addressDb.findOne({ userId: req.session.user_id });

//     if (userAddress) {
//       const selectedAddress = userAddress.addresses.find((address) => {
//         return address._id.toString() === req.body.address.toString();
//       });

//       console.log(selectedAddress);

      

//       if (selectedAddress) {
        
//         let Total
//         const total = await cartDb.aggregate([
//               {
//                   $match :{user : new ObjectId(userId)}
//               },
//               {
//                   $unwind : '$products'
//               },
//               {
//                   $project :{
//                       price :  '$products.price',
//                       quantity : '$products.quantity'
//                   }
//               },
//               {
//                   $group :{
//                       _id : null,
//                       total : {
//                           $sum : {
//                               $multiply : ["$quantity","$price"],
//                           }
//                       }
//                   }
//               }
//             ]).exec();
//           Total = total[0].total
//           console.log(Total);
//         return res.render("orderPayment", {
//           user: userId,
//           address: selectedAddress,
//           total:Total,
//         });
//       } 
//     } 
//   } catch (error) {
//     console.log(error.message);
//   }

  
// }







// const itemsAndDelivery = async(req,res)=>{

//     console.log("itemsAndDelivery");
//   try{


//     const addressId = req.body.id
//     const userId = req.session.user_id
//     let payment =
//       req.body.paymentMethod === 'COD'?"Cash On Delivery":paymentMethod

//       console.log("payment Method is :",payment);

//       const userAddress = await addressDb.findOne({userId:req.session.user_id}) 
//       const selectedAddress = userAddress.addresses.find((address) => {
//         return address && address._id ? address._id.toString() : null;
//     });
//       console.log("selected Address:", selectedAddress)

//       const cartDetails = await cartDb.find({user:req.session.user_id}).exec()

//       console.log("cartDetails items and delivery : ", cartDetails[0]);

//       if (cartDetails) {
//         let Total
//         const total = await cartDb.aggregate([
//           {
//               $match :{user : new ObjectId(userId)}
//           },
//           {
//               $unwind : '$products'
//           },
//           {
//               $project :{
//                   price :  '$products.price',
//                   quantity : '$products.quantity'

//               }
//           },
//           {
//               $group :{
//                   _id : null,
//                   total : {
//                       $sum : {
//                           $multiply : ["$quantity","$price"],
//                       }
//                   }
//               }
//           }
//       ]).exec()
//       Total = total[0].total
//         // let deliveryDate = await daliveryDateCalculate();
//         // console.log(deliveryDate);
//         res.render("finalcheckout", {
//           total:Total,
//           address: selectedAddress,
//           user: req.session.user_id,
//           payment,
//           cartItems: cartDetails,
//           // deliveryDate,
//         });
//       }
//     } catch (error) {
//       console.log(error.message);
//     }
// }



// const loadplaceOrder = async (req, res) => {
//     try {
//       // const orderId = req.query.id;
//       console.log(req.body);
//       // let orderDetails = await OrderDB.findOne({ _id: orderId });
//       if(req.body.status=="success"){
//        return res.render("orderPlaced", {
//           success: 1,
//           user: req.session.user_id,
//       });
//       }else{
//        return res.render("orderPlaced", {
//           success: 0,
//           user: req.session.user_id,
//       });
//       }
      
//     } catch (error) {
//       console.log(error.message);
//     }
//   };








// const placeOrder = async(req,res)=>{
//     try{

//       console.log("entered in to the place order function");

//         let addressId = req.body.address;

//     let paymentType = req.body.payment;
//     const cartDetails = await cartDb.findOne({ user: req.session.user_id });

//     let userAddress = await addressDb.findOne({ userId: req.session.user_id });
//     const shipAddress = userAddress.addresses.find((address) => {
//       return address._id.toString() === addressId.toString();
//     });

//     // console.log("collected:", shipAddress);

    
//     // console.log("collected :" + shipAddress);
//     const { country, fullName, mobileNumber, pincode, city, state } =
//       shipAddress;
//     // console.log(state);

//     const cartProducts = cartDetails.products.map((productItem) => ({
//       productId: productItem.product,
//       quantity: productItem.quantity,
//       OrderStatus: "pending",
//       StatusLevel: 1,
//       paymentStatus: "pending",
//       "returnOrderStatus.status":"none",
//       "returnOrderStatus.reason":"none"
//     }));
//     let Total
//     const total = await cartDb.aggregate([
//       {
//           $match :{user : new ObjectId(userId)}
//       },
//       {
//           $unwind : '$products'
//       },
//       {
//           $project :{
//               price :  '$products.price',
//               quantity : '$products.quantity'

//           }
//       },
//       {
//           $group :{
//               _id : null,
//               total : {
//                   $sum : {
//                       $multiply : ["$quantity","$price"],
//                   }
//               }
//           }
//       }
//   ]).exec()
//   Total = total[0].total

//   const order = new orderDb({
//     userId: req.session.user_id,
//     "shippingAddress.country": country,
//     "shippingAddress.fullName": fullName,
//     "shippingAddress.mobile": mobile,
//     "shippingAddress.pincode": pincode,
//     "shippingAddress.city": city,
//     "shippingAddress.state": state,
//     products: cartProducts,
//     totalAmount: Total,
//     paymentMethod: paymentType,
   
//     // orderDate:new Date(),
    
//   });
//   const placeorder = await order.save();



//     }catch(error){
//         console.log(error);
//     }
// }



module.exports={
    loadCheckOut,
    removeAddress,
    placeOrder,
    orderPlacedPageLoad
    // itemsAndDelivery,
    // useThisAddress,
    // loadplaceOrder,
    // placeOrder
}