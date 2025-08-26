/**
 * SleepRecommendationData.js
 * Utility for generating synthetic sleep data for the recommendation model
 */

/**
 * Generate synthetic training data for sleep recommendations
 * @param {number} numSamples - Number of synthetic samples to generate
 * @returns {Array} - Array of data objects for training
 */
export const generateTrainingData = (numSamples = 1000) => {
  const data = [];
  
  for (let i = 0; i < numSamples; i++) {
    // Generate random user characteristics
    const age = Math.floor(Math.random() * 70) + 5; // Ages 5-75
    const gender = Math.random() > 0.5 ? 'female' : 'male';
    
    // Generate random sleep history
    const avgSleepDuration = generateRandomSleepDuration(age, gender);
    const sleepVariance = Math.random() * 2; // 0-2 hours variance
    const typicalBedtime = Math.floor(Math.random() * 5) + 21; // 9 PM - 2 AM (21-26, with 24+ meaning next day)
    const typicalWakeTime = Math.floor(Math.random() * 5) + 5; // 5 AM - 10 AM
    
    // Generate appropriate recommendations based on factors
    const recommendedDuration = calculateRecommendedDuration(age, gender);
    const recommendedVariance = calculateRecommendedVariance(age);
    const [recommendedBedtime, recommendedWakeTime] = calculateRecommendedSleepWindow(age, recommendedDuration);
    
    data.push({
      // Input features
      age,
      gender,
      avgSleepDuration,
      sleepVariance,
      typicalBedtime,
      typicalWakeTime,
      
      // Target recommendations
      recommendedDuration,
      recommendedVariance,
      recommendedBedtime,
      recommendedWakeTime
    });
  }
  
  return data;
};

/**
 * Generate a random sleep duration based on age and gender
 * @param {number} age - User's age
 * @param {string} gender - User's gender
 * @returns {number} - Random sleep duration
 */
const generateRandomSleepDuration = (age, gender) => {
  let baseDuration;
  
  // Base sleep duration by age group
  if (age < 13) {
    baseDuration = 9 + Math.random() * 2; // 9-11 hours for children
  } else if (age < 18) {
    baseDuration = 8 + Math.random() * 2; // 8-10 hours for teenagers
  } else if (age < 65) {
    baseDuration = 7 + Math.random(); // 7-8 hours for adults
  } else {
    baseDuration = 6 + Math.random() * 1.5; // 6-7.5 hours for seniors
  }
  
  // Women need slightly more sleep on average
  if (gender === 'female') {
    baseDuration += 0.25 + Math.random() * 0.5; // 0.25-0.75 more hours
  }
  
  // Add some random variation
  return Math.round((baseDuration + (Math.random() - 0.5)) * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate recommended sleep duration based on age and gender
 * @param {number} age - User's age
 * @param {string} gender - User's gender
 * @returns {number} - Recommended sleep duration in hours
 */
const calculateRecommendedDuration = (age, gender) => {
  let recommendedHours;
  
  // National Sleep Foundation guidelines
  if (age < 6) {
    recommendedHours = 11; // 10-12 hours
  } else if (age < 13) {
    recommendedHours = 10; // 9-11 hours
  } else if (age < 18) {
    recommendedHours = 9; // 8-10 hours
  } else if (age < 65) {
    recommendedHours = 8; // 7-9 hours
  } else {
    recommendedHours = 7.5; // 7-8 hours
  }
  
  // Women need slightly more sleep on average
  if (gender === 'female') {
    recommendedHours += 0.5; // Research suggests women need ~20 min more sleep
  }
  
  return recommendedHours;
};

/**
 * Calculate recommended sleep variance based on age
 * @param {number} age - User's age
 * @returns {number} - Recommended maximum sleep variance in hours
 */
const calculateRecommendedVariance = (age) => {
  // Children and teens need more consistent sleep
  if (age < 18) {
    return 0.5; // 30 minutes variance
  } else if (age < 65) {
    return 1.0; // 1 hour variance for adults
  } else {
    return 1.5; // 1.5 hour variance for seniors who may have more variable sleep patterns
  }
};

/**
 * Calculate recommended sleep window based on age and recommended duration
 * @param {number} age - User's age
 * @param {number} recommendedDuration - Recommended sleep duration
 * @returns {Array} - [bedtime hour, wake time hour]
 */
const calculateRecommendedSleepWindow = (age, recommendedDuration) => {
  let wakeTime;
  
  // Different age groups have different optimal wake times
  if (age < 13) {
    wakeTime = 7; // Children usually wake up around 7 AM
  } else if (age < 18) {
    wakeTime = 7.5; // Teenagers might wake up a bit later (school starts early)
  } else if (age < 65) {
    wakeTime = 6.5; // Most adults wake up around 6:30-7:00 AM
  } else {
    wakeTime = 6; // Seniors often wake up earlier
  }
  
  // Calculate bedtime based on wake time and recommended duration
  const bedtime = wakeTime - recommendedDuration;
  // Convert to 24-hour format (negative means previous day)
  const adjustedBedtime = bedtime < 0 ? bedtime + 24 : bedtime;
  
  return [adjustedBedtime, wakeTime];
};

/**
 * Convert hour decimal to time string (e.g., 23.5 → "11:30 PM")
 * @param {number} hourDecimal - Hour in decimal format (0-24)
 * @returns {string} - Formatted time string
 */
export const hourToTimeString = (hourDecimal) => {
  // Handle hours that wrap to the next day
  const adjustedHour = hourDecimal >= 24 ? hourDecimal - 24 : hourDecimal;
  
  // Split into hours and minutes
  const hours = Math.floor(adjustedHour);
  const minutes = Math.round((adjustedHour - hours) * 60);
  
  // Format with AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  
  return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert time string to hour decimal (e.g., "11:30 PM" → 23.5)
 * @param {string} timeString - Time string (e.g., "11:30 PM")
 * @returns {number} - Hour in decimal format
 */
export const timeStringToHour = (timeString) => {
  const [time, period] = timeString.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  
  let hour = parseInt(hourStr);
  const minutes = parseInt(minuteStr);
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return hour + (minutes / 60);
};

// Export the functions
export default {
  generateTrainingData,
  hourToTimeString,
  timeStringToHour
}; 