import React, { useState } from 'react';
import { SignUpButton, useSignUp } from '@clerk/clerk-react';
import './SignUpModal.css';
import logo from '../assets/logo.png'; 

export default function SignUpModal({ isOpen, onClose, onSignUpSuccess, onSwitchToLogin }) {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clerk verification code states
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [serverError, setServerError] = useState(''); 

  const handleSignUpClick = async () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setServerError('');
    let isValid = true;

    if (fullName.trim() === '') {
      setNameError('Please enter your full name.');
      isValid = false;
    }
    if (!email.includes('@')) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }
    if (password !== confirmPassword || confirmPassword === '') {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    if (isValid && isLoaded) {
      try {
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Register user with Clerk
        await signUp.create({
          emailAddress: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
        });

        // Send OTP verification email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } catch (err) {
        setServerError(err.errors?.[0]?.message || 'Registration failed.');
      }
    }
  };

  const handleVerifyCode = async () => {
    setServerError('');
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        if (onSignUpSuccess) onSignUpSuccess();
        onClose();
      }
    } catch (err) {
      setServerError(err.errors?.[0]?.message || 'Invalid verification code.');
    }
  };

  if (!isOpen) return null; 

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        
        <div className="modal-header">
          <img src={logo} alt="Raydoj" className="modal-logo" />
          <h2>{pendingVerification ? 'Verify Your Email' : 'Create Account'}</h2>
          <p>
            {pendingVerification 
              ? 'Enter the 6-digit code sent to your email.' 
              : 'Sign up to create your account and start shopping.'}
          </p>
        </div>

        {pendingVerification ? (
          /* Email OTP Verification Step */
          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Verification Code</label>
              <input 
                type="text" 
                placeholder="Enter 6-digit code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
              />
            </div>

            {serverError && <div className="field-error-text" style={{textAlign: 'center', marginBottom: '10px'}}>{serverError}</div>}

            <button type="button" className="login-submit-btn" onClick={handleVerifyCode}>
              Verify & Complete
            </button>
          </form>
        ) : (
          /* Main Signup Form */
          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Full name</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input 
                  type="text" 
                  placeholder="Enter your full name." 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={nameError ? 'input-error' : ''} 
                />
              </div>
              {nameError && <div className="field-error-text">{nameError}</div>}
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input 
                  type="email" 
                  placeholder="Enter your email address." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={emailError ? 'input-error' : ''} 
                />
              </div>
              {emailError && <div className="field-error-text">{emailError}</div>}
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create your password." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? 'input-error' : ''} 
                />
                <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                  ) : (
                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                  )}
                </svg>
              </div>
              {passwordError && <div className="field-error-text">{passwordError}</div>}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Confirm your password." 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={confirmError ? 'input-error' : ''} 
                />
                <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                  ) : (
                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                  )}
                </svg>
              </div>
              {confirmError && <div className="field-error-text">{confirmError}</div>}
            </div>

            <div className="terms-checkbox">
              <label>
                <input type="checkbox" /> 
                I agree <span className="green-link">Terms of Service</span> and <span className="green-link">Privacy Policy</span>
              </label>
            </div>

            {serverError && <div className="field-error-text" style={{textAlign: 'center', marginBottom: '10px'}}>{serverError}</div>}

            <button type="button" className="login-submit-btn" onClick={handleSignUpClick}>
              Sign Up
            </button>
          </form>
        )}

        {!pendingVerification && (
          <>
            <div className="divider">or</div>

            <SignUpButton mode="modal">
              <button type="button" className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </SignUpButton>

            <p className="signup-link">
              Already have an account? <span className="toggle-link" onClick={onSwitchToLogin}>Login</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}