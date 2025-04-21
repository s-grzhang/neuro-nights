/**
 * SleepRecommendationModel.js
 * AI model for making personalized sleep goal recommendations
 */

import SleepRecommendationData from './SleepRecommendationData';

class SleepRecommendationModel {
  constructor() {
    this.trained = false;
    this.trainingData = [];
    this.featureWeights = {
      age: 0.4,
      gender: 0.2,
      avgSleepDuration: 0.2,
      sleepVariance: 0.1,
      typicalBedtime: 0.05,
      typicalWakeTime: 0.05
    };
  }

  /**
   * Train the model using synthetic data
   * @param {number} sampleSize - Number of synthetic samples to generate
   * @returns {boolean} - Whether training was successful
   */
  train(sampleSize = 1000) {
    try {
      // Generate synthetic training data
      this.trainingData = SleepRecommendationData.generateTrainingData(sampleSize);
      this.trained = true;
      console.log(`Sleep Recommendation Model trained with ${sampleSize} samples`);
      return true;
    } catch (error) {
      console.error('Error training sleep recommendation model:', error);
      return false;
    }
  }

  /**
   * Find similar users in the training data based on input features
   * @param {Object} userFeatures - User features (age, gender, sleep history)
   * @param {number} numNeighbors - Number of similar users to find
   * @returns {Array} - Array of similar users from training data
   */
  findSimilarUsers(userFeatures, numNeighbors = 5) {
    if (!this.trained || this.trainingData.length === 0) {
      this.train();
    }

    // Calculate similarity score for each training sample
    const similarities = this.trainingData.map(sample => {
      let similarityScore = 0;
      
      // Age similarity (closer in age = more similar)
      const ageDiff = Math.abs(sample.age - userFeatures.age);
      similarityScore += this.featureWeights.age * (1 - Math.min(ageDiff / 30, 1));
      
      // Gender similarity (same gender = more similar)
      similarityScore += this.featureWeights.gender * (sample.gender === userFeatures.gender ? 1 : 0);
      
      // Sleep duration similarity
      const durationDiff = Math.abs(sample.avgSleepDuration - userFeatures.avgSleepDuration);
      similarityScore += this.featureWeights.avgSleepDuration * (1 - Math.min(durationDiff / 4, 1));
      
      // Sleep variance similarity
      const varianceDiff = Math.abs(sample.sleepVariance - userFeatures.sleepVariance);
      similarityScore += this.featureWeights.sleepVariance * (1 - Math.min(varianceDiff / 2, 1));
      
      // Bedtime similarity
      const bedtimeDiff = Math.abs(sample.typicalBedtime - userFeatures.typicalBedtime);
      similarityScore += this.featureWeights.typicalBedtime * (1 - Math.min(bedtimeDiff / 6, 1));
      
      // Wake time similarity
      const waketimeDiff = Math.abs(sample.typicalWakeTime - userFeatures.typicalWakeTime);
      similarityScore += this.featureWeights.typicalWakeTime * (1 - Math.min(waketimeDiff / 6, 1));
      
      return { sample, similarityScore };
    });
    
    // Sort by similarity score (highest first) and take top n
    return similarities
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, numNeighbors)
      .map(item => item.sample);
  }

  /**
   * Generate personalized sleep goal recommendations for a user
   * @param {Object} userProfile - User profile with characteristics and sleep history
   * @returns {Object} - Object with recommended sleep goals
   */
  generateRecommendations(userProfile) {
    // Convert time strings to decimal hours if needed
    const userFeatures = {
      age: userProfile.age || 30, // Default to 30 if not provided
      gender: userProfile.gender || 'female', // Default to female if not provided
      avgSleepDuration: userProfile.avgSleepDuration || 7, // Default to 7 hours if not provided
      sleepVariance: userProfile.sleepVariance || 1, // Default to 1 hour variance if not provided
      typicalBedtime: userProfile.typicalBedtime || 23, // Default to 11 PM if not provided
      typicalWakeTime: userProfile.typicalWakeTime || 7 // Default to 7 AM if not provided
    };
    
    // If we have string time formats, convert them
    if (typeof userFeatures.typicalBedtime === 'string') {
      userFeatures.typicalBedtime = SleepRecommendationData.timeStringToHour(userFeatures.typicalBedtime);
    }
    
    if (typeof userFeatures.typicalWakeTime === 'string') {
      userFeatures.typicalWakeTime = SleepRecommendationData.timeStringToHour(userFeatures.typicalWakeTime);
    }
    
    // Find similar users and generate recommendations based on them
    const similarUsers = this.findSimilarUsers(userFeatures);
    
    // Calculate average recommendations from similar users
    let totalDuration = 0;
    let totalVariance = 0;
    let totalBedtime = 0;
    let totalWakeTime = 0;
    
    similarUsers.forEach(user => {
      totalDuration += user.recommendedDuration;
      totalVariance += user.recommendedVariance;
      totalBedtime += user.recommendedBedtime;
      totalWakeTime += user.recommendedWakeTime;
    });
    
    const count = similarUsers.length;
    const recommendedDuration = Math.round(totalDuration / count * 10) / 10; // Round to 1 decimal
    const recommendedVariance = Math.round(totalVariance / count * 10) / 10; // Round to 1 decimal
    const recommendedBedtime = totalBedtime / count;
    const recommendedWakeTime = totalWakeTime / count;
    
    // Convert bedtime and wake time to formatted strings
    const bedtimeString = SleepRecommendationData.hourToTimeString(recommendedBedtime);
    const wakeTimeString = SleepRecommendationData.hourToTimeString(recommendedWakeTime);
    
    // Format the goals as sentences (as they appear in the app)
    const durationGoal = `I will sleep for ${recommendedDuration} hours.`;
    const consistencyGoal = `I will avoid a variance of more than ${recommendedVariance} hours every night.`;
    const bedtimeGoal = `I will sleep from ${bedtimeString} to ${wakeTimeString}.`;
    
    return {
      duration: {
        value: recommendedDuration,
        formatted: durationGoal
      },
      consistency: {
        value: recommendedVariance,
        formatted: consistencyGoal
      },
      bedtime: {
        bedtime: bedtimeString,
        wakeTime: wakeTimeString,
        formatted: bedtimeGoal
      },
      // Return the raw recommendations too
      raw: {
        duration: recommendedDuration,
        variance: recommendedVariance,
        bedtime: recommendedBedtime,
        wakeTime: recommendedWakeTime
      }
    };
  }

  /**
   * Generate recommendations based on typical user profiles
   * @param {string} userType - Type of user ("child", "teen", "adult", "senior", "parent")
   * @param {string} gender - User's gender ("male" or "female")
   * @returns {Object} - Object with recommended sleep goals
   */
  getRecommendationByUserType(userType = 'adult', gender = 'female') {
    // Create a profile based on user type
    const profile = { gender };
    
    switch (userType.toLowerCase()) {
      case 'child':
        profile.age = 10;
        profile.avgSleepDuration = 9;
        profile.sleepVariance = 0.5;
        profile.typicalBedtime = 21; // 9 PM
        profile.typicalWakeTime = 7; // 7 AM
        break;
        
      case 'teen':
        profile.age = 16;
        profile.avgSleepDuration = 8;
        profile.sleepVariance = 1.5;
        profile.typicalBedtime = 22.5; // 10:30 PM
        profile.typicalWakeTime = 6.5; // 6:30 AM
        break;
        
      case 'parent':
        profile.age = 35;
        profile.avgSleepDuration = 6.5;
        profile.sleepVariance = 1;
        profile.typicalBedtime = 23; // 11 PM
        profile.typicalWakeTime = 6; // 6 AM
        break;
        
      case 'senior':
        profile.age = 70;
        profile.avgSleepDuration = 6;
        profile.sleepVariance = 1.5;
        profile.typicalBedtime = 22; // 10 PM
        profile.typicalWakeTime = 5; // 5 AM
        break;
        
      case 'adult':
      default:
        profile.age = 30;
        profile.avgSleepDuration = 7;
        profile.sleepVariance = 1;
        profile.typicalBedtime = 23; // 11 PM
        profile.typicalWakeTime = 7; // 7 AM
        break;
    }
    
    return this.generateRecommendations(profile);
  }
}

// Create and export a singleton instance
const model = new SleepRecommendationModel();

// Train the model immediately
model.train();

export default model; 