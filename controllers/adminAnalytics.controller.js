const dayjs = require('dayjs');
const Order = require('../models/order.schema');
const User = require('../models/user.schema');
const errorResponse = require("../helper/errorResponse");
const CustomError = require('../helper/customError');

/*****************************************************************************
 * Get daily sales data, total users, weekly earnings, monthly revenue, and total orders. Only Admin has access to this resource.
 * @route GET /api/v1/admin/analytics
 * @return {Object} Returns a JSON object with the following properties:
 * - totalUsers: Total number of users in the database.
 * - totalOrders: Total number of orders in the database.
 * - dailySales: Total sales for the current day.
 * - weeklyEarnings: Total earnings for the current week.
 * - monthlyRevenue: Total revenue for the current month.
 * - totalRevenue: Total revenue from all the orders.
 * - monthlyRevenueArray: Array of monthly revenue for the past 12 months, each entry containing the month name and revenue.
 * @throws {CustomError} If there's an error fetching the data from the database.
 ******************************************************************************/
module.exports.getAdminAnalyticsData = async (req, res) => {
   try {
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Not authorized to access this resource!")
      }
      const today = dayjs().startOf('day');
      const startOfWeek = dayjs().startOf('week');
      const startOfMonth = dayjs().startOf('month');

      const [totalUsers, totalOrders] = await Promise.all([
         User.countDocuments(),
         Order.countDocuments()
      ]);

      // Get previous day's totalUsers and totalOrders from database
      const prevDay = dayjs().subtract(1, 'day').startOf('day');
      const [prevTotalUsers, prevTotalOrders] = await Promise.all([
         User.countDocuments({ createdAt: { $lt: prevDay } }),
         Order.countDocuments({ createdAt: { $lt: prevDay } }),
      ]);

      // Calculate percentage change for totalUsers and totalOrders
      const totalUsersPercentage = prevTotalUsers !== 0 ? ((totalUsers / prevTotalUsers) - 1) * 100 : 0;
      const totalOrdersPercentage = prevTotalOrders !== 0 ? ((totalOrders / prevTotalOrders) - 1) * 100 : 0;

      const [dailySales, weeklyEarnings, monthlyRevenue, totalRevenue] = await Promise.all([
         Order.find({ createdAt: { $gte: today } }).then(orders =>
            orders.reduce((acc, order) => acc + order.totalAmount, 0)
         ),
         Order.find({ createdAt: { $gte: startOfWeek } }).then(orders =>
            orders.reduce((acc, order) => acc + order.totalAmount, 0)
         ),
         Order.find({ createdAt: { $gte: startOfMonth } }).then(orders =>
            orders.reduce((acc, order) => acc + order.totalAmount, 0)
         ),
         Order.aggregate([
            {
               $group: {
                  _id: null,
                  totalRevenue: { $sum: "$totalAmount" }
               }
            }
         ]).then(result => result[0].totalRevenue)
      ]);

      // Get monthly revenue for the past 12 months
      const monthNames = [
         'January', 'February', 'March', 'April', 'May', 'June', 'July',
         'August', 'September', 'October', 'November', 'December'
      ];

      const monthlyRevenueArray = monthNames.map(month => ({ month, revenue: 0 }));

      const orders = await Order.find();
      orders.forEach(order => {
         const orderMonth = dayjs(order.createdAt).format('MMMM');
         const orderRevenue = order.totalAmount;
         const index = monthlyRevenueArray.findIndex(monthData => monthData.month === orderMonth);
         if (index >= 0) {
            monthlyRevenueArray[index].revenue += orderRevenue;
         }
      });

      // Calculate percentages
      const dailySalesPercentage = Math.round((dailySales / totalRevenue) * 100);
      const weeklyEarningsPercentage = Math.round((weeklyEarnings / totalRevenue) * 100);
      const monthlyRevenuePercentage = Math.round((monthlyRevenue / totalRevenue) * 100);

      return res.status(200).json(
         {
            totalUsers,
            totalOrders,
            dailySales,
            weeklyEarnings,
            monthlyRevenue,
            monthlyRevenueArray,
            totalRevenue,
            dailySalesPercentage,
            weeklyEarningsPercentage,
            monthlyRevenuePercentage,
            totalUsersPercentage,
            totalOrdersPercentage
         }
      );
   } catch (err) {
      errorResponse(res, err, "ADMIN-ANALYTICS")
   }
}
