import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import './ProductGrid.css';
import fallbackImage from '../assets/black-1.webp'; 

const ProductGrid = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.slice(0, 6)); 
        }
      } catch (error) {
        console.log("Error fetching home page products:", error);
      }
    };
    fetchHomeProducts();
  }, []);

  return (
    <div className="product-section">
      <div className="grid-container">
        {products.map((product) => (
          <Link 
            to={`/product/${product._id}`} 
            className="product-card" 
            key={product._id} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="image-box">
              <img 
                src={product.images && product.images.length > 0 ? product.images[0] : fallbackImage} 
                alt={product.name} 
              />
            </div>
            
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-desc">{product.shortDescription}</p>
              <p className="product-price">LKR {product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;