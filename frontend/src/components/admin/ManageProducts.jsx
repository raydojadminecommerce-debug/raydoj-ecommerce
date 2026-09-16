import React, { useState, useEffect } from 'react';
import './ManageProducts.css';
import logo from '../../assets/logo.png'; 
import imageIcon from '../../assets/image.png'; 
import settingsIcon from '../../assets/settings.png'; 

const API_URL = import.meta.env.VITE_API_URL || "https://raydoj-ecommerce-production.up.railway.app";

const ManageProducts = () => {
  const [products, setProducts] = useState([]); // Stores data from MongoDB
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null); // Remembers WHICH product we are editing
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', discount: '', shortDescription: '', longDescription: ''
  });

  const [previewImages, setPreviewImages] = useState(Array(8).fill(null)); 
  const [imageFiles, setImageFiles] = useState(Array(8).fill(null)); 
  const [draggedIndex, setDraggedIndex] = useState(null); 

  // 🌟 1. FETCH ALL PRODUCTS ON PAGE LOAD 🌟
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🌟 2. HANDLE EDIT BUTTON CLICK 🌟
  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditingId(product._id);
    
    // Fill text boxes
    setFormData({
      name: product.name, sku: product.sku, category: product.category,
      price: product.price, discount: product.discount,
      shortDescription: product.shortDescription, longDescription: product.longDescription
    });

    // Fill image boxes with existing Cloudinary links
    const newPreviews = Array(8).fill(null);
    if (product.images) {
      product.images.forEach((img, i) => { if (i < 8) newPreviews[i] = img; });
    }
    setPreviewImages(newPreviews);
    setImageFiles(Array(8).fill(null)); // Clear any pending new files
    
    // Scroll to top of the page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🌟 3. HANDLE DELETE BUTTON CLICK 🌟
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.log("Error deleting product:", error);
      }
    }
  };

  // --- IMAGE HANDLING ---
  const handleImageClick = (index) => document.getElementById(`file-upload-${index}`).click();

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const newPreviews = [...previewImages];
      newPreviews[index] = URL.createObjectURL(file);
      setPreviewImages(newPreviews);

      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);
    }
  };

  const handleRemoveImage = (index, event) => {
    event.stopPropagation();
    const newPreviews = [...previewImages];
    newPreviews[index] = null;
    setPreviewImages(newPreviews);

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (event) => event.preventDefault();
  const handleDrop = (index) => {
    if (draggedIndex === null) return;
    const newPreviews = [...previewImages];
    const tempPreview = newPreviews[index];
    newPreviews[index] = newPreviews[draggedIndex];
    newPreviews[draggedIndex] = tempPreview;
    setPreviewImages(newPreviews);

    const newFiles = [...imageFiles];
    const tempFile = newFiles[index];
    newFiles[index] = newFiles[draggedIndex];
    newFiles[draggedIndex] = tempFile;
    setImageFiles(newFiles);
    setDraggedIndex(null);
  };

  // 🌟 4. SAVE (Handles both NEW and EDITED products) 🌟
  const handleSaveProduct = async () => {
    setIsUploading(true);
    try {
      const uploadedImageUrls = [];

      for (let i = 0; i < 8; i++) {
        if (imageFiles[i]) {
          // Upload new file to Cloudinary
          const cloudData = new FormData();
          cloudData.append('file', imageFiles[i]);
          cloudData.append('upload_preset', 'raydojee'); 
          const res = await fetch('https://api.cloudinary.com/v1_1/jb7jqguy/image/upload', { method: 'POST', body: cloudData });
          const data = await res.json();
          uploadedImageUrls.push(data.secure_url);
        } else if (previewImages[i] && previewImages[i].includes('cloudinary')) {
          // Keep existing Cloudinary image if it wasn't removed
          uploadedImageUrls.push(previewImages[i]);
        }
      }

      const finalProductData = { ...formData, images: uploadedImageUrls };

      // Choose whether to POST (new) or PUT (edit)
      const url = isEditing ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProductData),
      });

      if (response.ok) {
        alert(isEditing ? '✅ Product updated!' : '✅ Product saved!');
        
        // Reset form
        setFormData({ name: '', sku: '', category: '', price: '', discount: '', shortDescription: '', longDescription: '' });
        setPreviewImages(Array(8).fill(null));
        setImageFiles(Array(8).fill(null));
        setIsEditing(false);
        setEditingId(null);
        
        // Refresh the list!
        fetchProducts(); 
      }
    } catch (error) {
      console.log('Error:', error);
      alert('❌ Failed to save. Check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-header">
        <img src={logo} alt="Raydoj Logo" className="manage-logo" />
        <h1 className="manage-title">MANAGE PRODUCTS <img src={settingsIcon} alt="Settings" className="settings-icon" /></h1>
      </div>
      <hr className="manage-divider" />
      <div className="manage-content">
        
        {/* LEFT SIDE: FORM */}
        <div className="form-section">
          <h2 className="form-title">{isEditing ? "Edit Product" : "Add new product"}</h2>
          
          <div className="image-upload-grid">
            {previewImages.map((imgSrc, i) => (
              <div 
                key={i} className="image-box" onClick={() => handleImageClick(i)} style={{ cursor: 'pointer' }}
                draggable onDragStart={() => handleDragStart(i)} onDragOver={handleDragOver} onDrop={() => handleDrop(i)}
              >
                <input type="file" id={`file-upload-${i}`} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange(i, e)} />
                <span className="close-icon" onClick={(e) => handleRemoveImage(i, e)}>⊗</span>
                <span className="image-number">{i + 1}</span> 
                <div className="img-placeholder">
                  <img src={imgSrc || imageIcon} alt={`Upload ${i + 1}`} className={imgSrc ? "uploaded-img-preview" : "custom-placeholder-img"} style={imgSrc ? { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' } : {}} />
                </div>
              </div>
            ))}
          </div>

          <div className="input-group"><label>Product Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} /></div>
          <div className="input-group"><label>Product SKU</label><input type="text" name="sku" value={formData.sku} onChange={handleChange} /></div>
          <div className="input-group"><label>Category</label><input type="text" name="category" value={formData.category} onChange={handleChange} /></div>
          <div className="input-group"><label>Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} /></div>
          <div className="input-group"><label>Discount</label><input type="number" name="discount" value={formData.discount} onChange={handleChange} /></div>
          <div className="input-group"><label>Short Description</label><textarea rows="3" name="shortDescription" value={formData.shortDescription} onChange={handleChange}></textarea></div>
          <div className="input-group"><label>Long Description</label><textarea rows="5" name="longDescription" value={formData.longDescription} onChange={handleChange}></textarea></div>
          
          <button className="save-product-btn" onClick={handleSaveProduct} disabled={isUploading} style={{ backgroundColor: isUploading ? '#555' : '#000' }}>
            {isUploading ? "UPLOADING... ⏳" : (isEditing ? "UPDATE PRODUCT" : "SAVE NEW PRODUCT")}
          </button>
        </div>

        {/* RIGHT SIDE: PRODUCT LIST */}
        <div className="list-section">
          <h2 className="list-title">All Products</h2>
          <div className="product-list">
            
            {products.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No products found.</p>}

            {products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-card-left">
                  <div className="img-placeholder-small">
                    <img src={product.images && product.images.length > 0 ? product.images[0] : imageIcon} alt="Product Cover" className={product.images && product.images.length > 0 ? "uploaded-img-preview" : "custom-placeholder-img-small"} style={product.images && product.images.length > 0 ? { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' } : {}}/>
                  </div>
                  <div className="product-details">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">LKR {product.price}</p>
                    <p className="product-sku">SKU : {product.sku}</p>
                  </div>
                </div>
                <div className="product-actions">
                  <button className="action-btn edit" onClick={() => handleEditClick(product)}>EDIT</button>
                  <button className="action-btn delete" onClick={() => handleDeleteClick(product._id)}>DELETE</button>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageProducts;