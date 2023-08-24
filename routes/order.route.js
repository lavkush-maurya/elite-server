const route = require("express").Router();
const {
  createNewOrder,
  getAllOrders,
  getOrderStatus,
  updateOrderStatus,
  getSingleOrder,
} = require("../controllers/order.controller");

const { isAuthenticated } = require("../middlewares/authMiddleware");

const { updateStock } = require("../middlewares/updateStock.middleware");

route.get("/orders/all", isAuthenticated, getAllOrders);

route.get("/order/single/:orderId", isAuthenticated, getSingleOrder);

route.post(
  "/order/create/:userId",
  isAuthenticated,
  updateStock,
  createNewOrder
);

route.put("/order/update/status/:orderId", isAuthenticated, updateOrderStatus);

// /***Currently Not using***
// route.get(
//    "/order/status/all",
//    isAuthenticated,
//    getOrderStatus
// );

module.exports = route;
