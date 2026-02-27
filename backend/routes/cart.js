const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/:userId/add', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) cart = new Cart({ user: req.params.userId, items: [] });
    const { productId, quantity } = req.body;
    const existing = cart.items.find(i => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove item from cart
router.post('/:userId/remove', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.body.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Clear cart
router.post('/:userId/clear', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
