const Order = require("../models/order.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");
const User = require("../models/user.schema");
const mailSender = require("../helper/mailSender");
const io = require("../helper/socket");

/********************************************************
 * @createNewOrder
 * @Route POST /api/v1/order/create/:userId
 * @description Post a new order. Only user can post order.
 * @param {string} req.params.userId - The ID of the user creating the order.
 * @param {Object} req.body.checkout - The checkout information, including address, phone, city, and order.
 * @param {Array} req.body.checkout.order - The products in the order.
 * @param {string} req.body.checkout.paymentId - The ID of the payment (Stripe) for the order.
 * @param {string} req.body.checkout.address - The shipping address for the order.
 * @param {string} req.body.checkout.city - The shipping city for the order.
 * @param {string} req.body.checkout.phone - The phone number for the order.
 * @returns {Object} A JSON object indicating the success of the operation and a message.
 ********************************************************/
module.exports.createNewOrder = async (req, res) => {
  try {
    const { checkout } = req.body;
    const { userId } = req.params;
    if (
      !checkout.address ||
      !checkout.phone ||
      !checkout.city ||
      !checkout.order
    ) {
      throw new CustomError(
        400,
        "All the fields are mandatory",
        "Order Validation Error"
      );
    }
    const order = await Order.create({
      product: checkout.order,
      totalAmount: checkout.totalAmount,
      city: checkout.city,
      shippingAddress: checkout.address,
      user: userId,
      phoneNumber: checkout.phone,
      paymentId: checkout.paymentId,
    });

    // User purchases Array will be updated after creating a new order.
    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      { $push: { purchases: order } },
      { new: true }
    );

    // Email Body text
    const text = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
      <h1 style="text-align: center; margin-bottom: 30px; color: #d89b9b;">Thank You for Shopping with Elite Fashion!</h1>
      <p style="font-size: 18px;">Dear ${req?.user?.name},</p>
      <p style="font-size: 18px;">We wanted to take a moment to thank you for your recent purchase with Elite Fashion. We appreciate doing business with you and we hope that you are happy with your order.</p>
      <p style="font-size: 18px;">If you have any questions or concerns about your purchase, please don't hesitate to contact us at support@elitefashion.com.</p>
      <p style="font-size: 18px;">Thank you again for shopping with us. We hope to see you again soon!</p>
      </div>
      </div>`;

    // Email sender helper function. If the order is successful, the user will receive an email.
    await mailSender(
      req?.user?.email,
      text,
      "Thank You for Shopping with Elite Fashion"
    );
    //Socket io emit event every time user creates new order. so that admin can get a live notification.
    io.getIo().emit("order_created", order);
    return res
      .status(200)
      .json({ success: true, message: "Order submitted successfully" });
  } catch (err) {
    errorResponse(res, err, "CREATE-ORDER");
  }
};

/********************************************************

@getAllOrders
@route GET /api/v1/order/all
@description Get all orders(admin only)
@returns { Array } orders - List of orders
@throws {CustomError} 401 - Access denied
@throws {CustomError} 400 - No orders found
*********************************************************/
module.exports.getAllOrders = async (req, res) => {
  try {
    // Only ADMIN has access.
    if (req.user.role !== "ADMIN") {
      throw new CustomError(
        401,
        "Access denied. You are not authorized to access this resource."
      );
    }
    const order = await Order.find().populate("user", "_id name");
    if (!order) {
      throw new CustomError(400, "No orders found");
    }
    return res.status(200).json({ success: true, order });
  } catch (err) {
    errorResponse(res, err, "GET-ALL-ORDERS");
  }
};

/********************************************************
 * Retrieves a single order by ID.
 * @getSingleOrder
 * @Route GET /api/v1/order/single/:orderId
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {CustomError} 401 - Access denied. You are not authorized to access this resource.
 * @throws {CustomError} 400 - No order found.
 * @returns {Object} - The order object.
 *********************************************************/
module.exports.getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Only ADMIN has access.
    if (req.user.role !== "ADMIN") {
      throw new CustomError(
        401,
        "Access denied. You are not authorized to access this resource."
      );
    }
    const order = await Order.findOne({ _id: orderId }).populate({
      path: "product._id",
      model: "Product",
      select: "title price image _id",
    });
    if (!order) {
      throw new CustomError(400, "No order found");
    }
    return res.status(200).json({ success: true, order });
  } catch (err) {
    errorResponse(res, err, "GET-SINGLE-ORDER");
  }
};

/********************************************************
@updateOrderStatus
@description Update the status of an order by orderId
@route POST /api/v1/order/update-status/:orderId/:userId
@access Admin only
@param {object} req.params.orderId - The ID of the order to update
@param {object} req.body - The request body containing the new order status
@param {string} req.body.orderStatus - The new status of the order
@param {object} req.user - The authenticated user object
@param {string} req.user.role - The role of the authenticated user, must be "ADMIN" to update order status
@returns {object} - A success message if the order status was updated successfully
@throws {CustomError} - If the authenticated user is not an admin, or if the order ID is invalid
*********************************************************/
module.exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw new CustomError(
        401,
        "Access denied. You are not authorized to access this resource."
      );
    }
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        orderStatus,
      },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      throw new CustomError(400, "Invalid order ID");
    }
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (err) {
    errorResponse(res, err, "UPDATE-ORDER-STATUS");
  }
};

// /**********************Currently Not using**********************************
//  * @getOrderStatus
//  * @Route GET http://localhost:5000/api/v1/order/status
//  * @Description user and admin can check order status.
//  * @Parameters  none
//  * @Return status
//  *********************************************************/
// module.exports.getOrderStatus = async (req, res) => {
//    try {
//       //only ADMIN has access.
//       if (req.user.role !== "ADMIN") {
//          throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
//       };
//       return res.json(Order.schema.path("orderStatus").enumValues);
//    } catch (err) {
//       errorResponse(res, err, "ORDER-STATUS");
//    };
// }
