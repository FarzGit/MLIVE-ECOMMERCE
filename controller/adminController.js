const adminDb = require("../models/adminModel");
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

module.exports = {
  loadAdminLogin,
  verifyAdminLogin,
  loadAdminHome,
};
