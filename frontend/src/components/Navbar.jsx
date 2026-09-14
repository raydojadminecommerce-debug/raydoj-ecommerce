import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react'; // 🔥 1. Imported Clerk's hook
import './Navbar.css';

import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import userIcon from '../assets/user.png';
import cartIcon from '../assets/cart.png';

const Navbar = ({ isLoggedIn, openLoginModal, cartCount, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate(); 
  
  // 🔥 2. Grab the official signOut function from Clerk
  const { signOut } = useClerk();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart'); 
    } else {
      openLoginModal(); 
    }
  };

  // Profile icon click behavior
  const handleUserClick = () => {
    if (isLoggedIn) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen); // Toggle profile menu
    } else {
      openLoginModal(); // Open login modal if logged out
    }
  };

  return (
    <nav className="navbar-container">
      
      <Link 
        to="/" 
        className="nav-left" 
        style={{ textDecoration: 'none', color: 'inherit' }}
        onClick={(e) => {
          if (window.location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      >
        <img src={logo} alt="RAYDOJ Logo" className="real-logo" />
        <h1 className="brand-name">RAYDOJ</h1>
      </Link>

      <button className="hamburger-btn" onClick={toggleMenu}>☰</button>

      <div className={`nav-links-wrapper ${isMenuOpen ? 'active' : ''}`}>
        <ul className="nav-middle">
          <li><a href="/#products">Products</a></li>
          <li><a href="/#about">About us</a></li>
        </ul>

        <div className="nav-right">
          <div className="search-box">
            <input type="text" placeholder="search" />
            <button className="search-btn">
              <img src={searchIcon} alt="Search" className="nav-icon search-icon-size" />
            </button>
          </div>

          <div className="icon-group" style={{ position: 'relative' }}>
            
            {/* User Profile Icon Button */}
            <button className="icon-btn" onClick={handleUserClick}>
              <img src={userIcon} alt="User" className="nav-icon" />
            </button>

            {/* 🔥 PROFILE DROPDOWN MENU */}
            {isLoggedIn && isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <p><strong>My Account</strong></p>
                  <p style={{ fontSize: '12px', color: '#666' }}>Logged in successfully</p>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
                <button 
                  className="dropdown-logout-btn" 
                  onClick={() => {
                    setIsProfileDropdownOpen(false); // 1. Close the menu instantly
                    signOut(); // 2. Tell Clerk to securely log you out of Google
                    onLogout(); // 3. Clear your local token and show your success alert
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
            
            {/* Cart Button */}
            <button className="icon-btn" onClick={handleCartClick} style={{ position: 'relative' }}>
              <img src={cartIcon} alt="Cart" className="nav-icon" />
              {cartCount > 0 && (
                <span className="cart-badge-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;