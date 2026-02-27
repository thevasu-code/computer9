const adminRouter = require('./routes/admin');
app.use('/admin', adminRouter);
const wishlistRouter = require('./routes/wishlist');
app.use('/wishlist', wishlistRouter);
const reviewsRouter = require('./routes/reviews');
app.use('/reviews', reviewsRouter);
const ordersRouter = require('./routes/orders');
app.use('/orders', ordersRouter);
const cartRouter = require('./routes/cart');
app.use('/cart', cartRouter);
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const indexRouter = require('./routes/index');

const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer9', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log('MongoDB connected');
}).catch((err) => {
	console.error('MongoDB connection error:', err);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/products', productsRouter);
app.use('/users', usersRouter);

module.exports = app;
