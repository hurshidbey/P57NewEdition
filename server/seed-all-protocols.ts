import { db } from './db';
import { protocols } from './schema';
import fs from 'fs';
import path from 'path';

async function seedAllProtocols() {
  try {
    console.log('Loading protocols from file...');
    
    // Read the protocols file
    const protocolsFile = fs.readFileSync(
      path.join(__dirname, '../attached_assets/prtocols.txt'), 
      'utf-8'
    );
    
    // Extract the protocols array from the file
    // The file starts with "export const protocols = ["
    const jsonStartIndex = protocolsFile.indexOf('[');
    const jsonEndIndex = protocolsFile.lastIndexOf(']') + 1;
    const protocolsJson = protocolsFile.substring(jsonStartIndex, jsonEndIndex);
    
    // Parse the JSON
    const allProtocols = JSON.parse(protocolsJson);
    
    console.log(`Found ${allProtocols.length} protocols in file`);
    
    // Check current protocols in database
    const existingProtocols = await db.select().from(protocols);
    console.log(`Currently ${existingProtocols.length} protocols in database`);
    
    if (existingProtocols.length >= 57) {
      console.log('All 57 protocols already in database!');
      
      // Fix isFreeAccess for protocols 1-3
      console.log('Updating isFreeAccess flags...');
      
      // Set all to false first
      await db.update(protocols).set({ isFreeAccess: false });
      
      // Then set protocols 1-3 to true
      await db.update(protocols)
        .set({ isFreeAccess: true })
        .where(db.sql`number IN (1, 2, 3)`);
        
      console.log('isFreeAccess flags updated!');
      return;
    }
    
    // Clear existing protocols
    console.log('Clearing existing protocols...');
    await db.delete(protocols);
    
    // Insert all protocols with proper isFreeAccess
    console.log('Inserting all 57 protocols...');
    const protocolsToInsert = allProtocols.map((p: any) => ({
      ...p,
      isFreeAccess: p.number <= 3 // Only first 3 are free
    }));
    
    await db.insert(protocols).values(protocolsToInsert);
    
    console.log('Successfully seeded all 57 protocols!');
    
    // Verify
    const finalCount = await db.select().from(protocols);
    console.log(`Final protocol count: ${finalCount.length}`);
    
    const freeProtocols = await db.select().from(protocols).where(db.sql`is_free_access = true`);
    console.log(`Free protocols: ${freeProtocols.map(p => p.number).join(', ')}`);
    
  } catch (error) {
    console.error('Error seeding protocols:', error);
  } finally {
    process.exit(0);
  }
}

seedAllProtocols();