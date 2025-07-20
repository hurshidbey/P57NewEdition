#!/usr/bin/env node

/**
 * Generate bcrypt hash for passwords
 * Usage: node scripts/generate-password-hash.js
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

// Hide password input
const hidePassword = (query) => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let password = '';
    stdout.write(query);

    stdin.on('data', (char) => {
      char = char.toString('utf8');

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f':
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
          }
          break;
        default:
          password += char;
          break;
      }
    });

    stdin.resume();
  });
};

async function generateHash() {
  console.log('🔐 Bcrypt Password Hash Generator\n');
  
  const password = await hidePassword('Enter password to hash: ');
  
  if (!password) {
    console.error('❌ Password cannot be empty');
    process.exit(1);
  }
  
  try {
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Generated hash:');
    console.log(hash);
    console.log('\nAdd this to your .env.production file:');
    console.log(`FALLBACK_ADMIN_PASSWORD_HASH=${hash}`);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log(`\n✓ Hash verification: ${isValid ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
  
  rl.close();
}

generateHash();