import React, { useState } from 'react';
import './LoginModal.css';
import { FaTimes } from 'react-icons/fa';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import PrivacyPolicy from './PrivacyPolicy';

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);

  const validateForm = () => {
    if (isRegistering) {
      // Registration form validation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (!ageGroup) {
        setError('Please select your age group');
        return false;
      }
      
      if (!gender) {
        setError('Please select your gender');
        return false;
      }
      
      if (!agreeToTerms) {
        setError('You must agree to the Privacy Policy to continue');
        return false;
      }
    }
    
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (isRegistering) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Initialize user data in Firestore with additional info
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          displayName: email.split('@')[0],
          ageGroup: ageGroup,
          gender: gender,
          points: 500, // Starting points for new users
          purchasedChapters: {},
          createdAt: new Date(),
          privacyPolicyAccepted: true
        }, { merge: true });
        
        onClose();
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please register.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    
    // Reset fields when switching modes
    if (!isRegistering) {
      setConfirmPassword('');
      setAgeGroup('');
      setGender('');
      setAgreeToTerms(false);
    }
  };

  const openPrivacyPolicy = (e) => {
    e.preventDefault();
    setPrivacyPolicyOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Close the modal when clicking outside
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="login-modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          {isRegistering && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ageGroup">Age Group</label>
                <select
                  id="ageGroup"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  required
                  className="dropdown"
                >
                  <option value="">Select Age Group</option>
                  <option value="adult">Adult (18+)</option>
                  <option value="teen">Teen (13-17)</option>
                  <option value="child">Child (6-12)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="dropdown"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    required
                  />
                  <span className="checkbox-label">
                    I have read and agree to the <a href="#" onClick={openPrivacyPolicy}>Privacy Policy</a>
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
              ? 'Processing...' 
              : isRegistering 
                ? 'Sign Up' 
                : 'Login'
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
      </div>
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicy 
        isOpen={privacyPolicyOpen} 
        onClose={() => setPrivacyPolicyOpen(false)} 
      />
    </div>
  );
};

export default LoginModal; 