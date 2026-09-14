import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Navbar.css';

import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import userIcon from '../assets/user.png';
import cartIcon from '../assets/cart.png';

// Receive the props from App.jsx
const Navbar = ({ isLoggedIn, openLoginModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // This lets us change pages

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // The logic for clicking the cart!
  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart'); // If logged in, go to cart
    } else {
      openLoginModal(); // If NOT logged in, show the grey popup
    }
  };

  return (
    <nav className="navbar-container">
      <div className="nav-left">
        <img src={logo} alt="RAYDOJ Logo" className="real-logo" />
        <h1 className="brand-name">RAYDOJ</h1>
      </div>

      <button className="hamburger-btn" onClick={toggleMenu}>☰</button>

      <div className={`nav-links-wrapper ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-middle">
          <li><a href="#products">Products</a></li>
          <li><a href="#about">About us</a></li>
        </ul>

        <div className="nav-right">
          <div className="search-box">
            <input type="text" placeholder="search" />
            <button className="search-btn">
              <img src={searchIcon} alt="Search" className="nav-icon search-icon-size" />
            </button>
          </div>

          <div className="icon-group">
            <button className="icon-btn" onClick={openLoginModal}>
              <img src={userIcon} alt="User" className="nav-icon" />
            </button>
            
            {/* The Cart Button uses our new logic! */}
            <button className="icon-btn" onClick={handleCartClick}>
              <img src={cartIcon} alt="Cart" className="nav-icon" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;