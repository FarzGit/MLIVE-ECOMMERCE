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


const selectPayment = async(req,res)=>{
  try{

  }catch(error){
    console.log(error);
  }
}




module.exports={
    loadCheckOut,
    selectPayment
}