const offerDb = require('../models/offerModel')

// ==================================================================load offer page in admin side ============================================

const loadOffer = async (req, res) => {
  try {
    const offers = await offerDb.find()
    res.render('offer', {
      offers: offers,
      now: new Date()
    })
  } catch (error) {
    console.log(error.message)
    res.render('admin500')
  }
}

// ==================================================================load add offer page in admin side ============================================

const loadaddOffer = async (req, res) => {
  try {
    res.render('addOffer')
  } catch (error) {
    console.log(error.message)
    res.render('admin500')
  }
}

// ==================================================================load edit offer page in admin side ============================================

const loadEditOffer = async (req, res) => {
  try {
    const id = req.params.id
    const offer = await offerDb.findOne({ _id: id })
    res.render('editOffer', {
      offer: offer
    })
  } catch (error) {
    console.log(error.message)
    res.render('admin500')
  }
}

// ==================================================================post add offer offer page  ===================================================

const AddOffer = async (req, res) => {
  try {
    const { search, page } = req.query
    const { startingDate, expiryDate, percentage } = req.body
    const name = req.body.name.toUpperCase()
    const offerExist = await offerDb.findOne({ name: name })
    if (offerExist) {
      res.render('addOffer', { message: 'Offer already existing' })
    } else {
      const offer = new offerDb({
        name: name,
        startingDate: startingDate,
        expiryDate: expiryDate,
        percentage: percentage,
        search: search,
        page: page
      })
      await offer.save()
      res.redirect('/admin/offer')
    }
  } catch (error) {
    console.log(error.message)
    res.render('admin500')
  }
}

// ==================================================================post edit offer page in admin side ============================================

const postEditOffer = async (req, res) => {
  try {
    const { id, name, startingDate, expiryDate, percentage } = req.body

    await offerDb.updateOne(
      { _id: id },
      {
        $set: {
          name: name.toUpperCase(),
          startingDate: startingDate,
          expiryDate: expiryDate,
          percentage: percentage
        }
      }
    )
    res.redirect('/admin/offer')
  } catch (error) {
    console.log(error.message)
    res.render('admin500')
  }
}

// ==================================================================cancel offer from admin side============================================

const cancelOffer = async (req, res) => {
  try {
    const { offerId } = req.body
    await offerDb.updateOne(
      { _id: offerId },
      {
        $set: {
          status: false
        }
      }
    )
    res.json({ cancelled: true })
  } catch (error) {
    res.json({ cancelled: false, message: 'Cant cancel some errors' })
    res.render('admin500')
  }
}

module.exports = {
  loadOffer,
  loadaddOffer,
  loadEditOffer,
  AddOffer,
  postEditOffer,
  cancelOffer
}
