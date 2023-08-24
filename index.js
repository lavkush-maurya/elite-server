const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth.route");
const categoriesRoute = require("./routes/category.route");
const subCategoryRoute = require("./routes/subCategory.route");
const productRoute = require("./routes/product.route");
const orderRoute = require("./routes/order.route");
const userRoute = require("./routes/user.route");
const stripeRoute = require("./routes/stripe.route");
const fileUpload = require("express-fileupload");
const searchRoute = require("./routes/search.route");
const adminAnalyticsRoute = require("./routes/adminAnalytics.route");
const reviewRoute = require("./routes/review.routes");
const messageRoute = require("./routes/message.route");
const chatRoomRoute = require("./routes/chatRoom.route");

app.use(morgan("tiny"));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

//Routes
app.use("/api/v1", authRoute);
app.use("/api/v1", categoriesRoute);
app.use("/api/v1", subCategoryRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", stripeRoute);
app.use("/api/v1", searchRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", adminAnalyticsRoute);
app.use("/api/v1", reviewRoute);
app.use("/api/v1", messageRoute);
app.use("/api/v1", chatRoomRoute);

module.exports = app;
