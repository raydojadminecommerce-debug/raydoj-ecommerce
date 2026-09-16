import React, { useState, useEffect } from 'react';
import './ManageOrders.css';

// Reusing your awesome icons!
import logo from '../../assets/logo.png';
import settingsIcon from '../../assets/settings.png';
import imageIcon from '../../assets/image.png';

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  
  // Start with an empty array. Data will come from the live database!
  const [orders, setOrders] = useState([]);

  // 🔥 1. FETCH ALL ORDERS FROM MONGODB WHEN PAGE LOADS
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders');
        
        if (response.ok) {
          const dbOrders = await response.json();
          
          // 🔥 SMART MAPPER: Translates MongoDB Checkout structure to fit your exact UI design perfectly
          const formattedOrders = dbOrders.map(dbOrder => ({
            _id: dbOrder._id, // Real MongoDB ID for saving updates
            
            // 🔥 FIX 1: If orderNumber exists, pad it (001). If it's missing from the DB, use the last 4 random letters so it NEVER repeats 001!
            id: dbOrder.orderNumber ? String(dbOrder.orderNumber).padStart(3, '0') : dbOrder._id.substring(dbOrder._id.length - 4).toUpperCase(), 
            
            productName: dbOrder.orderItems && dbOrder.orderItems.length > 0 ? dbOrder.orderItems[0].title : "Custom Item",
            
            // 🔥 FIX 2: Safely checks if the item has a real image. If not, uses the default icon.
            image: dbOrder.orderItems && dbOrder.orderItems.length > 0 && dbOrder.orderItems[0].image ? dbOrder.orderItems[0].image : imageIcon,
            
            price: dbOrder.totalAmount,
            sku: dbOrder.orderItems && dbOrder.orderItems.length > 0 ? dbOrder.orderItems[0].id : "N/A",
            customerName: dbOrder.customer?.fullName || "Unknown",
            address: dbOrder.customer?.address || "No Address",
            city: dbOrder.customer?.city || "No City",
            phone1: dbOrder.customer?.phone || "No Phone",
            phone2: "N/A", // Only 1 phone number was collected in Checkout
            status: dbOrder.status || "Processing", 
            isDone: dbOrder.isDone || false 
          }));

          setOrders(formattedOrders); // Injects live data into your screen!
        }
      } catch (error) {
        console.error("Error fetching orders from database:", error);
      }
    };

    fetchOrders();
  }, []);

  // 🔥 2. SEND "DONE" UPDATE TO MONGODB
  const handleMarkAsDone = async (order) => {
    // Update local UI instantly for a snappy feel
    setOrders(orders.map(o => 
      o._id === order._id ? { ...o, isDone: true } : o
    ));

    try {
      // Tell MongoDB to permanently mark this as Done
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/done`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDone: true })
      });

      if (response.ok) {
        alert("Order successfully moved to Done Orders in the database!");
      } else {
        alert("Warning: Could not connect to database to save 'Done' status.");
      }
    } catch (error) {
      console.error("Failed to update database", error);
    }
  };

  // 3. Update the local radio button visually
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // 🔥 4. SEND STATUS UPDATE (Processing/Shipped/etc) TO MONGODB
  const handleSaveStatus = async (order) => {
    try {
      // Tell MongoDB what the new status is so the Customer Profile page can see it!
      const response = await fetch(`http://localhost:5000/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: order.status })
      });

      if (response.ok) {
        alert(`Customer tracking status successfully saved as: ${order.status}!`);
      } else {
        alert("Warning: Could not save status to database.");
      }
    } catch (error) {
      console.error("Failed to save status to database", error);
    }
  };

  // Filter the orders based on which tab we are looking at
  const displayedOrders = activeTab === 'ongoing' 
    ? orders.filter(order => !order.isDone) 
    : orders.filter(order => order.isDone);

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <img src={logo} alt="Raydoj Logo" className="orders-logo" />
        <h1 className="orders-title">
          MANAGE ORDERS 
          <img src={settingsIcon} alt="Settings" className="settings-icon" />
        </h1>
      </div>
      <hr className="orders-divider" />

      {/* COOL TAB BUTTONS */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ongoing')}
        >
          ONGOING ORDERS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'done' ? 'active' : ''}`}
          onClick={() => setActiveTab('done')}
        >
          DONE ORDERS
        </button>
      </div>

      {/* ORDERS LIST */}
      <div className="orders-list fade-in" key={activeTab}>
        {displayedOrders.length === 0 ? (
          <p className="empty-message">No orders in this section right now!</p>
        ) : (
          displayedOrders.map((order) => (
            <div className="order-card" key={order._id}>
              
              {/* Left Column: Product Info */}
              <div className="order-product-info">
                <div className="order-img-box">
                  <img 
                    src={order.image} 
                    alt="Product" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
                <div className="order-text-sm">
                  <strong>{order.productName} - LKR {order.price?.toLocaleString()}</strong>
                  <p>SKU : {order.sku}</p>
                  <p>Order ID : {order.id}</p>
                </div>
              </div>

              {/* Middle Column: Customer Details */}
              <div className="order-customer-info">
                <div className="info-row"><span className="info-label">NAME</span><span>: {order.customerName}</span></div>
                <div className="info-row"><span className="info-label">ADDRESS</span><span>: {order.address}</span></div>
                <div className="info-row"><span className="info-label">CITY</span><span>: {order.city}</span></div>
                <div className="info-row"><span className="info-label">PHONE NUM 1</span><span>: {order.phone1}</span></div>
                <div className="info-row"><span className="info-label">PHONE NUM 2</span><span>: {order.phone2}</span></div>
                
                {/* Done Order Box (Only visible in Ongoing tab) */}
                {!order.isDone && (
                  <div className="status-box done-box">
                    <h5>ORDER</h5>
                    <div className="radio-group">
                      <label>Done</label>
                      <input type="radio" name={`done-${order._id}`} />
                    </div>
                    {/* Maps to the MongoDB mark as done function */}
                    <button className="save-btn" onClick={() => handleMarkAsDone(order)}>SAVE</button>
                  </div>
                )}
              </div>

              {/* Right Column: Status Tracking */}
              {!order.isDone && (
                <div className="status-box tracking-box">
                  <h5>ORDER</h5>
                  {['Processing', 'Packed', 'Shipped', 'Delivered'].map((statusOption) => (
                    <div className="radio-group" key={statusOption}>
                      <label>{statusOption}</label>
                      <input 
                        type="radio" 
                        name={`status-${order._id}`} 
                        checked={order.status === statusOption}
                        onChange={() => handleStatusChange(order._id, statusOption)}
                      />
                    </div>
                  ))}
                  {/* Maps to the MongoDB save status function */}
                  <button className="save-btn" onClick={() => handleSaveStatus(order)}>SAVE</button>
                </div>
              )}
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageOrders;