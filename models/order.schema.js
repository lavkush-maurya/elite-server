const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    product: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product is required"],
          },
          quantity: {
            type: Number,
            required: [true, "Quantity is Required"],
          },
        },
      ],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total Amount is Required"],
    },
    paymentId: {
      type: String,
      require: [true, "Payment Id is Required"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is Required"],
    },
    city: {
      type: String,
      required: [true, "Shipping address is Required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is Required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number is Required"],
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);
module.exports = Order;
