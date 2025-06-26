#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/storage';
import { payments } from '../shared/schema';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.production') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkOrphanedPayments() {
  try {
    // Get all payments with status 'completed_no_auth' or userId 'UNKNOWN_NO_AUTH'
    const orphanedPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.status, 'completed_no_auth'))
      .execute();

    console.log(`Found ${orphanedPayments.length} orphaned payments`);
    
    orphanedPayments.forEach(payment => {
      console.log(`\n💸 Orphaned Payment:`);
      console.log(`   Transaction ID: ${payment.transactionId}`);
      console.log(`   Amount: ${payment.amount} UZS`);
      console.log(`   Date: ${payment.createdAt}`);
      console.log(`   Status: ${payment.status}`);
      
      // Parse atmosData to see if we can identify the user
      try {
        const atmosData = JSON.parse(payment.atmosData || '{}');
        console.log(`   ATMOS Error: ${atmosData.error}`);
      } catch (e) {
        // Ignore parse errors
      }
    });

  } catch (error) {
    console.error('Error checking orphaned payments:', error);
  }
}

checkOrphanedPayments();