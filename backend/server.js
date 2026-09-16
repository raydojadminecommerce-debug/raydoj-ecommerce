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

// 🔥 1. GET ALL ORDERS (Loads the Admin Page)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); 
    res.status(200).json(orders); 
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// 🔥 2. UPDATE "DONE" STATUS
app.put('/api/orders/:id/done', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { isDone: req.body.isDone });
    res.status(200).json({ message: 'Order marked as done!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update done status' });
  }
});

// 🔥 3. UPDATE TRACKING STATUS (Processing, Shipped, etc.)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.status(200).json({ message: 'Order tracking status updated!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update tracking status' });
  }
});

// 🔥 --- CREATE: NEW CHECKOUT ORDER (UPGRADED FOR SEQUENTIAL IDs) --- 
app.post('/api/orders', async (req, res) => {
  try {
    // 1. Grab all the data being sent from the React Checkout page
    const { clerkUserId, customer, orderItems, totalAmount, status, isDone } = req.body;

    // 2. Count how many documents exist to create a sequential ID
    const totalOrders = await Order.countDocuments();
    const nextOrderNumber = totalOrders + 1; // 1, 2, 3, etc.

    // 3. Build the new order
    const newOrder = new Order({
      clerkUserId,
      customer,
      orderItems,
      totalAmount,
      orderNumber: nextOrderNumber, // Save the clean number to MongoDB
      status: status || 'Processing',
      isDone: isDone || false,
      paymentStatus: 'Pending' 
    });
    
    // 4. Save to MongoDB
    const savedOrder = await newOrder.save();
    
    // 5. Send BOTH the MongoDB ID and the clean orderNumber back to the frontend
    res.status(201).json({ 
      success: true, 
      orderId: savedOrder._id,
      orderNumber: nextOrderNumber 
    });
  } catch (error) {
    console.error("Order save error:", error);
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


  // 🔥 GET ORDERS FOR A SPECIFIC CUSTOMER (For the Profile Page)
app.get('/api/orders/user/:clerkId', async (req, res) => {
  try {
    // Searches MongoDB for orders matching this specific Clerk user, newest first
    const userOrders = await Order.find({ clerkUserId: req.params.clerkId }).sort({ createdAt: -1 });
    res.status(200).json(userOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: 'Failed to fetch user orders' });
  }
});