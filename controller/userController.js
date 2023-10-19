const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const config = require("../config/config");
const otpGenerator = require("otp-generator");
const productDb = require('../models/productModel')
const categoryDb = require('../models/categoryModel');
const { AwsInstance } = require("twilio/lib/rest/accounts/v1/credential/aws");

// require("dotenv").config();
// ==============================================================SECURING THE PASSWORD================================================================
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// ==============================================================SENDING MAIL IN TO THE USER================================================================


const otpSend = async (Fname, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "farzinahammedabc@gmail.com",
        pass: "iirs drxr fais mmqq",
      },
    });
    console.log("hahah");
    // Email message
    const mailOptions = {
      from: "farzinahammedabc@gmail.com",
      to: email,
      subject: "OTP Verification",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* Add some basic styling to the email for a better user experience */
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center; /* Center horizontally */
            align-items: center; /* Center vertically */
            height: 100vh; /* Set the body to full viewport height */
          }
          .otp-container {
            background-color: #f4f4f4;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
          }
          .otp-label {
            color: green; /* Add the green color to the label */
          }
        </style>
      </head>
      <body>
        <div>
          <h1>OTP Verification</h1>
          <p><span class="otp-label">Hi, <b>'+ Fname + '</b> Your OTP is:</span></p>
          <div class="otp-container">
            <h2>${otp}</h2>
          </div>
        </div>
      </body>
      </html>
      
    `,
    };
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error sending email", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================LOADING OTP PAGE================================================================

const loadOtp = async (req, res) => {
  try {
    res.redirect("/userOtp");
  } catch (error) {
    console.log(error.message);
  }
};

// ==============================================================VERIFYING THE OTP ================================================================

const verifyOtp = async (req, res) => {
  try {
    const currentTime = Date.now() / 1000;
    if (
      req.body.otp === req.session.otp.code &&
      currentTime <= req.session.otp.expire
    ) {
      console.log(req.session.otp.code);
      console.log("verify otp");
      const user = await User({
        firstName: req.session.Fname,
        lastName: req.session.Lname,
        email: req.session.email,
        mobile: req.session.mobile,
        password: req.session.password,
        isVerified: 1,
      });
      const result = await user.save();
      res.redirect("/login");
    } else {
      res.render("userOtp", { message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================RESEND THE OTP AFTER THE TIME================================================================

const resendOtp = (req, res) => {
  try {
    const currentTime = Date.now() / 1000;
    console.log("current", currentTime);
    if (req.session.otp.expire != null) {
      console.log("hai");
      if (currentTime > req.session.otp.expire) {
        console.log("expire", req.session.otp.expire);
        const newDigit = otpGenerator.generate(6, {
          digits: true,
          alphabets: false,
          specialChars: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
        });
        req.session.otp.code = newDigit;
        const newExpiry = currentTime + 30;
        console.log(newExpiry);
        req.session.otp.expire = newExpiry;
        otpSend(req.session.Fname, req.session.email, req.session.otp.code);
        res.render("userOtp", { message: `New OTP send into your mail` });
      } else {
        res.render("userOtp", { message: `OTP send to into your mail` });
      }
    } else {
      res.send("Already registered");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ==============================================================INSERTING THE USERS================================================================

const insertUser = async (req, res) => {
  try {
    const otpDigit = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    const creationTime = Date.now() / 1000;
    const expirationTime = creationTime + 30;

    const userCheck = await User.findOne({ email: req.body.email });
    if (userCheck) {
      res.send("user already exist");
    } else {
      const spassword = await securePassword(req.body.password);
      req.session.Fname = req.body.Fname;
      req.session.Lname = req.body.Lname;
      req.session.email = req.body.email;
      req.session.mobile = req.body.mobile;
      if (req.body.Fname && req.body.email) {
        if (req.body.password === req.body.Cpassword) {
          req.session.password = spassword;
          req.session.otp = {
            code: otpDigit,
            expire: expirationTime,
          };
          otpSend(req.session.name, req.session.email, req.session.otp.code);

          res.render("userOtp");
        } else {
          res.render("registration", { message: "Password doesn't match" });
        }
      } else {
        res.render("registration", { message: "Please enter all details" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================LOAD REGISTRATION PAGE================================================================


const loadResgister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

// ==============================================================LOADING THE LOGIN PAGE================================================================


const loadlogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

// ==============================================================VERIFYING THE USER LOGIN================================================================


const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    console.log("userdata " + userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        
        console.log("password matched");
        res.redirect("/");
      } else {
        console.log("password is not matched");
        res.render("login", { message: "incorrect your email address" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};



// ==============================================================USER LOGOUT========================================================================


const userLogout = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================SEND MAIL INTO RESETTING THE PASSWORD ================================================================


const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "farzinahammedabc@gmail.com",
        pass: "iirs drxr fais mmqq",
      },
    });
    const mailoptions = {
      from: "farzinahammedabc@gmail.com",
      to: email,
      subject: "For reset password",
      html:
        "<p>Hii " +
        name +
        ', please click here to  <a href="http://127.0.0.1:5000/reset-password?token=' +
        token +
        '"> Reset  </a> your password',
    };

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been send", info.response);
      }
    });
  } catch (error) {
    console.log("error", error.message);
  }
};

// ==============================================================LOADING FORGET PASSWORD PAGE================================================================


const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.error();
  }
};

// ==============================================================FORGOT PASSWORD================================================================


const ForgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerified === false) {
        res.render("forgotPassword", { message: "Please verify your email" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        console.log(updatedData);
        sendResetPasswordMail(userData.name, userData.email, randomString);
        res.render("forgotPassword", {
          message: "Please check your mail to reset your password",
        });
      }
    } else {
      res.render("forgotPassword", { message: "Please enter correct email" });
    }
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================LOADING RESETING PAGE================================================================

const resetLoad = async (req, res) => {
  try {
    const token = req.query.token;
    console.log(token);
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("resetPassword", { user_id: tokenData._id });
    } else {
      res.render("404", { message: "token invalid" });
    }
  } catch (error) {
    console.log(error);
  }
};

// ==============================================================RESET PASSWORD POST================================================================


const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const spassword = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: spassword, token: "" } }
    );
    console.log(updatedData);

    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};



// ==============================================================LOADING THE HOME PAGE ================================================================


const loadHome = async (req, res) => {
  try {

 
   
    res.render('home')
  } catch (error) {
    console.log(error.message);
  }
};




// ==============================================================load Shop Details==================================================================


const loadShop = async (req, res) => {
  try {
    const perPage = 12; // Number of products per page
    let page = parseInt(req.query.page) || 1; // Get the page from the request query and parse it as an integer
    const categoryDetails = await categoryDb.find({});
    const totalProducts = await productDb.countDocuments({ is_active: true });
    const totalPages = Math.ceil(totalProducts / perPage);

    // Ensure that the page is within valid bounds
    if (page < 1) {
      page = 1;
    } else if (page > totalPages) {
      page = totalPages;
    }

    const products = await productDb
      .find({ is_active: true })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render('shop', {
      catData: categoryDetails,
      product: products,
      currentPage: page,
      pages: totalPages,
    });
  } catch (error) {
    console.log(error);
  }
};




// ==============================================================load ProductDetails================================================================

const loadProductDetails = async(req,res)=>{
  try{
      console.log("haloo");
    const id = req.query.id
    console.log(id);
    const products = await productDb.findById({_id:id})

    console.log(products);
    res.render('productDetails',{product:products})
    

  }catch(error){
    console.log(error);
  }
}










module.exports = {
  loadlogin,
  loadResgister,
  insertUser,
  verifyOtp,
  loadHome,
  verifyOtp,
  resendOtp,
  loadOtp,
  verifyLogin,
  loadForgotPassword,
  ForgotPassword,
  userLogout,
  resetLoad,
  resetPassword,
  loadProductDetails,
  loadShop
};
