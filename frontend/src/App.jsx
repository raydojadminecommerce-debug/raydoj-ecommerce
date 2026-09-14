<<<<<<< HEAD
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Home Page Components
=======
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
>>>>>>> c8c17451741f54241f80f91e5ed455086fc5e81f
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Footer from './components/Footer';

<<<<<<< HEAD
// Import Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import ManageProducts from './components/admin/ManageProducts'; 
import ManageOrders from './components/admin/ManageOrders'; // Imported perfectly!
=======
// Pages
import Product from './pages/Product';
import Cart from './pages/Cart';
import LoginModal from './pages/LoginModal'; 
import SignUpModal from './pages/SignUpModal'; // <-- 1. Import the new Sign Up file!
>>>>>>> c8c17451741f54241f80f91e5ed455086fc5e81f

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 2. These are the switches for BOTH popups
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  // 3. This function closes Sign Up and opens Login
  const openLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // 4. This function closes Login and opens Sign Up
  const openSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        
        {/* PAGE 1: THE HOME PAGE */}
=======
>>>>>>> c8c17451741f54241f80f91e5ed455086fc5e81f
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

<<<<<<< HEAD
        {/* PAGE 2: THE MAIN ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* PAGE 3: MANAGE PRODUCTS PAGE */}
        <Route path="/admin/products" element={<ManageProducts />} />

        {/* PAGE 4: MANAGE ORDERS PAGE (THIS IS WHAT WAS MISSING!) */}
        <Route path="/admin/orders" element={<ManageOrders />} />

      </Routes>
    </BrowserRouter>
=======
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
>>>>>>> c8c17451741f54241f80f91e5ed455086fc5e81f
  );
}

export default App;