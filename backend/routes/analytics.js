const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// Get sales summary (total sales, orders, revenue)
router.get('/sales-summary', async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    res.json({ totalRevenue, totalOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sales trends (orders per day for last 30 days)
router.get('/sales-trends', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const orders = await Order.find({ createdAt: { $gte: since } });
    const trends = {};
    orders.forEach(o => {
      const day = o.createdAt.toISOString().slice(0, 10);
      trends[day] = (trends[day] || 0) + o.total;
    });
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top selling products
router.get('/top-products', async (req, res) => {
  try {
    const orders = await Order.find();
    const productSales = {};
    orders.forEach(o => {
      o.products.forEach(p => {
        productSales[p.product] = (productSales[p.product] || 0) + p.quantity;
      });
    });
    // Sort and get top 5
    const top = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    // Get product details
    const products = await Product.find({ _id: { $in: top.map(([id]) => id) } });
    res.json(products.map(p => ({ ...p.toObject(), sold: productSales[p._id] })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
