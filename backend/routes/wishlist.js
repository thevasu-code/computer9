const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// Get user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('wishlist');
    res.json(user ? user.wishlist : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to wishlist
router.post('/:userId/add', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.wishlist.includes(req.body.productId)) {
      user.wishlist.push(req.body.productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove from wishlist
router.post('/:userId/remove', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.body.productId);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
