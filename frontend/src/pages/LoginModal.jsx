import React, { useState } from 'react';
import './LoginModal.css';
import logo from '../assets/logo.png'; 

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added Eye toggle state!
  
  // Specific errors for each field
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLoginClick = () => {
    // Reset errors first
    setEmailError('');
    setPasswordError('');
    let isValid = true;

    if (!email.includes('@')) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    }

    if (isValid) {
      onLoginSuccess();
    }
  };

  if (!isOpen) return null; 

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        
        <div className="modal-header">
          <img src={logo} alt="Raydoj" className="modal-logo" />
          <h2>Welcome Back!</h2>
          <p>Enter your details to access your account.</p>
        </div>

        <form className="login-form">
          
          {/* EMAIL FIELD */}
          <div className="input-group">
            <label>Email</label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <input 
                type="text" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? 'input-error' : ''} /* Adds the red border & shake if error! */
              />
            </div>
            {/* The red text that pops up below the field */}
            {emailError && <div className="field-error-text">{emailError}</div>}
          </div>
          
          {/* PASSWORD FIELD (Now with the Eye Icon!) */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? 'input-error' : ''}
              />
              <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                ) : (
                  <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                )}
              </svg>
            </div>
            {passwordError && <div className="field-error-text">{passwordError}</div>}
          </div>

          <div className="form-actions">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="button" className="login-submit-btn" onClick={handleLoginClick}>
            Login
          </button>
        </form>

        <div className="divider">or</div>

        <button className="google-btn">
          <svg className="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <p className="signup-link">
          Don't have an account? <span className="toggle-link" onClick={onSwitchToSignUp}>Sign Up</span>
        </p>

      </div>
    </div>
  );
}