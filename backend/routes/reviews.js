const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// Get all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a review to a product
router.post('/:productId', async (req, res) => {
  try {
    const review = new Review({ ...req.body, product: req.params.productId });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
