import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL || "https://raydoj-ecommerce-production.up.railway.app";

const Profile = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 1. FETCH THIS CUSTOMER'S ORDERS
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${API_URL}/api/orders/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserOrders(data);
        }
      } catch (error) {
        console.error("Error fetching your orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, [user?.id]);

  // 🔥 2. DYNAMIC TEXT: Translates Admin status to beautiful Customer text
  const getStatusTitle = (status) => {
    switch (status) {
      case 'Processing': return "Your Package is Preparing\nBy Crafter";
      case 'Packed': return "Your Package is Packed\nAnd Ready to Ship";
      case 'Shipped': return "Your Package is Shipped\nvia Delivery Service";
      case 'Delivered': return "Your Package has been\nSuccessfully Delivered";
      default: return "";
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Processing') return 'Preparing';
    return status; 
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Pending";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please log in to view your profile.</div>;

  // 🔥 3. THE SMART FILTER: Exclude "Pending" AND exclude "Done" orders!
  const visibleOrders = userOrders.filter(order => 
    !order.isDone && // <--- THIS IS THE MAGIC FIX! If isDone is true, it completely hides it!
    ['Processing', 'Packed', 'Shipped', 'Delivered'].includes(order.status)
  );

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        
        {/* --- HEADER SECTION --- */}
        <div className="profile-header">
          <img src={user.imageUrl} alt="Profile" className="profile-image" />
          
          <div className="profile-info">
            <h1>HI {user.fullName || user.firstName}</h1>
            <button className="edit-profile-btn">Edit Profile</button>
            <p className="welcome-text">
              Welcome to Your Raydoj Profile<br/>
              View Your Orders and Details
            </p>
          </div>
        </div>

        {/* --- DYNAMIC ORDERS SECTION --- */}
        {isLoading ? (
          <div className="no-orders-message"><p>Loading your orders...</p></div>
        ) : visibleOrders.length > 0 ? (
          
          // Maps through ONLY the active, verified orders!
          visibleOrders.map((order) => {
            const cleanOrderId = order.orderNumber ? String(order.orderNumber).padStart(3, '0') : order._id.substring(order._id.length - 4).toUpperCase();
            const productImage = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0].image : "https://via.placeholder.com/150";

            return (
              <div className="recent-order-card" key={order._id}>
                <img src={productImage} alt="Order Item" className="order-item-image" />
                <div className="order-details">
                  <h2 style={{ whiteSpace: 'pre-line' }}>{getStatusTitle(order.status)}</h2>
                  <p className="order-number">Order #{cleanOrderId}</p>
                  <p className="order-status">
                    {getStatusLabel(order.status)} Status {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            );
          })

        ) : (
          // If orders are Pending or Done, show this empty state!
          <div className="no-orders-message">
            <p>You have no any orders for now.</p>
          </div>
        )}

        {/* --- ACTION BUTTONS GRID --- */}
        <div className="action-buttons-grid">
          <button className="action-btn">My Orders</button>
          <button className="action-btn">Address Book</button>
          <button className="action-btn">Payments</button>
          <button className="action-btn">Support</button>
          <button className="action-btn">About</button>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;