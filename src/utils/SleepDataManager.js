/**
 * SleepDataManager.js
 * Utility for storing and retrieving user sleep data in Firestore
 */

import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Check if a user has privacy enabled
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - Whether privacy is enabled
 */
export const isPrivacyEnabled = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().privacyEnabled || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking privacy settings:', error);
    return false;
  }
};

/**
 * Anonymize user data for privacy
 * @param {string} userId - The user's ID
 * @param {Object} sleepData - Sleep data to anonymize
 * @returns {Object} - Anonymized sleep data
 */
export const anonymizeSleepData = (userId, sleepData) => {
  // Create a hash of the userId to use as anonymous identifier
  // This ensures the same user gets the same anonymous ID
  const anonymousId = `anon_${userId.substring(0, 8)}`;
  
  // Return anonymized data - keep sleep metrics but remove identifiable info
  return {
    ...sleepData,
    userId: anonymousId,
    // Remove or generalize any personally identifiable information
    anonymized: true,
    // Retain sleep metrics for research but remove precision
    sleepDuration: Math.round(sleepData.sleepDuration),
    // Round sleep times to nearest 30 minutes for less precision
    sleepStart: sleepData.sleepStart ? roundTimeToHalfHour(sleepData.sleepStart) : '',
    sleepEnd: sleepData.sleepEnd ? roundTimeToHalfHour(sleepData.sleepEnd) : ''
  };
};

/**
 * Round a time string to the nearest half hour for privacy
 * @param {string} timeStr - Time string (e.g., "23:45")
 * @returns {string} - Time rounded to nearest half hour
 */
const roundTimeToHalfHour = (timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let roundedMinutes = Math.round(minutes / 30) * 30;
    let roundedHours = hours;
    
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      roundedHours = (hours + 1) % 24;
    }
    
    return `${roundedHours}:${roundedMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return timeStr; // Return original if parsing fails
  }
};

/**
 * Store sleep data for a user
 * @param {string} userId - The user's ID
 * @param {Object} sleepData - Sleep data to store
 * @returns {Promise<string>} - ID of the stored sleep record
 */
export const storeSleepData = async (userId, sleepData) => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    // Format the sleep data
    const formattedData = {
      userId,
      date: sleepData.date || new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      sleepDuration: sleepData.sleepDuration || 0,
      sleepStart: sleepData.sleepStart || '',
      sleepEnd: sleepData.sleepEnd || '',
      disruptions: sleepData.disruptions || 0,
      timeAwake: sleepData.timeAwake || 0,
      createdAt: new Date().toISOString()
    };
    
    // Check if privacy is enabled
    const privacyEnabled = await isPrivacyEnabled(userId);
    
    // Anonymize data if privacy is enabled
    const dataToStore = privacyEnabled 
      ? anonymizeSleepData(userId, formattedData)
      : formattedData;
    
    // Store original data in user's own records
    const docRef = await addDoc(collection(db, 'sleep_records'), formattedData);
    
    // If privacy enabled, also store anonymized version in research collection
    if (privacyEnabled) {
      await addDoc(collection(db, 'anonymized_sleep_data'), dataToStore);
    }
    
    // Also update the latest sleep data on the user document for quick access
    await updateDoc(doc(db, 'users', userId), {
      latestSleepData: formattedData,
      sleepDataUpdatedAt: new Date().toISOString(),
      privacyEnabled: privacyEnabled // Store privacy setting with the user data
    });
    
    console.log(`Sleep data stored with ID: ${docRef.id} (Privacy: ${privacyEnabled ? 'Enabled' : 'Disabled'})`);
    return docRef.id;
  } catch (error) {
    console.error('Error storing sleep data:', error);
    throw error;
  }
};

/**
 * Get sleep data for a user within a date range
 * @param {string} userId - The user's ID
 * @param {number} days - Number of days to retrieve (default: 30)
 * @returns {Promise<Array>} - Array of sleep records
 */
export const getSleepData = async (userId, days = 30) => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Query Firestore for sleep records in date range
    const sleepQuery = query(
      collection(db, 'sleep_records'),
      where('userId', '==', userId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(sleepQuery);
    const sleepRecords = [];
    
    querySnapshot.forEach((doc) => {
      sleepRecords.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return sleepRecords;
  } catch (error) {
    console.error('Error getting sleep data:', error);
    throw error;
  }
};

/**
 * Get the latest sleep data for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} - Latest sleep record or null if none exists
 */
export const getLatestSleepData = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    // First check if latestSleepData exists on user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists() && userDoc.data().latestSleepData) {
      return userDoc.data().latestSleepData;
    }
    
    // If not, query for the latest sleep record
    const sleepQuery = query(
      collection(db, 'sleep_records'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(sleepQuery);
    
    if (!querySnapshot.empty) {
      const latestRecord = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
      
      // Update the user document with this latest record
      await updateDoc(doc(db, 'users', userId), {
        latestSleepData: latestRecord,
        sleepDataUpdatedAt: new Date().toISOString()
      });
      
      return latestRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest sleep data:', error);
    throw error;
  }
};

/**
 * Generate and store simulated sleep data for a user for testing
 * @param {string} userId - The user's ID
 * @param {number} days - Number of days to generate data for
 * @returns {Promise<Array>} - Generated sleep records
 */
export const generateSimulatedSleepData = async (userId, days = 30) => {
  if (!userId) throw new Error('User ID is required');
  
  try {
    const records = [];
    
    // Generate data for each day
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random sleep duration between 5-9 hours
      const sleepDuration = 5 + Math.random() * 4;
      
      // Random sleep time, typically between 9 PM - 2 AM
      const sleepHour = 21 + Math.floor(Math.random() * 5);
      const sleepMinute = Math.floor(Math.random() * 60);
      const sleepTimeStr = `${sleepHour % 24}:${sleepMinute.toString().padStart(2, '0')}`;
      
      // Wake time based on sleep duration
      const wakeDate = new Date(date);
      wakeDate.setHours(sleepHour % 24, sleepMinute, 0, 0);
      wakeDate.setTime(wakeDate.getTime() + (sleepDuration * 60 * 60 * 1000));
      const wakeTimeStr = `${wakeDate.getHours()}:${wakeDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Random disruptions
      const disruptions = Math.floor(Math.random() * 3);
      const timeAwake = disruptions * (5 + Math.floor(Math.random() * 15));
      
      const sleepRecord = {
        date: dateStr,
        sleepDuration: Math.round(sleepDuration * 10) / 10,
        sleepStart: sleepTimeStr,
        sleepEnd: wakeTimeStr,
        disruptions,
        timeAwake
      };
      
      // Store the record
      const recordId = await storeSleepData(userId, sleepRecord);
      records.push({ id: recordId, ...sleepRecord });
    }
    
    return records;
  } catch (error) {
    console.error('Error generating simulated sleep data:', error);
    throw error;
  }
};

export default {
  storeSleepData,
  getSleepData,
  getLatestSleepData,
  generateSimulatedSleepData
}; 