/**
 * A wrapper for tracking phone pickups on Android
 */
class PhonePickupTracker {
  /**
   * Check if the device is Android
   * @returns {boolean} True if the device is Android
   */
  isAndroidDevice = () => {
    return /Android/i.test(navigator.userAgent);
  };

  /**
   * Check if the app has permission to access usage stats
   * @returns {Promise<boolean>} True if permission is granted
   */
  hasPermission = async () => {
    if (!this.isAndroidDevice()) {
      console.warn('PhonePickupTracker is only supported on Android');
      return false;
    }
    
    try {
      // In a real app, this would check with a native bridge
      return localStorage.getItem('usageStatsPermission') === 'granted';
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  /**
   * Check if the device supports phone pickup tracking
   * @returns {boolean} True if the device is supported
   */
  isDeviceSupported = () => {
    return this.isAndroidDevice();
  };

  /**
   * Request permission to access usage stats
   * @returns {Promise<boolean>} True if request was successful
   */
  requestPermission = async () => {
    if (!this.isAndroidDevice()) {
      console.warn('PhonePickupTracker is only supported on Android');
      return false;
    }
    
    try {
      // In a real app, this would use a native bridge
      localStorage.setItem('usageStatsPermission', 'granted');
      return true;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  /**
   * Get phone pickup data for the specified number of days
   * @param {number} days Number of days to fetch data for
   * @returns {Promise<Array>} Array of daily pickup data
   */
  getPhonePickups = async (days = 7) => {
    if (!this.isAndroidDevice()) {
      console.warn('PhonePickupTracker is only supported on Android');
      return null;
    }
    
    if (!(await this.hasPermission())) {
      console.warn('No permission to access usage stats');
      return null;
    }
    
    try {
      // In a real app, this would use a native bridge
      // For this demo, we'll return simulated data
      const today = new Date();
      const data = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 60) + 40, // Random number between 40-100
          screenTime: Math.floor(Math.random() * 5) + 2, // Random hours between 2-7
          pickups: Math.floor(Math.random() * 60) + 40, // Random for compatibility
        });
      }
      
      return data.reverse();
    } catch (error) {
      console.error('Error getting phone pickups:', error);
      return null;
    }
  };

  /**
   * Get sleep data for the specified number of days
   * @param {number} days Number of days to fetch sleep data for
   * @returns {Promise<Array>} Array of daily sleep data
   */
  getSleepData = async (days = 7) => {
    if (!this.isAndroidDevice()) {
      console.warn('Sleep tracking is only supported on Android');
      return null;
    }
    
    try {
      // In a real app, this would use Android's health APIs
      // For this demo, we'll return simulated data
      const today = new Date();
      const data = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const sleepHours = Math.floor(Math.random() * 4) + 5; // Random hours between 5-9
        const deepSleepPercentage = Math.floor(Math.random() * 30) + 15; // Random percentage between 15-45%
        
        data.push({
          date: date.toISOString().split('T')[0],
          totalHours: sleepHours,
          deepSleepHours: (sleepHours * deepSleepPercentage / 100).toFixed(1),
          efficiency: Math.floor(Math.random() * 25) + 70, // Random percentage between 70-95%
        });
      }
      
      return data.reverse();
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      return null;
    }
  };

  /**
   * Get night pickup data to calculate sleep disruptions
   * @param {number} days Number of days to fetch night pickup data for
   * @returns {Promise<Array>} Array of nightly disruption data
   */
  getNightPickups = async (days = 7) => {
    if (!this.isAndroidDevice()) {
      console.warn('Night tracking is only supported on Android');
      return null;
    }
    
    if (!(await this.hasPermission())) {
      console.warn('No permission to access usage stats');
      return null;
    }
    
    try {
      // In a real app, this would use a native bridge
      // For this demo, we'll return simulated data
      const today = new Date();
      const data = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const disruptions = Math.floor(Math.random() * 4); // 0-3 disruptions
        
        data.push({
          date: date.toISOString().split('T')[0],
          disruptions: disruptions,
          timeAwake: Math.floor(Math.random() * 30) + 5, // 5-35 minutes
          nightDisruptions: disruptions, // For compatibility
          sleepDuration: Math.floor(Math.random() * 4) + 5, // Random hours between 5-9
        });
      }
      
      return data.length > 0 ? data.reverse() : data.length > 0 ? data[0] : {
        sleepDuration: 7.5,
        nightDisruptions: 1,
      };
    } catch (error) {
      console.error('Error getting night pickups:', error);
      return {
        sleepDuration: 7.5,
        nightDisruptions: 1,
      };
    }
  };
}

const tracker = new PhonePickupTracker();
export default tracker;

/**
 * PhonePickupTracker.js
 * Utility for tracking phone pickups on Android devices
 */

// Check if device is Android
export const isAndroidDevice = () => {
  return /Android/i.test(navigator.userAgent);
};

// Check if the usage stats permission is granted (Android-specific)
export const checkUsageStatsPermission = async () => {
  if (!isAndroidDevice()) {
    return false;
  }
  
  try {
    // In a real app, this would use Android's native bridge to check permissions
    // For this demo, we'll simulate the permission check
    return localStorage.getItem('usageStatsPermission') === 'granted';
  } catch (error) {
    console.error('Error checking usage stats permission:', error);
    return false;
  }
};

// Request usage stats permission
export const requestUsageStatsPermission = async () => {
  if (!isAndroidDevice()) {
    return false;
  }
  
  try {
    // In a real app, this would redirect to Android's usage access settings
    // For this demo, we'll simulate the permission request
    localStorage.setItem('usageStatsPermission', 'granted');
    return true;
  } catch (error) {
    console.error('Error requesting usage stats permission:', error);
    return false;
  }
};

// Get phone pickup data
export const getPhonePickupData = async (days = 7) => {
  if (!isAndroidDevice() || !(await checkUsageStatsPermission())) {
    return null;
  }
  
  try {
    // In a real app, this would use Android's native bridge to get actual usage data
    // For this demo, we'll return simulated data
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 60) + 40, // Random number between 40-100
        screenTime: Math.floor(Math.random() * 5) + 2, // Random hours between 2-7
      });
    }
    
    return data.reverse();
  } catch (error) {
    console.error('Error fetching phone pickup data:', error);
    return null;
  }
};

// Get sleep data (using Android's health APIs in a real app)
export const getSleepData = async (days = 7) => {
  if (!isAndroidDevice()) {
    return null;
  }
  
  try {
    // In a real app, this would use Android's health APIs to get actual sleep data
    // For this demo, we'll return simulated data
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const sleepHours = Math.floor(Math.random() * 4) + 5; // Random hours between 5-9
      const deepSleepPercentage = Math.floor(Math.random() * 30) + 15; // Random percentage between 15-45%
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalHours: sleepHours,
        deepSleepHours: (sleepHours * deepSleepPercentage / 100).toFixed(1),
        efficiency: Math.floor(Math.random() * 25) + 70, // Random percentage between 70-95%
      });
    }
    
    return data.reverse();
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    return null;
  }
}; 