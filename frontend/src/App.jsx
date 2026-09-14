<<<<<<<<< Temporary merge branch 1
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'; // 🔥 1. Import Clerk

// Import Pages & Modals
import LoginModal from './pages/LoginModal';
import SignUpModal from './pages/SignUpModal';
import Cart from './pages/Cart'; 
import Product from './pages/Product';
import Checkout from './pages/Checkout'; 

// Import Home Page Components
=========
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
>>>>>>>>> Temporary merge branch 2
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Footer from './components/Footer';

<<<<<<<<< Temporary merge branch 1
// Import Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageProducts from './components/admin/ManageProducts'; 
import ManageOrders from './components/admin/ManageOrders'; // Imported perfectly!
=========
// Pages
import Product from './pages/Product';
import Cart from './pages/Cart';
import LoginModal from './pages/LoginModal'; 
import SignUpModal from './pages/SignUpModal'; // <-- 1. Import the new Sign Up file!
>>>>>>>>> Temporary merge branch 2

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  
  // Automatically checks if token exists on page load!
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); 

  // Global Cart State
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignUpModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };
  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    closeModals();
  };

  // Handle Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('Logged out successfully!');
  };

  return (
    <BrowserRouter>
      <Routes>
<<<<<<<<< Temporary merge branch 1
        
        {/* PAGE 1: THE HOME PAGE */}
=========
>>>>>>>>> Temporary merge branch 2
        <Route path="/" element={
          <div>
            <Navbar 
              isLoggedIn={isLoggedIn} 
              openLoginModal={() => setIsLoginModalOpen(true)} 
            />
            <Hero />
            <ProductGrid />
            <About />
            <Footer />
          </div>
        } />

<<<<<<<<< Temporary merge branch 1
        {/* PAGE 2: THE MAIN ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* PAGE 3: MANAGE PRODUCTS PAGE */}
        <Route path="/admin/products" element={<ManageProducts />} />

        {/* PAGE 4: MANAGE ORDERS PAGE (THIS IS WHAT WAS MISSING!) */}
        <Route path="/admin/orders" element={<ManageOrders />} />

      </Routes>
    </BrowserRouter>
=========
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      {/* 5. Drop both modals here at the bottom and pass them the functions */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true); 
          setIsLoginModalOpen(false); 
        }}
        onSwitchToSignUp={openSignUp} /* Passes the swap function to Login */
      />

      <SignUpModal 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)}
        onSignUpSuccess={() => {
          setIsLoggedIn(true); 
          setIsSignUpModalOpen(false); 
        }}
        onSwitchToLogin={openLogin} /* Passes the swap function to Sign Up */
      />
    </Router>
>>>>>>>>> Temporary merge branch 2
  );
}

export default App;