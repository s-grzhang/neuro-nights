import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    console.log("Setting up auth state listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          console.log(`Fetching user data for: ${user.uid}`);
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            console.log("User document exists:", userDoc.data());
            setUserData(userDoc.data());
          } else {
            // Create user document if it doesn't exist
            console.log("User document doesn't exist, creating new one");
            const newUserData = {
              email: user.email,
              displayName: user.email ? user.email.split('@')[0] : 'User',
              points: 500,
              purchasedChapters: {},
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp()
            };
            
            await setDoc(userRef, newUserData);
            console.log("Created new user document:", newUserData);
            setUserData(newUserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Log more details about the error
          if (error.code) {
            console.error(`Firebase error code: ${error.code}`);
          }
        }
      } else {
        console.log("No authenticated user, clearing user data");
        setUserData(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Sign out function
  const logout = async () => {
    try {
      console.log("Signing out user");
      await signOut(auth);
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Update user data (points, etc.)
  const updateUserData = async (updates) => {
    console.log("updateUserData called with:", updates);
    
    if (!currentUser) {
      console.error("Cannot update user data: No authenticated user");
      return;
    }
    
    try {
      console.log(`Updating user data for: ${currentUser.uid}`, updates);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Add timestamp to updates
      const updatesWithTimestamp = {
        ...updates,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(userRef, updatesWithTimestamp, { merge: true });
      console.log("User data updated in Firestore");
      
      // Update local state
      setUserData(prevData => {
        const newData = { ...prevData, ...updates };
        console.log("Updated local user data:", newData);
        return newData;
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      // Log more details about the error
      if (error.code) {
        console.error(`Firebase error code: ${error.code}`);
      }
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

  console.log("Auth context updated:", { 
    isAuthenticated: !!currentUser,
    userId: currentUser?.uid,
    hasUserData: !!userData,
    userPoints: userData?.points
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext; 