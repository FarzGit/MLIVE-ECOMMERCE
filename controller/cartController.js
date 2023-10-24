const cartDb = require("../models/cartModel")
const userDb = require("../models/userModel")
const productDb = require("../models/productModel")






// const addToCart = async (req, res) => {
//     try {
//         if (req.session.user) {
//             const productId = req.body.productId;
//             const userName = req.session.user;
//             const userData = await userDb.findOne({ email: userName });
//             const userId = userData._id;
//             const productData = await productDb.findById(productId);
//             const userCart = await cartDb.findOne({ user: userId });

//             if (userCart) {
//                 const productExist = await userCart.product.findIndex(product => product.productId === productId);
//                 if (productExist !== -1) {
//                     const cartData = await cartDb.findOne(
//                         { user: userId, "product.productId": productId },
//                         { "product.productId.$": 1, "product.quantity": 1 }
//                     );

//                     const [{ quantity: quantity }] = cartData.product;

//                     if (productData.status <= quantity) {
//                         res.json({ outofstock: true });
//                     } else {
//                         await cartDb.findOneAndUpdate({ user: userId, "product.productId": productId }, { $inc: { "product.$.quantity": 1 } });
//                         res.json({ success: true });
//                     }
//                 } else {
//                     if (productData.status <= 0) {
//                         res.json({ outofstock: true });
//                     } else {
//                         await cartDb.findOneAndUpdate({ user: userId }, { $push: { product: { productId: productId, price: productData.price } } });
//                         res.json({ success: true });
//                     }
//                 }
//             } else {
//                 if (productData.status <= 0) {
//                     res.json({ outofstock: true });
//                 } else {
//                     const data = new cartDb({
//                         user: userId,
//                         product: [{ productId: productId, price: productData.price }]
//                     });
//                     await data.save();
//                     res.json({ success: true });
//                 }
//             }
//         } else {
//             res.json({ login: true });
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };



const addToCart=async (req,res)=>{
    try {
        console.log("add cart entered");
        if(req.session.user_id){
            console.log(req.session.user_id);
        const productId=req.body.id
        console.log("productId :"+ productId);
        const name=req.session.user_id
        const userData=await userDb.findOne({_id:name})
        console.log("userData is :"+userData);
        const userId=userData._id
        console.log("userId is :"+userId);
        console.log("hallo");
        const productData=await productDb.findById({_id:productId})
        console.log(productData);
         
        const userCart=await cartDb.findOne({user:userId})

        if(userCart){
            await cartDb.updateOne({user:userId},{
                $push:{products:{productId:productId}}
            })
        }else{
            const data=new cartDb({
                user:userId,
                products:[{productId:productId}]
            })
            const result=await data.save()
            console.log(result);
            // res.redirect('/addTocart')
            res.json({success:true})
        }
    }else{
        res.json({login : true})
    }
       
    } catch (error) {
        console.log(error);
    }
}

const loadCart = async(req,res)=>{
    try{

        res.render('cart')

    }catch(error){
        console.log(error);
    }
}





module.exports={
    addToCart,
    loadCart 
}