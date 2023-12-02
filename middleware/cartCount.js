const User = require("../models/userModel");
const Cart = require("../models/cartModel");

const cartMiddleware = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const user = req.session.user_id;
      const userData = await User.findById({ _id: user });

   

      if (!userData) {
        return res.redirect("/login");
      }
      

      const cart = await Cart.findOne({ user: user });
      const count = cart ? cart.products.length : 0;
      res.locals.count = count;
      next();
    } else {
      const count = 0;
      res.locals.count = count;
      next();
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = cartMiddleware;
