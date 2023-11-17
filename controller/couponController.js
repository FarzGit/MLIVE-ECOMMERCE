const couponDb = require('../models/couponModel')
const userDb = require('../models/userModel')
const cartDb = require('../models/cartModel')




const calculateTotalPrice = async (userId) => {
    try {
      const cart = await cartDb.findOne({ user: userId }).populate(
        "products.product"
      );
  
      if (!cart) {
        console.log("User does not have a cart.");
      }
  
      let totalPrice = 0;
      for (const cartProduct of cart.products) {
        const { product, quantity } = cartProduct;
        const productSubtotal = product.price * quantity;
        totalPrice += productSubtotal;
      }
  
      // console.log('Total Price:', totalPrice);
      return totalPrice;
    } catch (error) {
      console.error("Error calculating total price:", error.message);
      return 0;
    }
  };




const loadCouponMangements = async (req,res)=>{
    try{
        
        const couponItems = await couponDb.find()
        res.render('coupon',{couponItems,couponAdded:req.session.couponAdded})

    }catch(error){
        console.log(error)
    }
}

const loadAddCouponMangements = async (req,res)=>{
    try{
        res.render('addCoupon')
    }catch(error){
        console.log(error)
    }
}


const loadEditCouponMangements = async (req,res)=>{
    try{
        console.log("entered")

        console.log(req.query.id)
     
        const coupon = await couponDb.findOne({_id:req.query.id})
        res.render('editCoupon',{coupon:coupon})
    }catch(error){
        console.log(error)
    }
}

const addNewCoupon = async (req,res)=>{
    try{
        const{
            couponName,
            couponCode,
            discountAmount,
            validFrom,
            validTo,
            minimumSpend,
            usersLimit,
            description

        }=req.body

        const couponValidation = await couponDb.findOne({couponCode:couponName})
        console.log("couponValidation :",couponValidation)

        if(!couponValidation){
            const coupon = new couponDb({
                couponName,
                couponCode,
                discountAmount,
                validFrom,
                validTo,
                minimumSpend,
                usersLimit,
                description

            })
           const result = await coupon.save()
        
            req.session.couponAdded =1
           res.redirect("/admin/couponManagement");
        }else{
            req.session.couponAdded =1
           res.redirect("/admin/addcouponManagement");
        }

    }catch(error){
        console.log(error)
    }
}


const editCoupon = async(req, res)=>{
    try{
        console.log("ID to update:", req.query.id);
        const{
            couponName,
            couponCode,
            discountAmount,
            validFrom,
            validTo,
            minimumSpend,
            usersLimit,
            description

        }=req.body

        const validFromDate = validFrom; 
    const validToDate = validTo; 

    // const couponValidation = await couponDb.findOne({couponCode:couponCode})
    // console.log("couponValidation :",couponValidation)
    const updateCoupon = await couponDb.updateOne(
        { _id: req.query.id },
        {
            $set:{
                couponName:couponName,
                couponCode:couponCode,
                discountAmount:discountAmount,
                validFrom:validFromDate,
                validTo:validToDate,
                minimumSpend:minimumSpend,
                usersLimit:usersLimit,
                description:description
            },
    })
    console.log("updateCoupon :",updateCoupon)
    // req.session.couponAdded =2
    return res.redirect("/admin/couponManagement");

    }catch(error){
        console.log(error)
    }
        
}

const deleteCoupon = async(req,res)=>{
    try{
        console.log("ID to delete:", req.query.id);
        const deleteCoupon = await couponDb.deleteOne({_id:req.query.id})
        console.log("deleteCoupon :",deleteCoupon)
        return res.redirect("/admin/couponManagement");
    }catch(error){
        console.log(error)
    }
}

const couponUserPageLoad = async (req, res) => {
    try {
      const coupons = await couponDb.find();
      console.log(coupons);
      res.render("coupon", { user: req.session.user_id, coupons });
    } catch (error) {
      console.log(error.message);
    }
  };



  const ApplyCoupon = async (req, res) => {
    try {
      const userId=req.session.user_id
      console.log("userId ",userId)
    //   const userData=await User.findOne({name:name})
    //   const userId=userData._id
      const code = req.body.code;
      console.log("code is : ", code)

      req.session.code = code;
      const amount = Number(req.body.amount);
      console.log("amount is : ",amount)

      const cartData = await cartDb.findOne({ user: userId }).populate('products.productId')
    //   console.log("cartData is : ",cartData)

      let totalPrice=0
      const userExist = await couponDb.findOne({
        couponCode: code,
        usedUsers: { $in: [userId] },
      });
      console.log("userExist is : ",userExist)


      if (cartData) {
        if (cartData.products.length > 0) {
            const products = cartData.products
            

            for (const product of cartData.products) {
                totalPrice += product.quantity * product.productId.price;
            }
          }
        }
      
      if (userExist) {
        res.json({ user: true });
      } else {
        const couponData = await couponDb.findOne({ couponCode: code });

      console.log("couponData is : ", couponData)
        
        
        if (couponData) {
          if (couponData.usersLimit <= 0) {
            res.json({ limit: true });
          } else {
            if (couponData.status == false) {
              res.json({ status: true });
            } else {
              if (couponData.expiryDate <= new Date()) {
                res.json({ date: true });   
              }else if(couponData.activationDate >= new Date()){
                res.json({ active : true})
              }else {
                if (couponData.minimumSpend >= amount) {
                  res.json({ cartAmount: true });
                } else {
                 
                    
                    const disAmount = couponData.discountAmount;
                    const disTotal = Math.round(totalPrice - disAmount);
                    req.session.Amount=disTotal
                      console.log('dissss',disTotal);
                   const aplleid= await cartDb.updateOne({user:userId},{$set:{applied:"applied"}})

                   console.log("applleid is : ",aplleid)
                                  
                    return res.json({ amountOkey: true, disAmount, disTotal });
                 
                }
              }
            }
          }
        } else {
          res.json({ invalid: true });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  const deleteAppliedCoupon = async(req,res)=> {
    try {
    //   const name=req.session.user
    //   const userData=await User.findOne({name:name})
      const userId=req.session.userId
  
      const code = req.body.code;
      const couponData = await couponDb.findOne({ couponCode: code });
      const amount = Number(req.body.amount);
      const disAmount = couponData.discountAmount;
      const disTotal = Math.round(amount + disAmount);
      const deleteApplied = await cartDb.updateOne({user:userId},{$set:{applied:"not"}})
      if(deleteApplied){
        res.json({success:true, disTotal})
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  












module.exports={
    loadCouponMangements,
    loadAddCouponMangements,
    loadEditCouponMangements,
    addNewCoupon,
    editCoupon,
    deleteCoupon,
    couponUserPageLoad,
    ApplyCoupon,
    deleteAppliedCoupon

}