#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps set up environment variables for the NeuroNights application.
 * It can be used to validate existing configuration or help create new environment files.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REQUIRED_ENV_VARS = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];

const OPTIONAL_ENV_VARS = [
  'REACT_APP_FIREBASE_MEASUREMENT_ID',
  'REACT_APP_ENVIRONMENT'
];

class EnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  validateFirebaseApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return 'API key must be a non-empty string';
    }
    if (!apiKey.startsWith('AIza')) {
      return 'Firebase API key should start with "AIza"';
    }
    if (apiKey.length < 35 || apiKey.length > 45) {
      return 'Firebase API key length seems incorrect';
    }
    return null;
  }

  validateAuthDomain(domain) {
    if (!domain || !domain.includes('.firebaseapp.com')) {
      return 'Auth domain should end with .firebaseapp.com';
    }
    return null;
  }

  validateProjectId(projectId) {
    if (!projectId || projectId.length < 3) {
      return 'Project ID seems too short';
    }
    if (projectId.includes(' ')) {
      return 'Project ID should not contain spaces';
    }
    return null;
  }

  validateStorageBucket(bucket) {
    if (!bucket || !bucket.includes('.appspot.com')) {
      return 'Storage bucket should end with .appspot.com';
    }
    return null;
  }

  validateMessagingSenderId(senderId) {
    if (!senderId || !/^\d+$/.test(senderId)) {
      return 'Messaging sender ID should contain only numbers';
    }
    return null;
  }

  validateAppId(appId) {
    if (!appId || !appId.includes(':') || !appId.includes(':web:')) {
      return 'App ID should contain colons and ":web:" identifier';
    }
    return null;
  }

  validateEnvironmentVar(name, value) {
    switch (name) {
      case 'REACT_APP_FIREBASE_API_KEY':
        return this.validateFirebaseApiKey(value);
      case 'REACT_APP_FIREBASE_AUTH_DOMAIN':
        return this.validateAuthDomain(value);
      case 'REACT_APP_FIREBASE_PROJECT_ID':
        return this.validateProjectId(value);
      case 'REACT_APP_FIREBASE_STORAGE_BUCKET':
        return this.validateStorageBucket(value);
      case 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID':
        return this.validateMessagingSenderId(value);
      case 'REACT_APP_FIREBASE_APP_ID':
        return this.validateAppId(value);
      default:
        return null;
    }
  }

  async checkExistingEnv() {
    const envFiles = ['.env.local', '.env.development', '.env.staging', '.env.production'];
    const existingFiles = envFiles.filter(file => fs.existsSync(file));
    
    if (existingFiles.length === 0) {
      console.log('❌ No environment files found.');
      return false;
    }

    console.log('✅ Found environment files:', existingFiles.join(', '));
    
    for (const file of existingFiles) {
      console.log(`\n📁 Checking ${file}:`);
      await this.validateEnvFile(file);
    }

    return true;
  }

  async validateEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File ${filePath} does not exist`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const envVars = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    let hasErrors = false;

    // Check required variables
    for (const varName of REQUIRED_ENV_VARS) {
      if (!envVars[varName]) {
        console.log(`  ❌ Missing required variable: ${varName}`);
        hasErrors = true;
      } else {
        const error = this.validateEnvironmentVar(varName, envVars[varName]);
        if (error) {
          console.log(`  ⚠️  ${varName}: ${error}`);
          hasErrors = true;
        } else {
          console.log(`  ✅ ${varName}: Valid`);
        }
      }
    }

    // Check optional variables
    for (const varName of OPTIONAL_ENV_VARS) {
      if (envVars[varName]) {
        console.log(`  ✅ ${varName}: Present`);
      }
    }

    return !hasErrors;
  }

  async createEnvFile() {
    console.log('\n🔧 Creating new environment file...\n');
    
    const envVars = {};
    
    // Collect required variables
    for (const varName of REQUIRED_ENV_VARS) {
      let value = '';
      let isValid = false;
      
      while (!isValid) {
        const displayName = varName.replace('REACT_APP_FIREBASE_', '').toLowerCase();
        value = await this.prompt(`Enter ${displayName}: `);
        
        const error = this.validateEnvironmentVar(varName, value);
        if (error) {
          console.log(`❌ ${error}. Please try again.`);
        } else {
          isValid = true;
          envVars[varName] = value;
        }
      }
    }

    // Collect optional variables
    for (const varName of OPTIONAL_ENV_VARS) {
      const displayName = varName.replace('REACT_APP_FIREBASE_', '').replace('REACT_APP_', '').toLowerCase();
      const value = await this.prompt(`Enter ${displayName} (optional): `);
      if (value.trim()) {
        envVars[varName] = value.trim();
      }
    }

    // Set default environment if not provided
    if (!envVars['REACT_APP_ENVIRONMENT']) {
      envVars['REACT_APP_ENVIRONMENT'] = 'development';
    }

    // Ask for filename
    const filename = await this.prompt('Enter filename (default: .env.local): ') || '.env.local';
    
    // Create file content
    let content = '# Firebase Configuration\n';
    content += '# Generated by environment setup script\n\n';
    
    Object.entries(envVars).forEach(([key, value]) => {
      content += `${key}=${value}\n`;
    });

    // Write file
    fs.writeFileSync(filename, content);
    console.log(`\n✅ Environment file created: ${filename}`);
    
    // Validate the created file
    console.log('\n🔍 Validating created file...');
    await this.validateEnvFile(filename);
  }

  async run() {
    console.log('🔒 NeuroNights Environment Setup\n');
    console.log('This script will help you configure environment variables for secure operation.\n');

    const action = await this.prompt('What would you like to do?\n1. Check existing environment files\n2. Create new environment file\n3. Both\nEnter choice (1/2/3): ');

    switch (action.trim()) {
      case '1':
        await this.checkExistingEnv();
        break;
      case '2':
        await this.createEnvFile();
        break;
      case '3':
        const hasExisting = await this.checkExistingEnv();
        if (!hasExisting || await this.prompt('\nCreate new environment file anyway? (y/n): ') === 'y') {
          await this.createEnvFile();
        }
        break;
      default:
        console.log('Invalid choice. Exiting.');
        break;
    }

    console.log('\n📋 Next steps:');
    console.log('1. Review your environment file(s)');
    console.log('2. Ensure sensitive files are in .gitignore');
    console.log('3. Set environment variables in your deployment platform');
    console.log('4. Test your application with the new configuration');
    console.log('\n📖 See SECURITY.md for detailed setup instructions.');

    this.rl.close();
  }
}

// Run the setup if this script is called directly
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.run().catch(console.error);
}

module.exports = EnvironmentSetup;
