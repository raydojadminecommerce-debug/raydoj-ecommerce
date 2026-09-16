import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';

// 🔥 Import your custom icons from the assets folder
import deleteIcon from '../assets/delete.png';
import deliveryIcon from '../assets/delivery.png';
import secureIcon from '../assets/secure.png';

export default function Cart({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const updateQuantity = (id, delta) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <div className="cart-breadcrumb">Home &gt; cart</div>
        
        <div className="cart-header-row">
          <div>
            <h1>Your Cart <span>({totalItemsCount})</span></h1>
            <p>Review your products and proceed to checkout</p>
          </div>
          <Link to="/" className="continue-shopping">&lt; Continue to shopping</Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/" className="btn-shop-now">Shop Now</Link>
          </div>
        ) : (
          <div className="cart-content-grid">
            <div className="cart-items-box">
              {cartItems.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <img src={item.image} alt={item.title} className="cart-item-img" />
                  <div className="cart-item-details">
                    <div className="item-title-row">
                      <h3>{item.title}</h3>
                      {/* 🔥 Replaced 'X' text with delete.png icon */}
                      <button className="remove-item-btn" onClick={() => removeItem(item.id)} title="Remove item">
                        <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                      </button>
                    </div>
                    <p className="item-variant">{item.variant}</p>
                    <div className="item-price-row">
                      <span className="unit-price">LKR {item.price.toLocaleString()}</span>
                      <div className="quantity-selector">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <span className="total-item-price">LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 🔥 Replaced Clear Cart text button style with delete.png icon */}
              <button className="clear-cart-btn" onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={deleteIcon} alt="Clear" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                Clear Cart
              </button>
            </div>

            <div className="order-summary-box">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>LKR 0</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row total-row">
                <span>Total</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              
              {/* 🔥 Added your custom delivery.png and secure.png icons here */}
              <div className="summary-perks">
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={deliveryIcon} alt="Delivery" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> 
                  Free shipping Island wide
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={secureIcon} alt="Secure" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> 
                  Secure checkout
                </p>
              </div>

              <button 
                className="checkout-btn" 
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}