/**
 * SleepGoalTracker.js
 * Utility for tracking progress towards sleep goals based on sleep data
 */

import { db } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import PhonePickupTracker from './PhonePickupTracker';
import SleepDataManager from './SleepDataManager';

const REQUIRED_DAYS = 21; // Days needed to complete a goal (form a habit)
const GOAL_REWARD_POINTS = 400; // Points earned for completing a goal

/**
 * Get sleep history data for a number of days
 * @param {string} userId - User ID to fetch data for
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>} - Array of daily sleep data
 */
export const getSleepHistory = async (userId, days = 30) => {
  try {
    // Try to get sleep data from Firestore first
    if (userId) {
      try {
        const sleepRecords = await SleepDataManager.getSleepData(userId, days);
        if (sleepRecords && sleepRecords.length > 0) {
          return sleepRecords;
        }
      } catch (error) {
        console.warn('Could not retrieve sleep records from Firestore, falling back to simulator:', error);
      }
    }
    
    // Fall back to the simulator if no Firestore data or error
    const sleepData = await PhonePickupTracker.getNightPickups(days);
    
    // Ensure we have an array of data
    return Array.isArray(sleepData) ? sleepData : [sleepData];
  } catch (error) {
    console.error('Error getting sleep history:', error);
    return [];
  }
};

/**
 * Get the progress percentages for all sleep goals based on sleep data
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of goal objects with updated progress
 */
export const updateGoalProgress = async (userId) => {
  try {
    // Get all goals
    const goalsSnapshot = await getDocs(collection(db, 'goals'));
    const goals = goalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get sleep data for the last 30 days - use SleepDataManager first
    const sleepHistory = await getSleepHistory(userId, 30);

    // Get user data to check if progress has been tracked before
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await updateDoc(doc(db, 'users', userId), {
        goalProgress: {},
        createdAt: new Date().toISOString()
      });
      
      // Generate some simulated sleep data for testing
      await SleepDataManager.generateSimulatedSleepData(userId, 30);
      
      // Retry with the simulated data
      return updateGoalProgress(userId);
    }
    
    const userData = userDoc.data();
    
    // Initialize goalProgress if it doesn't exist
    const goalProgress = userData.goalProgress || {};

    // Update progress for each goal
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      // Get stored success days for this goal
      const goalId = goal.id;
      const storedProgress = goalProgress[goalId] || {
        successDays: 0,
        lastUpdated: null,
        lastUpdateDate: null,
      };
      
      // Parse the goal text to determine type and target values
      const goalType = getGoalType(goal.text);
      const targetValues = extractTargetValues(goal.text, goalType);
      
      // Check if the goal was achieved for recent days
      let successDays = storedProgress.successDays || 0;
      let goalAchieved = false;

      // Only check days since the last update
      const lastUpdateDate = storedProgress.lastUpdateDate ? 
        new Date(storedProgress.lastUpdateDate) : new Date(0);
      
      // Filter sleep data for days after the last update
      const newSleepData = sleepHistory.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate > lastUpdateDate;
      });
      
      if (newSleepData.length > 0) {
        // Check if goal was achieved for each day
        newSleepData.forEach(day => {
          const dayAchieved = checkDailyGoalAchievement(day, goalType, targetValues);
          if (dayAchieved) {
            successDays++;
          } else {
            // If consistency is broken, reset counter
            if (goalType !== 'bedtime') {
              successDays = 0;
            }
          }
        });
      }
      
      // Update progress in user's document
      goalProgress[goalId] = {
        successDays,
        lastUpdated: new Date().toISOString(),
        lastUpdateDate: sleepHistory.length > 0 ? 
          sleepHistory[0].date : new Date().toISOString().split('T')[0],
      };
      
      // Calculate progress percentage
      const progressPercentage = Math.min(Math.floor((successDays / REQUIRED_DAYS) * 100), 100);
      
      // Check if goal is complete (100%)
      goalAchieved = progressPercentage === 100;
      
      // If goal is already at 100% progress, keep it there
      const currentProgress = goal.progress || 0;
      const newProgress = currentProgress === 100 ? 100 : progressPercentage;
      
      // Update goal in Firestore
      await updateDoc(doc(db, 'goals', goalId), {
        progress: newProgress,
        points: goalAchieved ? GOAL_REWARD_POINTS : 0,
      });
      
      return {
        ...goal,
        progress: newProgress,
        points: goalAchieved ? GOAL_REWARD_POINTS : 0,
      };
    }));
    
    // Update user's goal progress tracking data
    await updateDoc(doc(db, 'users', userId), {
      goalProgress,
      lastGoalUpdateAt: new Date().toISOString()
    });
    
    return updatedGoals;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return [];
  }
};

/**
 * Determine the type of sleep goal from the goal text
 * @param {string} goalText - The goal text
 * @returns {string} - Goal type: 'duration', 'consistency', or 'bedtime'
 */
const getGoalType = (goalText) => {
  if (!goalText) return 'unknown';
  
  if (goalText.includes('hours')) {
    return 'duration';
  } else if (goalText.includes('variance')) {
    return 'consistency';
  } else if (goalText.includes('from') && goalText.includes('to')) {
    return 'bedtime';
  }
  return 'unknown';
};

/**
 * Extract target values from goal text
 * @param {string} goalText - The goal text
 * @param {string} goalType - The goal type
 * @returns {Object} - Target values object
 */
const extractTargetValues = (goalText, goalType) => {
  if (!goalText) return {};
  
  switch (goalType) {
    case 'duration':
      const hoursMatch = goalText.match(/sleep for (\d+) hours/);
      return {
        targetHours: hoursMatch ? parseInt(hoursMatch[1]) : 8,
      };
    
    case 'consistency':
      const varianceMatch = goalText.match(/variance of more than (\d+)/);
      const daysMatch = goalText.match(/every (\d+) days/);
      return {
        maxVariance: varianceMatch ? parseInt(varianceMatch[1]) : 15,
        days: daysMatch ? parseInt(daysMatch[1]) : 7,
      };
    
    case 'bedtime':
      const timeMatch = goalText.match(/from ([\d:APM\s]+) to ([\d:APM\s]+)/i);
      return {
        bedtime: timeMatch ? timeMatch[1].trim() : '11:00 PM',
        wakeTime: timeMatch ? timeMatch[2].trim() : '7:00 AM',
      };
      
    default:
      return {};
  }
};

/**
 * Check if a daily sleep record meets the goal requirements
 * @param {Object} sleepData - Sleep data for a single day
 * @param {string} goalType - Type of goal
 * @param {Object} targetValues - Target values for the goal
 * @returns {boolean} - Whether the goal was achieved
 */
const checkDailyGoalAchievement = (sleepData, goalType, targetValues) => {
  if (!sleepData || !goalType || !targetValues) return false;
  
  switch (goalType) {
    case 'duration':
      return sleepData.sleepDuration >= targetValues.targetHours;
    
    case 'consistency':
      // For consistency, we would need to compare with previous days
      // For now, we'll consider it achieved if the sleep duration is stable
      return sleepData.sleepDuration >= 7; // Minimum healthy sleep
    
    case 'bedtime':
      // For bedtime goals, we'll consider them achieved if consistency is achieved
      // This is a simplification as requested
      return sleepData.sleepDuration >= 7;
      
    default:
      return false;
  }
};

export default {
  updateGoalProgress,
  getSleepHistory,
}; 