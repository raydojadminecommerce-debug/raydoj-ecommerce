import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

function Checkout({ cartItems, setCartItems, clearCart }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    saveAddress: false
  });

  useEffect(() => {
    const savedDetails = localStorage.getItem('savedBillingDetails');
    if (savedDetails) {
      setFormData(JSON.parse(savedDetails));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 0; 
  const discount = 0; 
  const total = subtotal + shipping - discount;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.email || !formData.address) {
      alert('Please fill in all required billing details.');
      return;
    }

    if (formData.saveAddress) {
      localStorage.setItem('savedBillingDetails', JSON.stringify(formData));
    } else {
      localStorage.removeItem('savedBillingDetails');
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: formData,
          orderItems: cartItems,
          totalAmount: total
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Order saved to database with ID:", data.orderId);
        alert(`Order successfully saved! ID: ${data.orderId}\nNext step: PayHere Popup!`);
      } else {
        alert("Error saving order: " + data.message);
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      alert("Could not connect to the backend server.");
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        <div className="checkout-breadcrumb">
          Home &gt; Cart &gt; <span>Checkout</span>
        </div>

        <h1 className="checkout-title">Proceed to checkout</h1>
        <p className="checkout-subtitle">Fill in your details and proceed to payment</p>

        <div className="checkout-grid">
          <form className="billing-form" onSubmit={handleSubmitPayment}>
            <h2>Billing Details</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" placeholder="Enter your full name." value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" placeholder="Enter your phone number." value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="Enter your email address." value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Shipping Address</label>
              <textarea name="address" placeholder="Enter your shipping address." value={formData.address} onChange={handleChange} rows="3" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" placeholder="Enter your city." value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input type="text" name="postalCode" placeholder="Enter your postal code." value={formData.postalCode} onChange={handleChange} />
              </div>
            </div>

            <div className="checkbox-group">
              <input type="checkbox" name="saveAddress" id="saveAddress" checked={formData.saveAddress} onChange={handleChange} />
              <label htmlFor="saveAddress">Save this address for next time.</label>
            </div>
          </form>

          <div className="order-summary-card">
            <h2>Order Summary</h2>

            <div className="summary-items-list">
              {cartItems.length === 0 ? (
                <p className="empty-cart-text">Your cart is empty.</p>
              ) : (
                cartItems.map((item, index) => (
                  <div className="summary-item" key={item.id || index}>
                    <img src={item.image} alt={item.title} />
                    <div className="summary-item-details">
                      <h4>{item.title}</h4>
                      <p>Qty : {item.quantity}</p>
                    </div>
                    
                    <div className="summary-item-action">
                      <button type="button" className="checkout-remove-btn" onClick={() => handleRemoveItem(item.id)}>X</button>
                      <span className="summary-item-price">LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `LKR ${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row">
                  <span>Discount</span>
                  <span>-LKR {discount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="summary-grand-total">
              <span>Total</span>
              <span>LKR {total.toLocaleString()}</span>
            </div>

            <div className="payment-method-box">
              <div className="payment-header-row">
                <span>Pay with method</span>
                <span className="card-logos">💳 VISA</span>
              </div>
              <div className="payment-option selected">
                <input type="radio" defaultChecked readOnly />
                <div className="payment-option-label">
                  <strong>Card payment</strong>
                  <span className="sub-icons"> Mastercard / Visa</span>
                </div>
              </div>
              <div className="payhere-secure-badge">
                🔒 Secure payment powered by <strong>PayHere</strong>
              </div>
            </div>

            <button type="button" className="proceed-to-payment-btn" onClick={handleSubmitPayment}>
              Proceed to payment
            </button>

            <div className="secure-checkout-footer">
              🔒 Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;