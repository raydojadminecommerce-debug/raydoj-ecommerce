import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products as localProducts } from '../productsData';
import './Product.css'; 

import fallbackImage from '../assets/black-1.webp';

function Product({ isLoggedIn, openLoginModal, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [product, setProduct] = useState(null);
  const [moreProducts, setMoreProducts] = useState([]); 
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setSelectedIndex(0);
    setShowDetails(false);
    window.scrollTo(0, 0); 

    const fetchProductData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        
        if (response.ok) {
          const allDbProducts = await response.json();
          const dbProduct = allDbProducts.find(p => p._id === id);
          
          if (dbProduct) {
            setProduct({
              id: dbProduct._id,
              title: dbProduct.name,
              category: dbProduct.category || "Men's Wallet",
              oldPrice: dbProduct.discount > 0 ? `LKR ${dbProduct.price.toLocaleString()}` : "",
              newPrice: dbProduct.discount > 0 
                ? `LKR ${(dbProduct.price - (dbProduct.price * (dbProduct.discount / 100))).toLocaleString()}` 
                : `LKR ${dbProduct.price.toLocaleString()}`,
              description: dbProduct.shortDescription || "No short description provided.",
              details: dbProduct.longDescription || dbProduct.description || "No long description provided.",
              images: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images : [fallbackImage, fallbackImage, fallbackImage]
            });

            const filteredOthers = allDbProducts.filter(p => p._id !== id).slice(0, 20);
            setMoreProducts(filteredOthers);
          } else {
             throw new Error("Not found in DB");
          }
        } else {
           throw new Error("Server error");
        }
      } catch (error) {
        const fallbackProd = localProducts.find(p => p.id === id) || localProducts[0];
        setProduct(fallbackProd);
        setMoreProducts(localProducts.filter(p => p.id !== fallbackProd.id).slice(0, 20));
      }
    };

    fetchProductData();
  }, [id]);

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  if (!product) return <div style={{ height: '100vh' }}></div>;

  const mainImage = product.images[selectedIndex] || product.images[0];

  return (
    <div className="page-wrapper">
      <div className="product-detail-container">
        
        <div className="product-images-section">
          <div className="thumbnail-column">
            {product.images.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt="thumb" 
                className={selectedIndex === index ? 'active' : ''} 
                onMouseEnter={() => setSelectedIndex(index)} 
              />
            ))}
          </div>
          
          <div className="main-image-container">
            <img src={mainImage} alt="Main Wallet" />
          </div>
        </div>

        <div className="product-info-section">
          <h1 className="product-title">{product.title}</h1>
          <p className="product-subtitle">{product.category}</p>
          
          <div className="price-box">
            {product.oldPrice && <span className="price-old">{product.oldPrice}</span>}
            <p className="price-new">{product.newPrice}</p>
          </div>

          <button 
            className={`btn-solid ${isAdded ? 'added-success' : ''}`} 
            onClick={() => {
              if (!isLoggedIn) {
                openLoginModal(); 
                return;
              }
              
              const rawPrice = parseInt(product.newPrice.replace(/[^0-9]/g, ''));
              addToCart({
                id: product.id,
                title: product.title,
                price: rawPrice,
                image: product.images[0],
                variant: product.category
              });

              setIsAdded(true);
              setTimeout(() => setIsAdded(false), 2000); 
            }}
          >
            {isAdded ? 'Added to Cart! ✔️' : 'Add Cart'}
          </button>
          
          <button 
            className="btn-outline"
            onClick={() => {
              if (!isLoggedIn) {
                openLoginModal(); 
                return;
              }
              
              // Add to cart before proceeding
              const rawPrice = parseInt(product.newPrice.replace(/[^0-9]/g, ''));
              addToCart({
                id: product.id,
                title: product.title,
                price: rawPrice,
                image: product.images[0],
                variant: product.category
              });

              // Instantly navigate to checkout
              navigate('/checkout');
            }}
          >
            Buy Now
          </button>

          <div className="description-text">
            <div className="info-block">
              <strong>Shipping</strong>
              <p>Free shipping island wide</p>
            </div>
            <div className="info-block">
              <strong>Pick Up</strong>
              <p>Free PickUp From Panadura Store or Colombo</p>
            </div>
            
            <p className="desc-paragraph">{product.description}</p>
            
            {showDetails && (
              <p className="desc-paragraph" style={{ marginTop: '10px', color: '#333' }}>
                {product.details}
              </p>
            )}
            
            <span className="view-more-link" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Show Less Product Details" : "View More Product Details"}
            </span>
          </div>
        </div>
      </div>

      <div className="more-from-store-section" id="more">
        <h2 className="section-title">More From the Store</h2>
        
        <div className="product-cards-container" ref={scrollRef}>
          {moreProducts.map((item) => (
            <div className="store-card" key={item._id || item.id}>
              <Link 
                to={`/product/${item._id || item.id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img src={item.images && item.images.length > 0 ? item.images[0] : fallbackImage} alt={item.name || item.title} />
                <h3>{item.name || item.title}</h3>
                <p>{item.category || "Men's Wallet"}</p>
                
                <span className="card-price">
                  {item.price ? `LKR ${item.price.toLocaleString()}` : item.newPrice}
                </span>
              </Link>
            </div>
          ))}
        </div>

        <div className="slider-arrow" onClick={handleScrollRight}>&gt;</div>
      </div>
    </div>
  );
}

export default Product;