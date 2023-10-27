const userDb = require('../models/userModel')
const cartDb = require('../models/cartModel')
const addressDb = require('../models/userAddressModel')
const productDb = require('../models/productModel')
const orderDb = require('../models/orderModel')
const { ObjectId } = require('mongoose').Types;


const loadCheckOut = async(req,res)=>{

    try{

        console.log("entered loadCheckout");
        const userId = req.session.user_id
        console.log(userId);

        const cartDetails = await cartDb.findOne({user:userId}).exec();

        console.log("cartDetails :",cartDetails);

        if(cartDetails){
          let Total
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
          ]).exec()
          Total = total[0].total
            const userAddress = await addressDb.findOne({userId:req.session.user_id},{addresses:1})

            if(userAddress){
                res.render('checkout',{user:req.session.user_id, total:Total, address:userAddress.addresses})
            }else{
                res.render('checkout',{
                    user:req.session.user_Id,
                    total,
                    address:0

                })
            }
        }else{
            res.redirect('/cart')
        }

    }catch(error){
        console.log(error);
    }
}



const useThisAddress = async(req,res)=>{

    console.log("entered use this address");
  try {
    const userId = req.session.user_id
    let userAddress = await addressDb.findOne({ userId: req.session.user_id });

    if (userAddress) {
      const selectedAddress = userAddress.addresses.find((address) => {
        return address._id.toString() === req.body.address.toString();
      });

      console.log("selectedAddress");

      

      if (selectedAddress) {
        
        let Total
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
          ]).exec()
          Total = total[0].total
          console.log(Total);
        return res.render("orderPayment", {
          user: userId,
          address: selectedAddress,
          total,
        });
      } 
    } 
  } catch (error) {
    console.log(error.message);
  }

  
}







const selectPayment = async(req,res)=>{
  try{

    const addressId = req.body.id

    let payment =
      req.body.paymentMethod === 'COD' 

      const userAddress = await addressDb.findOne({userId:req.session.user_id})
      const selectedAddress = userAddress.addresses.find((address) => {
        return address._id.toString() === addressId.toString();
      });

      const cartDetails = await cartDb.find({user:req.session.user_id}).populate("products.productId").exec()

      if (cartDetails) {
        let Total
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
      ]).exec()
      Total = total[0].total
        // let deliveryDate = await daliveryDateCalculate();
        // console.log(deliveryDate);
        res.render("finalcheckout", {
          total:Total,
          address: selectedAddress,
          user: req.session.user_id,
          payment,
          cartItems: cartDetails,
          // deliveryDate,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
}




module.exports={
    loadCheckOut,
    selectPayment,
    useThisAddress
}