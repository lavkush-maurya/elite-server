const route = require("express").Router();
const config = require("../config/index");
const Stripe = require("stripe");
const stripe = Stripe(config.STRIPE_KEY);
const CustomError = require("../helper/customError")


route.post("/create-payment-intent", async (req, res) => {
   try {
      const { totalAmount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
         amount: totalAmount * 100,
         currency: "inr",
         automatic_payment_methods: {
            enabled: true,
         },
      });
      res.send({
         clientSecret: paymentIntent.client_secret,
      });
   } catch (err) {
      // console.log(err)
      // return CustomError(401, "Stripe Payment Failed")
      console.log("err ===>",err);
   }
});
module.exports = route;