// Security utilities for the application
import { getSecurityConfig, isDevelopment } from '../config/environments';

// Function to sanitize and validate environment variables
export const validateEnvironmentVariables = (requiredVars) => {
  const missing = [];
  const invalid = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      missing.push(varName);
    } else if (value.trim().length === 0) {
      invalid.push(varName);
    }
  });

  if (missing.length > 0 || invalid.length > 0) {
    const errorMessage = [
      missing.length > 0 ? `Missing: ${missing.join(', ')}` : '',
      invalid.length > 0 ? `Invalid: ${invalid.join(', ')}` : ''
    ].filter(Boolean).join('; ');
    
    throw new Error(`Environment variable validation failed: ${errorMessage}`);
  }

  return true;
};

// Function to mask sensitive data in logs
export const maskSensitiveData = (data, keysToMask = ['apiKey', 'password', 'token', 'secret']) => {
  if (!data || typeof data !== 'object') return data;

  const masked = { ...data };
  
  keysToMask.forEach(key => {
    if (masked[key]) {
      const value = masked[key];
      if (typeof value === 'string' && value.length > 8) {
        masked[key] = value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
      } else {
        masked[key] = '***';
      }
    }
  });

  return masked;
};

// Secure logging function
export const secureLog = (message, data = null) => {
  if (!isDevelopment()) {
    // In production, don't log sensitive information
    return;
  }

  if (data) {
    console.log(message, maskSensitiveData(data));
  } else {
    console.log(message);
  }
};

// Function to validate Firebase configuration
export const validateFirebaseConfig = (config) => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missing = requiredFields.filter(field => !config[field]);
  
  if (missing.length > 0) {
    throw new Error(`Invalid Firebase configuration. Missing fields: ${missing.join(', ')}`);
  }

  // Validate format of specific fields
  const validations = {
    apiKey: (value) => value.startsWith('AIza') && value.length > 30,
    authDomain: (value) => value.includes('.firebaseapp.com'),
    projectId: (value) => value.length > 3 && !value.includes(' '),
    storageBucket: (value) => value.includes('.appspot.com'),
    messagingSenderId: (value) => /^\d+$/.test(value),
    appId: (value) => value.includes(':') && value.includes(':web:')
  };

  const invalid = [];
  Object.entries(validations).forEach(([field, validator]) => {
    if (config[field] && !validator(config[field])) {
      invalid.push(field);
    }
  });

  if (invalid.length > 0) {
    throw new Error(`Invalid Firebase configuration format for fields: ${invalid.join(', ')}`);
  }

  return true;
};

// Rate limiting utility (client-side basic implementation)
export class ClientRateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier = 'global') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    while (userRequests.length > 0 && userRequests[0] < windowStart) {
      userRequests.shift();
    }
    
    if (userRequests.length >= this.maxRequests) {
      return false;
    }
    
    userRequests.push(now);
    return true;
  }

  getRemainingRequests(identifier = 'global') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier);
    const validRequests = userRequests.filter(timestamp => timestamp >= windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// API key validation
export const validateApiKey = (apiKey, keyType = 'firebase') => {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error(`Invalid ${keyType} API key: must be a non-empty string`);
  }

  switch (keyType.toLowerCase()) {
    case 'firebase':
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Invalid Firebase API key format');
      }
      if (apiKey.length < 35 || apiKey.length > 45) {
        throw new Error('Invalid Firebase API key length');
      }
      break;
    default:
      if (apiKey.length < 10) {
        throw new Error(`${keyType} API key appears too short`);
      }
  }

  return true;
};

export default {
  validateEnvironmentVariables,
  maskSensitiveData,
  secureLog,
  validateFirebaseConfig,
  ClientRateLimiter,
  validateApiKey
};
