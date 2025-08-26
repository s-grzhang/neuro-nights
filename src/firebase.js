// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { validateEnvironmentVariables, validateFirebaseConfig, secureLog } from './utils/securityUtils';
import { getEnvironmentConfig, isDevelopment } from './config/environments';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Configuration loaded from environment variables for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables using security utils
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

try {
  validateEnvironmentVariables(requiredEnvVars);
  validateFirebaseConfig(firebaseConfig);
  secureLog('Firebase configuration validated successfully');
} catch (error) {
  console.error('Firebase configuration validation failed:', error.message);
  throw error;
}

// Initialize Firebase
secureLog("Initializing Firebase...");
const app = initializeApp(firebaseConfig);

// Initialize analytics only if enabled and measurement ID is available
const envConfig = getEnvironmentConfig();
let analytics = null;
if (envConfig.enableAnalytics && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
  secureLog("Firebase Analytics initialized");
}

const db = getFirestore(app);
const auth = getAuth(app);
secureLog("Firebase initialized successfully", { 
  environment: envConfig.environment,
  analyticsEnabled: !!analytics 
});

// Function to update user points in Firestore
const updateUserPoints = async (userId, pointsToAdd) => {
  console.log(`updateUserPoints called with userId: ${userId}, pointsToAdd: ${pointsToAdd}`);
  
  if (!userId) {
    console.error("Cannot update points: No userId provided");
    return Promise.reject(new Error("No userId provided"));
  }
  
  if (typeof pointsToAdd !== 'number' || isNaN(pointsToAdd)) {
    console.error("Cannot update points: Invalid points value", pointsToAdd);
    return Promise.reject(new Error("Invalid points value"));
  }
  
  try {
    console.log(`Creating document reference for user: ${userId}`);
    const userRef = doc(db, "users", userId);
    
    // First check if the user document exists
    console.log(`Checking if user document exists...`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create the user document with initial points
      console.log(`User document doesn't exist, creating new one with ${pointsToAdd} points`);
      await setDoc(userRef, { 
        points: pointsToAdd,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      console.log(`Created new user document and added ${pointsToAdd} points to user ${userId}`);
    } else {
      // Update existing document with incremented points
      console.log(`User document exists, incrementing points by ${pointsToAdd}`);
      await updateDoc(userRef, {
        points: increment(pointsToAdd),
        lastUpdated: serverTimestamp()
      });
      console.log(`Added ${pointsToAdd} points to user ${userId} in Firestore`);
    }
    
    // Verify the update by reading the document again
    const updatedDoc = await getDoc(userRef);
    if (updatedDoc.exists()) {
      console.log(`Verification - User points after update:`, updatedDoc.data().points);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user points in Firestore:", error);
    // Log more details about the error
    if (error.code) {
      console.error(`Firebase error code: ${error.code}`);
    }
    if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    throw error; // Re-throw to allow proper handling
  }
};

// Test function to verify Firestore connectivity
const testFirestoreConnection = async () => {
  try {
    console.log("Testing Firestore connection...");
    const testDocRef = doc(db, "_test_connection", "test");
    await setDoc(testDocRef, { 
      timestamp: serverTimestamp(),
      testValue: "Connection successful"
    });
    console.log("Firestore connection test successful");
    return true;
  } catch (error) {
    console.error("Firestore connection test failed:", error);
    if (error.code) {
      console.error(`Firebase error code: ${error.code}`);
    }
    return false;
  }
};

// Call the test function when the module loads
testFirestoreConnection();

export { db, auth, updateUserPoints, testFirestoreConnection };