const productDb = require('../models/productModel')
const User = require('../models/userModel')
const categoryDb = require('../models/categoryModel')
const adminDb = require('../models/adminModel')
const offerDb = require('../models/offerModel')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const { log } = require('console')
const { ObjectId } = require('mongodb')

// ==========================================================load the product page===============================================================

const loadProducts = async (req, res) => {
  try {
    const products = await productDb.find().populate('offer')

    const availableOffers = await offerDb.find({
      status: true,
      expiryDate: { $gte: new Date() }
    })

    res.render('Products', {
      product: products,
      availableOffers
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
}

// ==========================================================load admin Product details product page===============================================================

const loadAdminProductDetails = async (req, res) => {
  try {
    const id = req.query.id

    const product = await productDb.findById({ _id: id }).populate('category')

    res.render('adminViewProductDetails', { product: product })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================load add product page admin side===============================================================

const loadAddProducts = async (req, res) => {
  try {
    const categoryData = await categoryDb.find()

    res.render('addProducts', { cartData: categoryData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================post add product from admin side===============================================================

const addProduct = async (req, res) => {
  try {
    const productName = req.body.productName
    const category = req.body.category
    const description = req.body.description
    const price = req.body.price
    const status = req.body.status
    const quantity = req.body.quantity
    const brand = req.body.brand

    const image = []

    for (i = 0; i < req.files.length; i++) {
      image[i] = req.files[i].filename
    }

    const newProduct = new productDb({
      productName: productName,
      category: category,
      description: description,
      price: price,
      status: status,
      quantity: quantity,
      brand: brand,
      image: image
    })

    const result = await newProduct.save()
    res.redirect('/admin/Product')
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================load edit product page admin side===============================================================

const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id
    const cartData = await categoryDb.find()

    const product = await productDb.findById({ _id: id })

    res.render('editProduct', { product, cartData })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================post edit product from admin side===============================================================

const editProduct = async (req, res) => {
  try {
    const id = req.body.id

    const productName = req.body.productName
    const category = req.body.category
    const description = req.body.description
    const price = req.body.price
    const status = req.body.status
    const quantity = req.body.quantity
    const brand = req.body.brand

    const image = []

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        image.push(req.files[i].filename)
      }
    }

    const existingProduct = await productDb.findById(id)

    if (existingProduct) {
      existingProduct.productName = productName
      existingProduct.category = category
      existingProduct.description = description
      existingProduct.price = price
      existingProduct.status = status
      existingProduct.quantity = quantity
      existingProduct.brand = brand

      if (image.length > 0) {
        existingProduct.image = existingProduct.image.concat(image)
      }

      const updatedProduct = await existingProduct.save()

      if (updatedProduct) {
        res.redirect('/admin/Product')
      } else {
        res.render('editProduct', {
          data: existingProduct,
          message: 'something went Wrong'
        })
      }
    } else {
      res.render('admin/product')
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================product soft delete functions===============================================================

const productListorUnlist = async (req, res) => {
  try {
    const id = req.query.id

    const productData = await productDb.findById({ _id: id })

    if (productData.is_active === true) {
      const List = await productDb.updateOne(
        { _id: id },
        { $set: { is_active: false } }
      )

      if (List) {
        req.session.product_id = false
      }
      res.redirect('/admin/Product')
    }
    if (productData.is_active === false) {
      await productDb.updateOne({ _id: id }, { $set: { is_active: true } })
      res.redirect('/admin/Product')
    }
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

// ==========================================================apply the product offer===============================================================

const applyProductOffer = async (req, res) => {
  try {
    const productId = req.body.productId
    const offerId = req.body.offerId

    const offer = await offerDb.findOne({ _id: offerId })

    if (!offer) {
      return res.json({ success: false, message: 'Offer not found' })
    }

    const product = await productDb
      .findOne({ _id: productId })
      .populate('category')

    if (!product) {
      return res.json({ success: false, message: 'Product not found' })
    }

    // Get the category discount, if available
    const categoryDiscount =
      product.category && product.category.offer
        ? await offerDb.findOne({ _id: product.category.offer })
        : 0

    // Calculate real price and discounted price for the product
    const discountPercentage = offer.percentage
    const originalPrice = parseFloat(product.price)
    const discountedPrice =
      originalPrice - (originalPrice * discountPercentage) / 100

    // Check if category offer is available and its discount is greater than product offer
    if (categoryDiscount && categoryDiscount.percentage > discountPercentage) {
      return res.json({
        success: false,
        message: 'Category offer has greater discount'
      })
    }

    await productDb.updateOne(
      { _id: productId },
      {
        $set: {
          offer: offerId,
          discountedPrice: discountedPrice
        }
      }
    )

    const updatedProduct = await productDb
      .findOne({ _id: productId })
      .populate('offer')
    res.json({ success: true, data: updatedProduct })
  } catch (error) {
    console.log(error.message)
    res.render('500')
  }
}

// ==========================================================remove the product offer admin side===============================================================

const removeProductOffer = async (req, res) => {
  try {
    const { productId } = req.body

    const remove = await productDb.updateOne(
      { _id: productId },
      {
        $unset: {
          offer: '',
          discountedPrice: '',
          realPrice: ''
        }
      }
    )

    res.json({ success: true, data: remove })
  } catch (error) {
    console.log(error)
    res.render('500')
  }
}

module.exports = {
  loadProducts,
  loadAddProducts,
  addProduct,
  loadEditProduct,
  editProduct,
  productListorUnlist,
  loadAdminProductDetails,
  applyProductOffer,
  removeProductOffer
}
