/**
 * SleepGoalTracker.js
 * Utility for tracking progress towards sleep goals based on sleep data
 */

import { db } from '../firebase';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import PhonePickupTracker from './PhonePickupTracker';

const REQUIRED_DAYS = 21; // Days needed to complete a goal (form a habit)
const GOAL_REWARD_POINTS = 400; // Points earned for completing a goal

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

    // Get sleep data for the last 30 days
    const sleepData = await PhonePickupTracker.getNightPickups(30);
    const sleepHistory = Array.isArray(sleepData) ? sleepData : [sleepData];

    // Get user data to check if progress has been tracked before
    const userDoc = await getDoc(doc(db, 'users', userId));
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
}; 