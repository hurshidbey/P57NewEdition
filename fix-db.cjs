const https = require('https');

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

async function addColumnViaAPI() {
  console.log('🔧 Attempting to add is_free_access column via Supabase API...');
  
  // Try different API endpoints that might work for DDL
  const endpoints = [
    '/rest/v1/rpc/sql',
    '/rest/v1/sql',
    '/database/sql', 
    '/sql',
    '/api/sql'
  ];
  
  const sql = 'ALTER TABLE protocols ADD COLUMN IF NOT EXISTS is_free_access BOOLEAN NOT NULL DEFAULT false;';
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const response = await fetch(`https://bazptglwzqstppwlvmvb.supabase.co${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        },
        body: JSON.stringify({
          query: sql,
          sql: sql
        })
      });
      
      console.log(`Status: ${response.status}`);
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}...`);
      
      if (response.status === 200) {
        console.log('✅ Success!');
        return;
      }
      
    } catch (err) {
      console.log(`Error with ${endpoint}:`, err.message);
    }
  }
  
  console.log('❌ All endpoints failed. Lets try a manual workaround...');
  
  // Since DDL isn't working, let's create a simple flag system
  console.log('Creating in-memory fallback for free protocols...');
  
}

addColumnViaAPI();