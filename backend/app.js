
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const indexRouter = require('./routes/index');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');

const adminRouter = require('./routes/admin');
const analyticsRouter = require('./routes/analytics');
const uploadRouter = require('./routes/upload');
const wishlistRouter = require('./routes/wishlist');
const reviewsRouter = require('./routes/reviews');
const ordersRouter = require('./routes/orders');
const cartRouter = require('./routes/cart');
const authRouter = require('./routes/auth');

const app = express();

// Enable CORS for frontend
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer9')
	.then(() => {
		console.log('MongoDB connected');
	})
	.catch((err) => {
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
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/analytics', analyticsRouter);
app.use('/upload', uploadRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;
