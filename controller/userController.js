const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomstring = require('randomstring')
const config = require('../config/config')
const otpGenerator = require('otp-generator')
const productDb = require('../models/productModel')
const categoryDb = require('../models/categoryModel')
const addressDb = require('../models/userAddressModel')
const Swal = require('sweetalert2')
const { AwsInstance } = require('twilio/lib/rest/accounts/v1/credential/aws')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const cartDb = require('../models/cartModel')
const BannerDB = require('../models/bannerModel')
const { ObjectId } = require('mongoose').Types

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
})

// ==============================================================SECURING THE PASSWORD================================================================
const securePassword = async password => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================SENDING MAIL IN TO THE USER================================================================

const otpSend = async (Fname, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMPT_PASS
      }
    })
    // Email message
    const mailOptions = {
      from: 'farzinahammedabc@gmail.com',
      to: email,
      subject: 'OTP Verification',
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
      
    `
    }
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('error sending email', error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================LOADING OTP PAGE================================================================

const loadOtp = async (req, res) => {
  try {
    res.render('userOtp')
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================VERIFYING THE OTP ================================================================

const verifyOtp = async (req, res) => {
  try {
    const currentTime = Date.now() / 1000
    if (
      req.body.otp === req.session.otp.code &&
      currentTime <= req.session.otp.expire
    ) {
      const user = await User({
        firstName: req.session.Fname,
        lastName: req.session.Lname,
        email: req.session.email,
        mobile: req.session.mobile,
        password: req.session.password,
        isVerified: 1
      })
      const result = await user.save()

      res.json({ success: true })
    } else {
      res.json({ success: false, message: 'Invalid OTP' })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================RESEND THE OTP AFTER THE TIME================================================================

const resendOtp = (req, res) => {
  try {
    const currentTime = Date.now() / 1000
    if (req.session.otp.expire != null) {
      if (currentTime > req.session.otp.expire) {
        const newDigit = otpGenerator.generate(6, {
          digits: true,
          alphabets: false,
          specialChars: false,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false
        })
        req.session.otp.code = newDigit
        const newExpiry = currentTime + 30
        req.session.otp.expire = newExpiry
        otpSend(req.session.Fname, req.session.email, req.session.otp.code)
        res.render('userOtp', { message: `New OTP send into your mail` })
      } else {
        res.render('userOtp', { message: `OTP send to into your mail` })
      }
    } else {
      res.send('Already registered')
    }
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================INSERTING THE USERS================================================================

const insertUser = async (req, res) => {
  try {
    const otpDigit = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false
    })

    const creationTime = Date.now() / 1000
    const expirationTime = creationTime + 30
    const userCheckMobile = await User.findOne({ mobile: req.body.mobile })
    const userCheck = await User.findOne({ email: req.body.email })
    let emailError = ''
    let mobileError = ''

    if (userCheck) {
      emailError = 'Email is already in use.'
    }

    if (userCheckMobile) {
      mobileError = 'Mobile number is already in use.'
    }

    if (emailError || mobileError) {
      res.json({ emailError, mobileError })
    } else {
      const spassword = await securePassword(req.body.password)
      req.session.Fname = req.body.Fname
      req.session.Lname = req.body.Lname
      req.session.email = req.body.email
      req.session.mobile = req.body.mobile
      if (
        req.body.Fname &&
        req.body.email &&
        req.body.Lname &&
        req.body.password
      ) {
        if (req.body.password === req.body.Cpassword) {
          req.session.password = spassword
          req.session.otp = {
            code: otpDigit,
            expire: expirationTime
          }
          otpSend(req.session.name, req.session.email, req.session.otp.code)
        } else {
          res.json({ message: "Password doesn't match" })
        }
      } else {
        res.json({ message: 'Please enter all details' })
      }
      res.json({ message: 'Success' })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================LOAD REGISTRATION PAGE================================================================

const loadResgister = async (req, res) => {
  try {
    res.render('registration')
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================LOADING THE LOGIN PAGE================================================================

const loadlogin = async (req, res) => {
  try {
    res.render('login')
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================VERIFYING THE USER LOGIN================================================================

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({ email: email })
    if (userData) {
      if (userData.is_blocked == false) {
        const passwordMatch = await bcrypt.compare(password, userData.password)

        if (passwordMatch) {
          if (userData.isVerified == false) {
            req.session.user_id = userData._id
            res.json({ message: 'please verify your mail' })
          } else {
            req.session.user_id = userData._id

            res.json({ message: 'success' })
          }
        } else {
          res.json({ message: 'Invalid Credentials' })
        }
      } else {
        res.json({ message: 'This User is blocked' })
      }
    } else {
      res.json({ message: 'User not Found' })
    }
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==============================================================USER LOGOUT========================================================================

const userLogout = async (req, res) => {
  try {
    req.session.user_id = false
    res.redirect('/login')
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================SEND MAIL INTO RESETTING THE PASSWORD ================================================================

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'farzinahammedabc@gmail.com',
        pass: 'iirs drxr fais mmqq'
      }
    })
    const mailoptions = {
      from: 'farzinahammedabc@gmail.com',
      to: email,
      subject: 'For reset password',
      html:
        '<p>Hii ' +
        name +
        ', please click here to  <a href="http://127.0.0.1:5000/reset-password?token=' +
        token +
        '"> Reset  </a> your password'
    }

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('Email has been send', info.response)
      }
    })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================LOADING FORGET PASSWORD PAGE================================================================

const loadForgotPassword = async (req, res) => {
  try {
    res.render('forgotPassword')
  } catch (error) {
    console.error()
    res.render('500')
  }
}

// ==============================================================FORGOT PASSWORD================================================================

const ForgotPassword = async (req, res) => {
  try {
    const email = req.body.email
    const userData = await User.findOne({ email: email })
    if (userData) {
      if (userData.isVerified === false) {
        res.render('forgotPassword', { message: 'Please verify your email' })
      } else {
        const randomString = randomstring.generate()
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        )
        sendResetPasswordMail(userData.name, userData.email, randomString)
        res.render('forgotPassword', {
          messages: 'Please check your mail to reset your password'
        })
      }
    } else {
      res.render('forgotPassword', { message: 'Email is not existing' })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================LOADING RESETING PAGE================================================================

const resetLoad = async (req, res) => {
  try {
    const token = req.query.token
    const tokenData = await User.findOne({ token: token })
    if (tokenData) {
      res.render('resetPassword', { user_id: tokenData._id })
    } else {
      res.render('404', { message: 'token invalid' })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================RESET PASSWORD POST================================================================

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password
    const user_id = req.body.user_id
    const spassword = await securePassword(password)
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: spassword, token: '' } }
    )

    res.redirect('/login')
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================LOADING THE HOME PAGE ================================================================

const loadHome = async (req, res) => {
  try {
    const userId = req.session.user_id

    if (userId) {
      const category = await categoryDb.find()
      const banners = await BannerDB.find({ status: true })
      const userData = await User.findById({ _id: userId })
      const product = await productDb
        .find({ is_active: true })
        .limit(8)
        .populate('category')
        .populate('offer')
      res.render('home', { user: userData, banners, product, category })
    } else {
      const banners = await BannerDB.find({ status: true })
      const product = await productDb
        .find({ is_active: true })
        .limit(8)
        .populate('category')
        .populate('offer')

      const category = await categoryDb.find()
      res.render('home', { message: 'user logged', banners, product, category })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================load Shop Details==================================================================

const loadShop = async (req, res) => {
  try {
    let page = 1
    if (req.query.page) {
      page = req.query.page
    }

    let limit = 12 // Number of products per page

    let sortValue = -1
    if (req.query.sortValue) {
      if (req.query.sortValue === '2') {
        sortValue = 1
      } else if (req.query.sortValue === '1') {
        sortValue = -1
      } else {
        sortValue = -1
      }
    }

    let minPrice = 1
    let maxPrice = 20000

    if (req.query.minPrice) {
      minPrice = req.query.minPrice
    }
    if (req.query.maxPrice) {
      maxPrice = req.query.maxPrice
    }

    let search = ''

    if (req.query.search) {
      search = req.query.search
    }

    async function getCategoryIds (search) {
      const categories = await categoryDb.find({
        name: { $regex: '.*' + search + '.*', $options: 'i' }
      })
      return categories.map(category => category._id)
    }

    const query = {
      is_active: true,
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { brand: { $regex: '.*' + search + '.*', $options: 'i' } },
        { productName: { $regex: '.*' + search + '.*', $options: 'i' } }
      ],
      price: { $gte: minPrice, $lte: maxPrice }
    }

    if (req.query.search) {
      search = req.query.search
      query.$or.push({
        Category: { $in: await getCategoryIds(search) }
      })
    }

    if (req.query.category) {
      query.category = req.query.category
    }

    if (req.query.brand) {
      query.brand = req.query.brand
    }

    /**.sort({_id:-1 for latest sorting is _id better to change by createdAt:-1}) */
    let products = await productDb
      .find(query)
      .populate('category')
      .populate('offer')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    if (req.query.sortValue && req.query.sortValue != 3) {
      products = await productDb
        .find(query)
        .populate('category')
        .populate('offer')
        .sort({ price: sortValue })
        .limit(limit * 1)
        .skip((page - 1) * limit)
    } else {
      /**.sort({_id:-1 for latest sorting is _id better to change by createdAt:-1}) */
      products = await productDb
        .find(query)
        .populate('category')
        .populate('offer')
        .sort({ createdAt: sortValue })
        .limit(limit * 1)
        .skip((page - 1) * limit)
    }

    const userId = req.session.user_id

    const categoryDetails = await categoryDb.find({})
    const totalProducts = await productDb.countDocuments({ is_active: true })
    let pageCount = Math.ceil(totalProducts / limit)
    const userData = await User.findById({ _id: userId })
    const brands = await productDb.aggregate([{ $group: { _id: '$brand' } }])

    res.render('shop', {
      catData: categoryDetails,
      product: products,
      currentPage: page,
      pageCount,
      user: userId,
      user: userData,
      brands,
      brand: req.query.brand,
      sortValue: req.query.sortVlaue,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
      category: req.query.category
    })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================load ProductDetails================================================================

const loadProductDetails = async (req, res) => {
  try {
    const id = req.query.id
    const products = await productDb.findById({ _id: id }).populate('offer')

    res.render('productDetails', { product: products })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==============================================================load Profile=======================================================================

const loadProfile = async (req, res) => {
  try {
    const id = req.session.user_id
    const userData = await User.findById({ _id: id })
    let userAddress = await addressDb.findOne({ userId: id })

    res.render('profile', { user: userData, address: userAddress })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================loadCheckout==================================================================

// ===================================================================loaduserAddress==================================================================

const loadAddress = async (req, res) => {
  try {
    const userId = req.session.user_id
    const userData = await User.findById({ _id: userId })

    res.render('address', { user: userData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================addAddress In users==================================================================

const addAddress = async (req, res) => {
  try {
    let userAddress = await addressDb.findOne({ userId: req.session.user_id })
    if (!userAddress) {
      userAddress = new addressDb({
        userId: req.session.user_id,
        addresses: [
          {
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
          }
        ]
      })
    } else {
      userAddress.addresses.push({
        fullName: req.body.fullName,
        mobile: req.body.mobile,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode
      })
    }

    let result = await userAddress.save()

    res.redirect('/profile')
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ===================================================================load Edit user Adderes==================================================================

const loadEditAddress = async (req, res) => {
  try {
    const id = req.query.id
    const userId = req.session.user_id

    const userData = await User.findById({ _id: userId })

    let userAddress = await addressDb.findOne(
      { userId: userId },
      { addresses: { $elemMatch: { _id: id } } }
    )

    const address = userAddress.addresses

    res.render('editAddress', { user: userData, addresses: address[0] })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================ChangePassword==================================================================

const changePassword = async (req, res) => {
  try {
    const currentpd = req.body.currentpassword
    const newpd = req.body.newpassword
    const confirmpd = req.body.confirmpassword

    const user = req.session.user_id
    const userData = await User.findOne({ _id: user })

    const oldpd = userData.password

    if (userData) {
      const passwordMatch = await bcrypt.compare(currentpd, oldpd)

      if (passwordMatch) {
        if (newpd === confirmpd) {
          const secure = await securePassword(newpd)
          const store = await User.updateOne(
            { _id: user },
            { $set: { password: secure } }
          )
          res.json({ success: true })
        } else {
          res.json({
            success: false,
            message: 'New and Confirm Password do not match.'
          })
        }
      } else {
        res.json({ success: false, message: 'Current Password is incorrect.' })
      }
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================postEditAddress==================================================================

const updateUserAddress = async (req, res) => {
  try {
    const addressId = req.body.id

    const userId = req.session.user_id

    const pushAddress = await addressDb.updateOne(
      { userId: userId, 'addresses._id': addressId },
      {
        $set: {
          'addresses.$.fullName': req.body.fullName,
          'addresses.$.mobile': req.body.mobile,
          'addresses.$.country': req.body.country,
          'addresses.$.city': req.body.city,
          'addresses.$.state': req.body.state,
          'addresses.$.pincode': req.body.pincode
        }
      }
    )
    res.redirect('/profile')
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================deleteUserAddress==================================================================

const deleteUserAddress = async (req, res) => {
  try {
    const id = req.body.id
    const userId = req.session.user_id
    const deleteAddress = await addressDb.updateOne(
      { userId: userId },
      { $pull: { addresses: { _id: id } } }
    )

    res.json({ remove: true })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================postAddMoneyToWallet=====================================================

const postAddMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body
    const id = crypto.randomBytes(8).toString('hex')

    var options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'hello' + id
    }

    instance.orders.create(options, (err, order) => {
      if (err) {
        res.json({ status: false })
      } else {
        res.json({ status: true, payment: order })
      }
    })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================postVerifyWalletPayment=====================================================

const postVerifyWalletPayment = async (req, res) => {
  try {
    const userId = req.session.user_id

    const details = req.body
    const amount = parseInt(details.order.amount) / 100
    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)

    hmac.update(
      details.payment.razorpay_order_id +
        '|' +
        details.payment.razorpay_payment_id
    )
    hmac = hmac.digest('hex')
    if (hmac == details.payment.razorpay_signature) {
      const walletHistory = {
        transactionDate: new Date(),
        transactionDetails: 'Deposited via Razorpay',
        transactionType: 'Credit',
        transactionAmount: amount,
        currentBalance: !isNaN(userId.wallet) ? userId.wallet + amount : amount
      }
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $inc: {
            wallet: amount
          },
          $push: {
            walletHistory
          }
        }
      )
      res.json({ status: true })
    } else {
      res.json({ status: false })
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================getWallet history==========================================================

const getWalletHistory = async (req, res) => {
  try {
    const user = req.session.user_id
    const userData = await User.findOne({ _id: user })
    req.session.cartCount = 0
    let cartData = await cartDb.findOne({ user: userData._id })
    if (cartData && cartData.products) {
      req.session.cartCount = cartData.products.length
    }
    res.render('walletHistory', {
      user: userData,
      cartCount: req.session.cartCount
    })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ===================================================================== load Wallet page in user==========================================================

const getWallet = async (req, res) => {
  try {
    const user = req.session.user_id
    const userData = await User.find({ _id: user })
    console.log('userdata:', userData)

    res.render('wallet', { user: userData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================load about page in user side==========================================================

const loadAbout = async (req, res) => {
  try {
    const userId = req.session.user_id
    const userData = await User.findById({ _id: userId })

    res.render('about', { user: userData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================load contact page in user side==========================================================

const loadContact = async (req, res) => {
  try {
    const userId = req.session.user_id
    const userData = await User.findById({ _id: userId })

    res.render('contact', { user: userData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// =====================================================================posting the contact through smtp==========================================================

const postContact = async (req, res, next) => {
  try {
    const { email, message } = req.body
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: 'farzinahammedabc@gmail.com',
        pass: process.env.SMPT_PASS
      }
    })
    const mailDetails = {
      from: 'farzinahammedabc@gmail.com',
      to: process.env.SMTP_MAIL,
      subject: 'customer deals',
      html: `<h5 style="text-align: center;">Email: ${email}</h5>
          <h4 style="text-align: center; color: red">Message:</h4>
          <p style="text-align: center;">${message}</p>
          `
    }
    transporter.sendMail(mailDetails, function (error, info) {
      if (error) {
        next(error)
        res.json({ status: false })
      } else {
        console.log('Contact Form Email sent successfully', info.response)
        res.json({ status: true })
      }
    })
  } catch (error) {
    next(error)
  }
}

// =====================================================================func of handle the 404 error ==========================================================

const error404 = async (req, res) => {
  try {
    res.render('404')
  } catch (error) {
    console.log(error)
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
  loadShop,
  loadProfile,
  loadAddress,
  addAddress,
  loadEditAddress,
  updateUserAddress,
  deleteUserAddress,
  postAddMoneyToWallet,
  postVerifyWalletPayment,
  getWallet,
  getWalletHistory,
  changePassword,
  loadAbout,
  loadContact,
  postContact,
  error404
}
