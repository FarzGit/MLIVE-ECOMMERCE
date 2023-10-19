const adminDb = require("../models/adminModel");
const categoryDb = require("../models/categoryModel");
const User = require("../models/userModel");
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
      categoryData: categoryDetails ,
      currentPage: page,
      pages: totalPages,
    
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

const loadAddCategory = async (req, res) => {
  try {
    res.render("addCategory");
  } catch (error) {
    console.log(error);
  }
};

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

    const userData = await User.findById({ _id: id });

    if (userData.is_blocked === true) {
      await User.updateOne({ _id: id }, { $set: { is_blocked: false } });
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
};
