// Environment-specific configuration
// This file helps manage different configurations for different environments

const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

const getCurrentEnvironment = () => {
  return process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

const isDevelopment = () => getCurrentEnvironment() === ENVIRONMENTS.DEVELOPMENT;
const isStaging = () => getCurrentEnvironment() === ENVIRONMENTS.STAGING;
const isProduction = () => getCurrentEnvironment() === ENVIRONMENTS.PRODUCTION;

// Environment-specific configurations
const getEnvironmentConfig = () => {
  const env = getCurrentEnvironment();
  
  const baseConfig = {
    environment: env,
    apiTimeout: 10000,
    enableAnalytics: true,
    enableErrorReporting: true
  };

  const environmentConfigs = {
    [ENVIRONMENTS.DEVELOPMENT]: {
      ...baseConfig,
      enableAnalytics: false,
      enableErrorReporting: false,
      apiTimeout: 30000,
      enableDebugLogs: true
    },
    [ENVIRONMENTS.STAGING]: {
      ...baseConfig,
      enableDebugLogs: false
    },
    [ENVIRONMENTS.PRODUCTION]: {
      ...baseConfig,
      enableDebugLogs: false
    }
  };

  return environmentConfigs[env] || environmentConfigs[ENVIRONMENTS.DEVELOPMENT];
};

// Security configuration
const getSecurityConfig = () => {
  return {
    enableCSP: isProduction(),
    enableHTTPS: isProduction() || isStaging(),
    enableSecureHeaders: isProduction() || isStaging(),
    enableRateLimiting: isProduction() || isStaging()
  };
};

export {
  ENVIRONMENTS,
  getCurrentEnvironment,
  isDevelopment,
  isStaging,
  isProduction,
  getEnvironmentConfig,
  getSecurityConfig
};
