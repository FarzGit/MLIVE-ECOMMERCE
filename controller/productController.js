
const productDb = require('../models/productModel')
const User = require('../models/userModel')
const categoryDb = require('../models/categoryModel')
const adminDb = require('../models/adminModel')
const sharp = require('sharp')
const path = require("path");
const { log } = require('console')

const {ObjectId} = require('mongodb')




const loadProducts = async (req, res) => {
  try {
    const perPage = 8; // Number of products per page
    let page = parseInt(req.query.page) || 1;
    const totalProducts = await productDb.countDocuments({});
    const totalPages = Math.ceil(totalProducts / perPage);

    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    const products = await productDb
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      

    console.log('products', products);

    res.render('Products', {
      product: products,
      currentPage: page,
      pages: totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



  const loadAddProducts =async(req,res)=>{
    try{

     

        const categoryData = await categoryDb.find();
     
        res.render("addProducts", { cartData: categoryData});

    }catch(error){
        console.log(error);
    }
  }

  const addProduct = async(req,res)=>{
    try{
            
      const productName = req.body.productName
      const category = req.body.category
      const description = req.body.description
      const price = req.body.price
      const status = req.body.status
      const quantity = req.body.quantity
      const brand = req.body.brand

      const image =[]

      for(i = 0; i < req.files.length; i++){
        image[i] = req.files[i].filename
      }

      const newProduct = new productDb({
        productName:productName,
        category:category,
        description:description,
        price:price,
        status:status,
        quantity:quantity,
        brand:brand,
        image:image

      })

      
   
      const result = await newProduct.save()
      console.log('result'+result);
      console.log(result);
      res.redirect('/admin/Product')

  }catch(error){
    console.log(error);
    
  }
}



const loadEditProduct = async (req, res) => {
  try {

    const id = req.query.id  
    const cartData = await categoryDb.find();
     
    const product = await productDb.findById({ _id: id })
        console.log(product);

        res.render('editProduct', { product,cartData})

  } catch (error) {
    console.log(error);
  }
}


const editProduct = async (req,res)=>{
  try{
           console.log(req.body);
     const id = req.body.id
     console.log(id);
    
    const productName = req.body.productName
      const category = req.body.category
      const description = req.body.description
      const price = req.body.price
      const status = req.body.status
      const quantity = req.body.quantity
      const brand = req.body.brand

      const image =[]

      for(i = 0; i < req.files.length; i++){
        image[i] = req.files[i].filename
      }
      const result = await productDb.findByIdAndUpdate({_id:id},
        { $set:{
          productName:productName,
          category:category,
          description:description,
          price:price,
          status:status,
          quantity:quantity,
          brand:brand,
          image:image
        }})
        console.log(req.body);

        if(result){
          res.redirect('/admin/Product')
        }else{
          res.render('editProduct',{message:"something went Wrong"})
        }

  }catch(error){
    console.log(error);
  }
}


const productListorUnlist = async (req,res)=>{
  try{

    console.log("hallo");
    const id = req.query.id;
    

    console.log(id);

    

    const productData = await productDb.findById({ _id: id });
    console.log(productData);

    if (productData.is_active === true) {
      const List= await productDb.updateOne(
        { _id: id }, 
        { $set: { is_active: false } 
      });

      if(List){
        req.session.product_id = false;
      }
      res.redirect("/admin/Product")
    }
    if(productData.is_active===false){
      await productDb.updateOne(
        {_id:id},
        {$set:{is_active:true}})
        res.redirect("/admin/Product")
    }
   

  }catch(error){
    console.log(error);
  }
}











module.exports ={
    loadProducts,
    loadAddProducts,
    addProduct, 
    loadEditProduct ,
    editProduct,
    productListorUnlist
}




