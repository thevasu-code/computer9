const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer9');
  const products = JSON.parse(fs.readFileSync('sample-products.json', 'utf-8'));
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Sample products inserted');
  await mongoose.disconnect();
}

seed();
