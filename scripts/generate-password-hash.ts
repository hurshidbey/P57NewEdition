#!/usr/bin/env tsx
import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function promptPassword(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('Enter password to hash: ', (password) => {
      resolve(password);
    });
  });
}

async function main() {
  console.log('🔐 Password Hash Generator for Protokol 57');
  console.log('==========================================\n');
  
  const password = await promptPassword();
  
  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters long');
    process.exit(1);
  }
  
  console.log('\nGenerating hash with bcrypt (12 rounds)...');
  
  try {
    const hash = await bcrypt.hash(password, 12);
    
    console.log('\n✅ Password hash generated successfully!');
    console.log('=====================================\n');
    console.log('Add this to your .env file:');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('\n⚠️  Remember: Never commit the actual password or hash to Git!');
  } catch (error) {
    console.error('❌ Error generating hash:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();