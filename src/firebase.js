// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8YODQcVg3WoV3v-ktvzlM_n8253hMubo",
  authDomain: "neuro-nights.firebaseapp.com",
  projectId: "neuro-nights",
  storageBucket: "neuro-nights.appspot.com",
  messagingSenderId: "596789184601",
  appId: "1:596789184601:web:b09f007840476ca1d10948",
  measurementId: "G-RBP6XYRPCY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to update user points in Firestore
const updateUserPoints = async (userId, pointsToAdd) => {
  if (!userId) return;
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      points: increment(pointsToAdd)
    });
    console.log(`Added ${pointsToAdd} points to user ${userId}`);
  } catch (error) {
    console.error("Error updating user points:", error);
  }
};

export { db, auth, updateUserPoints };