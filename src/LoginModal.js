import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './LoginModal.css';
import PrivacyPolicy from './PrivacyPolicy';

const LoginModal = ({ isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }

    if (isRegistering) {
      // Validate registration form
      if (!displayName) {
        setError('Display name is required.');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }

      if (!ageGroup) {
        setError('Please select your age group.');
        return false;
      }

      if (!gender) {
        setError('Please select your gender.');
        return false;
      }

      if (!agreeToTerms) {
        setError('You must agree to the Privacy Policy to create an account.');
        return false;
      }
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          displayName: displayName,
          email: email,
          ageGroup: ageGroup,
          gender: gender,
          createdAt: new Date(),
          points: 0,
          privacy: {
            shareReadingData: true,
            shareActivityData: true,
            allowRecommendations: true
          }
        });
        
        onClose();
      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setAgeGroup('');
    setGender('');
    setAgreeToTerms(false);
    setError('');
    setShowPrivacyPolicy(false);
  };

  const togglePrivacyPolicy = (e) => {
    e.preventDefault();
    setShowPrivacyPolicy(!showPrivacyPolicy);
  };

  if (!isOpen) return null;

  // Simplified privacy policy content to show inline
  const privacyPolicyContent = (
    <div className="inline-privacy-policy">
      <div className="privacy-header">
        <h3>Privacy Policy</h3>
        <button className="privacy-back-button" onClick={togglePrivacyPolicy}>
          Back to registration
        </button>
      </div>
      
      <div className="privacy-content-inline">
        <h4>Introduction</h4>
        <p>
          Welcome to NeuroNights. We are committed to protecting your privacy and handling your data with transparency.
          This Privacy Policy explains how we collect, use, and share your personal information.
        </p>
        
        <h4>Information We Collect</h4>
        <p>
          We collect account information (email, password, age group, gender), sleep data, and app usage information.
        </p>
        
        <h4>How We Use Your Information</h4>
        <p>
          Your data will be used for personalized sleep recommendations, improving our AI system, enhancing app functionality, and account management.
        </p>
        
        <h4>Data Sharing</h4>
        <p>
          Your data will be shared with our sleep goals recommender AI to provide personalized recommendations.
          We do not sell your personal information to third parties.
        </p>
        
        <h4>Data Security</h4>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access.
        </p>
        
        <h4>Your Rights</h4>
        <p>
          You have the right to access, correct, delete your data, and object to certain data processing activities.
        </p>
        
        <p className="last-updated">Last Updated: November 18, 2023</p>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>×</button>
        
        {!showPrivacyPolicy ? (
          <>
            <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleAuth}>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="ageGroup">Age Group</label>
                    <select 
                      id="ageGroup" 
                      value={ageGroup} 
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="dropdown"
                    >
                      <option value="">Select Age Group</option>
                      <option value="child">Child (under 13)</option>
                      <option value="teen">Teen (13-17)</option>
                      <option value="adult">Adult (18+)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select 
                      id="gender" 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value)}
                      className="dropdown"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                      />
                      <span className="checkbox-label">
                        I agree to the <a href="#" onClick={togglePrivacyPolicy}>Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                </>
              )}
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading 
                  ? 'Please wait...' 
                  : isRegistering 
                    ? 'Create Account' 
                    : 'Sign In'
                }
              </button>
            </form>
            
            <p className="auth-switch">
              {isRegistering 
                ? 'Already have an account?' 
                : 'Need an account?'
              }
              <button 
                className="switch-button"
                onClick={switchMode}
              >
                {isRegistering ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </>
        ) : (
          privacyPolicyContent
        )}
      </div>
    </div>
  );
};

export default LoginModal;