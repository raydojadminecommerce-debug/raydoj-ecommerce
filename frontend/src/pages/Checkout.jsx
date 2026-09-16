import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react'; 
import './Checkout.css';

function Checkout({ cartItems, setCartItems, clearCart }) {
  const navigate = useNavigate();
  const { user } = useUser(); 

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

  const handleCheckoutAndWhatsApp = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.email || !formData.address || !formData.city) {
      alert('Please fill in all required billing details before proceeding.');
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
          clerkUserId: user?.id, 
          customer: formData,
          orderItems: cartItems,
          totalAmount: total,
          // 🔥 FIXED: Now saves as 'Pending' so it stays invisible on the Profile page!
          status: 'Pending', 
          isDone: false
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Order perfectly saved to MongoDB!");

        // FORMAT THE CLEAN ORDER ID (e.g., 1 becomes '001', 12 becomes '012')
        const cleanOrderId = String(data.orderNumber || 1).padStart(3, '0');

        let cartText = '';
        cartItems.forEach((item, index) => {
          cartText += `${index + 1}. ${item.title} (Qty: ${item.quantity}) - LKR ${(item.price * item.quantity).toLocaleString()}\n`;
        });

        const message = `*New Order Request!* 🛍️\n\n` +
                        `*Order ID:* ${cleanOrderId}\n` + 
                        `*Customer Details:*\n` +
                        `Name: ${formData.fullName}\n` +
                        `Phone: ${formData.phone}\n` +
                        `Email: ${formData.email}\n\n` +
                        `*Shipping Address:*\n` +
                        `${formData.address}, ${formData.city} ${formData.postalCode}\n\n` +
                        `*Order Items:*\n` +
                        `${cartText}\n` +
                        `*Total Amount:* LKR ${total.toLocaleString()}\n\n` +
                        `Hello! I would like to check the availability of my items and proceed with the bank transfer.`;

        const encodedMessage = encodeURIComponent(message);
        const businessWhatsAppNumber = "94711300661"; 
        const whatsappURL = `https://wa.me/${businessWhatsAppNumber}?text=${encodedMessage}`;

        clearCart(); 

        window.open(whatsappURL, '_blank');
        navigate('/profile'); 

      } else {
        alert("Error saving order: " + data.message);
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      alert("Could not connect to the database. Make sure your Node.js backend is running!");
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
          <form className="billing-form" onSubmit={handleCheckoutAndWhatsApp}>
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
                <span className="card-logos">💬 WhatsApp</span>
              </div>
              <div className="payment-option selected">
                <input type="radio" defaultChecked readOnly />
                <div className="payment-option-label">
                  <strong>Bank Transfer</strong>
                  <span className="sub-icons"> via WhatsApp Support</span>
                </div>
              </div>
              <div className="payhere-secure-badge">
                Verify stock and pay securely via Bank Transfer
              </div>
            </div>

            <button type="button" className="proceed-to-payment-btn" onClick={handleCheckoutAndWhatsApp}>
              Proceed via WhatsApp
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