const cartDb = require("../models/cartModel")
const userDb = require("../models/userModel")
const productDb = require("../models/productModel")
const { ObjectId } = require('mongoose').Types;


const addToCart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const productId = req.body.id;
            const name = req.session.user_id;
            const userData = await userDb.findOne({ _id: name });
            const userId = userData._id;
            const productData = await productDb.findById(productId);

            const userCart = await cartDb.findOne({ user: userId });

            if (userCart) {
                const productExist = await userCart.products.findIndex(product => product.productId == productId)

                // console.log(productExist);

                if (productExist != -1) {
                    const cartData = await cartDb.findOne({ user: userId, "products.productId": productId },
                        { "products.productId.$": 1, "products.quantity": 1 })

                    const [{ quantity: quantity }] = cartData.products

                    if (productData.quantity <= quantity) {
                        res.json({ outofstock: true })
                    } else {
                        await cartDb.findOneAndUpdate({ user: userId, "products.productId": productId },
                            { $inc: { "products.$.quantity": 1 } })
                    }

                } else {
                    await cartDb.findOneAndUpdate({ user: userId }, { $push: { products: { productId: productId, 
                        price: productData.discountedPrice
                        ? Math.ceil(productData.discountedPrice) // Use discounted price if available
                        : productData.price, // Otherwise, use regular price
                    } 
                } 
            }
            );
                }


            } else {
                const data = new cartDb({
                    user: userId,
                    products: [{ productId: productId, price: productData.price }]
                });
                const result = await data.save();
            }
            res.json({ success: true });
        } else {
            res.json({ loginRequired: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).res.render("admin500")

    }
};

    const loadCart = async(req,res)=>{
        try{

            const id = req.session.user_id

            const userData = await userDb.findById({_id:id})
            
            const userId = userData._id
            
            const cartData = await cartDb.findOne({user:userId}).populate("products.productId")
            // console.log("cartData :", cartData);
            if (req.session.user_id) {
                if(cartData){
                    let Total;
                    if(cartData.products != 0){
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
                                        $sum :  {
                                            $multiply : ["$quantity","$price"]
                                        }
                                    }
                                }
                            }
                        ])
                        Total = total[0].total

                        // console.log(Total);

        
                       
                        res.render('cart', { user: userData, cart: cartData.products, userId: userId, total: Total });
                    }else{
                        res.render('cart', { user: req.session.user_id,  cart: [],total:0 });
                    }
                }else {
                    res.render('cart', { user: req.session.user, cart: [] ,total: 0  });
                } 
            } else {
                res.render('cart', { message: "User Logged", cart: [] ,total: 0 });
            }

        

        }catch(error){
            console.log(error);
            res.render("admin500")

        }
    }

    const cartQuantity = async(req,res)=>{
        try{
            
            const userId = req.session.user_id
            const productId = req.body.product
            // console.log("productId : ",productId);
            const count = parseInt(req.body.count)

            const cartData = await cartDb.findOne({user:new ObjectId(userId),"products.productId":new ObjectId(productId)},{"products.productId.$":1 , "products.quantity":1})
            // console.log("cardData is :",cartData);

            const [{quantity:quantity}] = cartData.products

            const stockAvailale = await productDb.findById({_id:new ObjectId(productId)})
            // console.log("stockAvailale",stockAvailale.quantity);
            
            if(stockAvailale.quantity < quantity + count){
                res.json({ changeSuccess: false, check: true })
                return;
            }else{
                await cartDb.updateOne(
                    {user:userId, "products.productId" : productId},
                    {$inc : {"products.$.quantity" : count}})
                    res.json({changeSuccess:true})
            }

            const updateCartData = await cartDb.findOne({user:userId})
            // console.log("updateCartData : ", updateCartData.products);
             

            const updateProduct = updateCartData.products.find(
                (product) => product.productId.toString() === productId.toString()
            );


            // console.log("updateProduct :",updateProduct)
            const updateQuantity = updateProduct.quantity
            // console.log("updatedQuantity :",updateQuantity);
            const  productPrice = stockAvailale.price;

            const productTotal = productPrice * updateQuantity
            // console.log("product total is :", productTotal);

            await cartDb.updateOne(
                { user: userId, "products.productId": productId },
      { $set: { "products.$.totalPrice": productTotal } }
            )




        }catch(error){
            console.log(error);
            res.render("admin500")

        }
    }


    const removeProduct=async (req,res)=>{
        try {
            
              const productId=req.body.product
                
              const user=req.session.user_id
              const userId=user._id
    
                 const cartData=await cartDb.findOneAndUpdate({"products.productId":productId},
                    {
                        $pull:{products:{productId:productId}}
                    }
                 )
                 res.json({success:true})
    
        } catch (error) {
            console.log(error);
            res.render("admin500")

        }
    }





module.exports={
    addToCart,
    loadCart ,
    cartQuantity,
    removeProduct
}