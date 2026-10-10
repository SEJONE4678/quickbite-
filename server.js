const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

dotenv.config();

const Category = require('./models/Category');
const Restaurant = require('./models/Restaurant');
const Order = require('./models/Order');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickbite';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper to check MongoDB connection state
const isDbConnected = () => mongoose.connection.readyState === 1;

// Load fallback local data if needed
let localFallbackData = { categories: [], restaurants: [], orders: [] };
try {
  const dataContent = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
  const fn = new Function('exports', dataContent + '; return { CATEGORIES, RESTAURANTS, MENUS };');
  const raw = fn({});
  localFallbackData.categories = raw.CATEGORIES || [];
  localFallbackData.restaurants = (raw.RESTAURANTS || []).map(r => ({
    ...r,
    menu: raw.MENUS?.[r.id] || []
  }));
} catch (e) {
  console.warn('Could not pre-load fallback data:', e.message);
}

// ─── HEALTH & METADATA ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'QuickBite Food Delivery API',
    version: '1.0.0',
    mongodb: isDbConnected() ? 'Connected' : 'Fallback (Offline)',
    databaseUri: MONGO_URI.replace(/\/\/.*@/, '//***@'),
    timestamp: new Date().toISOString()
  });
});

// ─── AUTHENTICATION ROUTES ────────────────────────

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!isDbConnected()) {
      return res.status(201).json({
        success: true,
        message: 'Account created (Demo mode)',
        user: { id: 'demo-' + Date.now(), name, email: email.toLowerCase(), phone: phone || '' }
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || ''
    });

    await user.save();
    console.log(`👤 New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isDbConnected()) {
      return res.json({
        success: true,
        message: 'Login successful (Demo mode)',
        user: { id: 'demo-user', name: email.split('@')[0], email: email.toLowerCase(), phone: '+91 98765 43210' }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log(`🔑 User logged in: ${user.email}`);
    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// ─── CATEGORY & RESTAURANT ROUTES ────────────────

// GET Categories
app.get('/api/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      const categories = await Category.find();
      if (categories && categories.length > 0) return res.json(categories);
    }
    res.json(localFallbackData.categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

// GET Restaurants (with search & category filters)
app.get('/api/restaurants', async (req, res) => {
  try {
    const { category, search } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { tags: searchRegex },
          { category: searchRegex }
        ];
      }
      const restaurants = await Restaurant.find(query);
      if (restaurants && restaurants.length > 0) return res.json(restaurants);
    }

    // Fallback in-memory filter
    let results = localFallbackData.restaurants;
    if (category && category !== 'all') {
      results = results.filter(r => r.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants', details: err.message });
  }
});

// GET Single Restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const restaurant = await Restaurant.findOne({ id: req.params.id });
      if (restaurant) return res.json(restaurant);
    }
    const found = localFallbackData.restaurants.find(r => r.id === req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(found);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant', details: err.message });
  }
});

// ─── ORDER ROUTES ────────────────────────────────

// POST Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (isDbConnected()) {
      const newOrder = new Order(orderData);
      const savedOrder = await newOrder.save();
      console.log(`📦 Order saved to MongoDB: ${savedOrder.orderId}`);
      return res.status(201).json({ success: true, order: savedOrder });
    }

    // Fallback in-memory order storage
    localFallbackData.orders.unshift({
      ...orderData,
      _id: 'local-' + Date.now(),
      createdAt: new Date()
    });
    res.status(201).json({ success: true, order: orderData, fallback: true });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(400).json({ error: 'Failed to create order', details: err.message });
  }
});

// GET All Orders (Order History)
app.get('/api/orders', async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json(orders);
    }
    res.json(localFallbackData.orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// GET Order details by orderId
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const order = await Order.findOne({ orderId: req.params.id });
      if (order) return res.json(order);
    }
    const order = localFallbackData.orders.find(o => o.orderId === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
});

// PATCH Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    if (isDbConnected()) {
      const updated = await Order.findOneAndUpdate(
        { orderId: req.params.id },
        { status },
        { new: true }
      );
      if (updated) return res.json({ success: true, order: updated });
    }

    const localOrder = localFallbackData.orders.find(o => o.orderId === req.params.id);
    if (localOrder) {
      localOrder.status = status;
      return res.json({ success: true, order: localOrder });
    }

    res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// Catch-all route to serve index.html for direct navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── START SERVER & CONNECT DATABASE ─────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('⚡ Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 QuickBite Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('Starting server in fallback mode...');
    app.listen(PORT, () => {
      console.log(`🚀 QuickBite Server running at http://localhost:${PORT} (Offline DB mode)`);
    });
  });

