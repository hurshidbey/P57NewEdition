#!/bin/bash

# Production script to fix protocol visibility issue
# This ensures all 57 protocols are in the database with correct access flags

echo "🔧 Fixing protocol visibility issue on production..."

# SSH to production server and execute fixes
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 << 'EOF'
cd /opt/protokol57

# First, check current state
echo "📊 Checking current protocol count..."
docker exec protokol57-protokol57-1 sh -c "cd /app && npm run db:query 'SELECT COUNT(*) as total FROM protocols'"

# Run the seed script
echo "🌱 Running protocol seed script..."
docker exec protokol57-protokol57-1 sh -c "cd /app && node -e \"
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function fixProtocols() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check current count
    const { data: currentProtocols, error: countError } = await supabase
      .from('protocols')
      .select('id, number')
      .order('number');
      
    if (countError) {
      console.error('Error checking protocols:', countError);
      return;
    }
    
    console.log('Current protocol count:', currentProtocols.length);
    
    if (currentProtocols.length >= 57) {
      console.log('All 57 protocols already exist!');
      
      // Just fix the isFreeAccess flags
      console.log('Fixing isFreeAccess flags...');
      
      // Set all to false
      const { error: updateAllError } = await supabase
        .from('protocols')
        .update({ is_free_access: false })
        .gte('number', 1);
        
      if (updateAllError) {
        console.error('Error updating all protocols:', updateAllError);
        return;
      }
      
      // Set first 3 to true
      const { error: updateFreeError } = await supabase
        .from('protocols')
        .update({ is_free_access: true })
        .in('number', [1, 2, 3]);
        
      if (updateFreeError) {
        console.error('Error updating free protocols:', updateFreeError);
        return;
      }
      
      console.log('✅ isFreeAccess flags fixed!');
      
      // Verify
      const { data: freeProtocols } = await supabase
        .from('protocols')
        .select('number, title')
        .eq('is_free_access', true)
        .order('number');
        
      console.log('Free protocols:', freeProtocols?.map(p => p.number).join(', '));
      
    } else {
      console.log('⚠️  Missing protocols detected!');
      console.log('Please run the full seed script to add all 57 protocols.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixProtocols();
\""

echo "✅ Protocol fix script completed!"

# Verify the fix
echo "📊 Final protocol count check..."
docker exec protokol57-protokol57-1 sh -c "cd /app && npm run db:query 'SELECT COUNT(*) as total, SUM(CASE WHEN is_free_access THEN 1 ELSE 0 END) as free_count FROM protocols'"

EOF

echo "🎉 Production fix completed!"