import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Fetch user data from Firestore
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - User data
 */
export const fetchUserData = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    // Create user document if it doesn't exist
    const initialData = { 
      purchasedChapters: {}, 
      points: 0,
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, initialData);
    return initialData;
  }
};

/**
 * Update user's purchased chapters and points
 * @param {string} userId - The user's ID
 * @param {Object} purchasedChapters - The updated purchased chapters
 * @param {number} points - The updated points
 * @returns {Promise<void>}
 */
export const updateUserProgress = async (userId, purchasedChapters, points) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    purchasedChapters,
    points
  });
};

/**
 * Purchase a chapter for a user
 * @param {string} userId - The user's ID
 * @param {Object} chapter - The chapter to purchase
 * @param {Object} purchasedChapters - Current purchased chapters
 * @param {number} currentPoints - Current user points
 * @returns {Promise<Object>} - Updated user data
 */
export const purchaseChapter = async (userId, chapter, purchasedChapters, currentPoints) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (currentPoints < chapter.points) {
    throw new Error(`Not enough points! You need ${chapter.points} points to unlock this chapter.`);
  }
  
  const updatedChapters = { ...purchasedChapters, [chapter.id]: true };
  const updatedPoints = currentPoints - chapter.points;
  
  await updateUserProgress(userId, updatedChapters, updatedPoints);
  
  return {
    purchasedChapters: updatedChapters,
    points: updatedPoints
  };
}; 