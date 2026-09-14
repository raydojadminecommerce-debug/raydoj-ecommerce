const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import the blueprints
const Product = require('./models/Product'); 
const User = require('./models/User');
const Order = require('./models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json()); 

// --- DASHBOARD STATS ROUTE ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    res.json({ products: totalProducts, orders: 14, revenue: 122000, users: 12 });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// --- CREATE: ADD NEW PRODUCT ---
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({ message: "✅ Product added successfully!", product: savedProduct });
  } catch (error) {
    res.status(500).json({ message: "Failed to add product", error });
  }
});

// --- REGISTER NEW USER ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
});

// --- LOGIN USER ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, cart: user.cart } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// --- READ: GET ALL PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); 
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// --- UPDATE: EDIT PRODUCT ---
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// --- DELETE: REMOVE PRODUCT ---
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// --- CREATE: NEW CHECKOUT ORDER --- 
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, orderItems, totalAmount } = req.body;
    const newOrder = new Order({
      customer,
      orderItems,
      totalAmount,
      paymentStatus: 'Pending' 
    });
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, orderId: savedOrder._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

// 🔥 START SERVER & CONNECT DATABASE TOGETHER 🔥
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log('❌ MongoDB Connection Failed:', err));