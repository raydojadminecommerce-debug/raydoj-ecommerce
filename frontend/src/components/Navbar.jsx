import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react'; 
import './Navbar.css';

import logo from '../assets/logo.png';
import searchIcon from '../assets/search.png';
import userIcon from '../assets/user.png';
import cartIcon from '../assets/cart.png';
// 🔥 Imported your assets profile and logout icons!
import profileAssetIcon from '../assets/user.png'; 
import logoutAssetIcon from '../assets/logout.png';

const Navbar = ({ isLoggedIn, openLoginModal, cartCount, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate(); 
  
  const { signOut } = useClerk();
  const { user } = useUser(); 

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleCartClick = () => {
    if (isLoggedIn) {
      navigate('/cart'); 
    } else {
      openLoginModal(); 
    }
  };

  const handleUserClick = () => {
    if (isLoggedIn) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen); 
    } else {
      openLoginModal(); 
    }
  };

  const handleNavClick = (e, targetId) => {
    if (window.location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); 
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
          <li>
            <a href="/#products" onClick={(e) => handleNavClick(e, 'products')}>Products</a>
          </li>
          <li>
            <a href="/#about" onClick={(e) => handleNavClick(e, 'about')}>About us</a>
          </li>
        </ul>

        <div className="nav-right">
          <div className="search-box">
            <input type="text" placeholder="search" />
            <button className="search-btn">
              <img src={searchIcon} alt="Search" className="nav-icon search-icon-size" />
            </button>
          </div>

          <div className="icon-group" style={{ position: 'relative' }}>
            
            <button className="icon-btn" onClick={handleUserClick} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}>
              {isLoggedIn && user ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <img src={userIcon} alt="User" className="nav-icon" />
              )}
            </button>

            {/* 🔥 PROFILE DROPDOWN MENU WITH YOUR ASSET ICONS */}
            {isLoggedIn && isProfileDropdownOpen && (
              <div className="profile-dropdown" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="profile-dropdown-header">
                  <p><strong>Hi, {user?.firstName || 'User'}!</strong></p>
                  <p style={{ fontSize: '12px', color: '#666' }}>Logged in successfully</p>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />
                
                {/* My Profile Link with user.png */}
                <Link 
                  to="/profile" 
                  onClick={() => setIsProfileDropdownOpen(false)} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    textDecoration: 'none',
                    color: '#333',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  <img src={profileAssetIcon} alt="Profile Icon" style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> 
                  My Profile
                </Link>

                {/* Logout Button with logout.png */}
                <button 
                  className="dropdown-logout-btn" 
                  onClick={() => {
                    setIsProfileDropdownOpen(false); 
                    signOut(); 
                    onLogout(); 
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    backgroundColor: '#fff0f0',
                    color: '#d32f2f',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <img src={logoutAssetIcon} alt="Logout Icon" style={{ width: '18px', height: '18px', objectFit: 'contain' }} /> 
                  Logout
                </button>
              </div>
            )}
            
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