const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place a new order
router.post('/:userId', async (req, res) => {
  try {
    const order = new Order({ ...req.body, user: req.params.userId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update order status (admin only, placeholder)
router.put('/:orderId', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
