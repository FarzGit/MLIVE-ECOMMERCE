const adminDb = require("../models/adminModel");
const categoryDb = require('../models/categoryModel')
const bcrypt = require("bcrypt");

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    log(error);
  }
};

const verifyAdminLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await adminDb.findOne({ email: email });
    console.log(adminData);

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

const loadAdminHome = async (req, res) => {
  try {
    res.render("adminHome");
  } catch (error) {
    console.log(error);
  }
};

const loadCategoryPage = async (req,res)=>{

  try{

    const categoryDetails = await categoryDb.find()

    res.render('Category',{categoryData:categoryDetails})

  }catch(error){
    console.log(error);
  }
}

const loadAddCategory = async(req,res)=>{
  try{

    res.render('addCategory')

  }catch(error){
    console.log(error);
  }
}


const addCategory = async (req,res)=>{
  try{

    const name = req.body.name;
    if(name.lenght == 0){
      res.redirect('/admin/category')
    }else{
      const already = await categoryDb.findOne({
        name:{$regex : name, $options: "i"}
      })
      if(already){
        res.render('addCategory',{message:"The Catogory already exits"})
      }else{
        const categoryData = new categoryDb({name:name})
        const addData = await categoryData.save()

        if(addData){
          res.redirect("/admin/category")
        }else{
          res.render("addCategory",{message:"Something went Wrong"})
        }

      }
    }

  }catch(error){
    console.log(error);
  }
}

const loadEditCategory = async (req,res)=>{
  try{

    const id = req.query.id

    const details = await categoryDb.findById({_id:id})
    res.render('editCategory',{data:details})

  }catch(error){
    console.log(error);
  }
}


const editCategory = async (req,res)=>{
  try{
    const name = req.body.name

    if(name.lenght == 0){
      res.redirect('/admin/category')
    }else{
      await categoryDb.findByIdAndUpdate({_d:req.query.id},{$set:{name: req.body.name}})
      
    }
    res.redirect('/admin/category')
    
  }catch(error){
    console.log(error);
  }
}

const loadCustomerPage = async (req,res)=>{
  try{
      res.render('Customers')
  }catch(error){
    console.log(error);
  }
}

module.exports = {
  loadAdminLogin,
  verifyAdminLogin,
  loadAdminHome,
  loadCategoryPage,
  loadAddCategory,
  loadCustomerPage,
  addCategory,
  loadEditCategory,
  editCategory
};
