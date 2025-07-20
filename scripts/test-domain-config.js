#!/usr/bin/env node

// Test script to verify domain configuration
const path = require('path');
const { DOMAINS, getEmailAddresses, getServiceUrls } = require('../dist/shared/config/domains.js');

console.log('========================================');
console.log('P57 Domain Configuration Test');
console.log('========================================\n');

// Test domain configuration
console.log('1. Domain Configuration:');
console.log('------------------------');
console.log(`Landing Domain: ${DOMAINS.landing}`);
console.log(`App Domain: ${DOMAINS.app}`);
console.log(`API Domain: ${DOMAINS.api}`);
console.log(`Primary Domain: ${DOMAINS.primaryDomain}`);
console.log(`\nBackup Domains:`);
DOMAINS.backupDomains.forEach((domain, index) => {
  console.log(`  ${index + 1}. ${domain}`);
});

// Test email configuration
console.log('\n2. Email Configuration:');
console.log('------------------------');
const emails = getEmailAddresses();
Object.entries(emails).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Test service URLs
console.log('\n3. Service URLs:');
console.log('------------------------');
const services = getServiceUrls();
Object.entries(services).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Test CORS configuration
console.log('\n4. CORS Allowed Origins:');
console.log('------------------------');
DOMAINS.allowedOrigins.forEach((origin, index) => {
  console.log(`  ${index + 1}. ${origin}`);
});

console.log('\n========================================');
console.log('All domain configurations loaded successfully!');
console.log('========================================');

// Test environment variable availability
console.log('\n5. Environment Variables Check:');
console.log('------------------------');
const envVars = [
  'LANDING_DOMAIN',
  'APP_DOMAIN', 
  'API_DOMAIN',
  'PRIMARY_DOMAIN',
  'BACKUP_DOMAINS',
  'CORS_ALLOWED_ORIGINS'
];

let missingVars = 0;
envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✓ ${varName} is set`);
  } else {
    console.log(`✗ ${varName} is not set (using defaults)`);
    missingVars++;
  }
});

if (missingVars === 0) {
  console.log('\n✓ All environment variables are properly configured!');
} else {
  console.log(`\n⚠ ${missingVars} environment variables are using default values`);
}