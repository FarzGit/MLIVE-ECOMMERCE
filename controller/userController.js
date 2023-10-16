const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring=require('randomstring')
const config=require('../config/config')

// require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpSend = async (email, otp) => {
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
          <p><span class="otp-label">Your OTP is:</span></p>
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

const loadOtp = async (req, res) => {
  try {
    res.redirect("/userOtp");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    console.log("fbhjgdahfj");
    // setting otp date and time
    const otpCode = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP expires in 10 minutes

    const userCheck = await User.findOne({ email: req.body.email });
    if (userCheck) {
      res.send("user already exist");
    } else {
      const spassword = await securePassword(req.body.password);
      req.session.Fname = req.body.Fname;
      req.session.Lname = req.body.Lname;
      req.session.mobile = req.body.mobile;
      req.session.email = req.body.email;

      if (
        req.body.Fname &&
        req.body.email &&
        req.body.Lname &&
        req.body.mobile
      ) {
        if (req.body.password === req.body.Cpassword) {
          req.session.password = spassword;
          req.session.otp = {
            code: otpCode,
            expire: otpExpiry,
          };
          // Send OTP to the user's email
          otpSend(req.session.email, req.session.otp.code);
          console.log(req.session.otp.code);
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



const resendOtp = (req, res)=>{
  try{
      const currentTime = Date.now()/1000;
      console.log("current",currentTime)
      if (req.session.otp.expire != null) {
        console.log("hai");
           if(currentTime > req.session.otp.expire){
              console.log("expire",req.session.otp.expire);
              const newDigit = otpGenerator.generate(6, { 
                  digits: true,
                  alphabets: false, 
                  specialChars: false, 
                  upperCaseAlphabets: false,
                  lowerCaseAlphabets: false 
              });
              req.session.otp.code = newDigit;
              const newExpiry=currentTime+30
              console.log(newExpiry);
              req.session.otp.expire=newExpiry
              otpSend(req.session.email, req.session.otp.code);
              res.render("userOtp",{message: `New OTP send into your mail`});
           }else{
              res.render("userOtp",{message: `OTP send to into your mail`});
           }
      }
      else{
          res.send("Already registered")
      }
  }
  catch(error){
      console.log(error.message);
  }
}

const resendVerifyOtp = async (req,res)=>{
  try{

  }catch(error){
    console.log(error);
  }
}




const insertUser = async (req, res) => {
  console.log("insert");

  try {
    if (req.session.otp && req.body.otp === req.session.otp.code) {
      console.log("enter");

      const user = await new User({
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
      res.render("userOtp", { message: "invalid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadResgister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

const loadlogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};



  const verifyLogin=async(req,res)=>{
    try {
      const email = req.body.email
      console.log(email);
      const password = req.body.password
      const userData = await User.findOne({ email: email })
      console.log("userdata " + userData);
      if (userData) {
          const passwordMatch = await bcrypt.compare(password, userData.password)
          if (passwordMatch) {
              console.log('password matched');
              res.redirect('/')
          } else {
              console.log('password is not matched');
              res.render('login', { message: "incorrect your email address" })
          }
      } 

  } catch (error) {
      console.log(error.message);
  }
}

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async(req,res)=>{
  try{
    req.session.user_id = false;
    res.redirect('/login')

  }catch(error){
    console.log(error);
  }
}


const sendResetPasswordMail = async (name, email, token)=> {
  try {
          const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: "farzinahammedabc@gmail.com",
            pass: "iirs drxr fais mmqq",
          }
      });
      const mailoptions = {
          from:"farzinahammedabc@gmail.com",
          to:email,
          subject:"For reset password",
          html :   '<p>Hii '+name+', please click here to  <a href="http://127.0.0.1:5000/reset-password?token='+token+'"> Reset  </a> your password'     
      }

      transporter.sendMail(mailoptions, (error, info) => {
          if (error) {
              console.log(error)
          } else {
              console.log("Email has been send",info.response);
          }
      })
  } catch (error) {
      console.log("error",error.message);
  }
}




const loadForgotPassword = async(req,res)=>{
  try{

    res.render('forgotPassword')

  }catch(error){
    console.error();
  }
}

const ForgotPassword=async (req,res)=>{
  try {
      const email=req.body.email
      const userData=await User.findOne({email:email})
      if (userData) {
         
          if(userData.isVerified===false){
              res.render('forgotPassword',{message:"Please verify your email"})
          }else{
              const randomString=randomstring.generate()
              const updatedData=await User.updateOne({email:email},{$set:{token:randomString}})
              console.log(updatedData);
              sendResetPasswordMail(userData.name,userData.email,randomString)
              res.render('forgotPassword',{message:"Please check your mail to reset your password"})
          }
      }else{
          res.render('forgotPassword',{message:"Please enter correct email"})
      }
  } catch (error) {
      console.log(error);
  }
}
const resetLoad=async (req,res)=>{
  try {
      const token=req.query.token
      console.log(token);
      const tokenData=await User.findOne({token:token})
      if(tokenData){
        res.render('resetPassword',{user_id:tokenData._id})
      }else{
          res.render('404',{message:'token invalid'})
      }
      
  } catch (error) {
      console.log(error);
  }
}

const resetPassword=async (req,res)=>{
  try {
      const password=req.body.password
      const user_id=req.body.user_id
      const spassword=await securePassword(password)
      const updatedData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:spassword,token:''}})
      console.log(updatedData);
       
      res.redirect('/login')
  } catch (error) {
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
  resetPassword
};
