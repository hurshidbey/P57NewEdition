import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse the protocols from the txt file and convert to JSON
async function parseProtocolsFile() {
  const filePath = path.join(__dirname, '..', 'attached_assets', 'prtocols.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the JavaScript object structure from the file
  const protocols = [];
  const lines = content.split('\n');
  let currentProtocol = {};
  let inProtocol = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('{')) {
      inProtocol = true;
      currentProtocol = {};
    } else if (trimmed.startsWith('}')) {
      if (inProtocol && currentProtocol.id) {
        protocols.push(currentProtocol);
      }
      inProtocol = false;
      currentProtocol = {};
    } else if (inProtocol) {
      // Parse key-value pairs
      const match = trimmed.match(/(\w+):\s*(.+),?$/);
      if (match) {
        const [, key, value] = match;
        let parsedValue = value.replace(/,$/, ''); // Remove trailing comma
        
        // Handle different value types
        if (parsedValue === 'null') {
          parsedValue = null;
        } else if (parsedValue.match(/^\d+$/)) {
          parsedValue = parseInt(parsedValue);
        } else if (parsedValue.startsWith('"') && parsedValue.endsWith('"')) {
          parsedValue = parsedValue.slice(1, -1); // Remove quotes
        }
        
        currentProtocol[key] = parsedValue;
      }
    }
  }
  
  return protocols;
}

async function createSeedFile() {
  try {
    const protocols = await parseProtocolsFile();
    
    // Create the seed directory
    const seedDir = path.join(__dirname, '..', 'supabase', 'seed');
    if (!fs.existsSync(seedDir)) {
      fs.mkdirSync(seedDir, { recursive: true });
    }
    
    // Write the protocols to JSON file
    const outputPath = path.join(seedDir, 'protocols.json');
    fs.writeFileSync(outputPath, JSON.stringify(protocols, null, 2));
    
    console.log(`Successfully created seed file with ${protocols.length} protocols`);
    console.log(`Seed file location: ${outputPath}`);
  } catch (error) {
    console.error('Error creating seed file:', error);
  }
}

// Run the script
createSeedFile();
