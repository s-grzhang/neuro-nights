import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Create user document if it doesn't exist
            const newUserData = {
              email: user.email,
              displayName: user.email ? user.email.split('@')[0] : 'User',
              points: 500,
              purchasedChapters: {},
              createdAt: new Date()
            };
            
            await setDoc(doc(db, 'users', user.uid), newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Update user data (points, etc.)
  const updateUserData = async (updates) => {
    if (!currentUser) return;
    
    try {
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
      setUserData(prevData => ({ ...prevData, ...updates }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Context value
  const value = {
    currentUser,
    userData,
    isAuthenticated: !!currentUser,
    userId: currentUser?.uid,
    loading,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 