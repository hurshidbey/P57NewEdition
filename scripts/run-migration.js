import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.production') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'migrations', 'add_coupon_system.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    console.log('Starting coupon system migration...');
    
    // Execute the entire migration as a transaction
    await sql.begin(async sql => {
      // Split by semicolon but keep statements that might have semicolons in strings
      const statements = migrationSql
        .split(/;\s*$/gm)
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.match(/^--/));
      
      console.log(`Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
          console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
          
          await sql.unsafe(statement);
          console.log(`✓ Statement ${i + 1} executed successfully`);
        }
      }
    });
    
    console.log('\n✅ Migration completed successfully!');
    
    // Verify the tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('coupons', 'coupon_usages')
    `;
    
    console.log('\nCreated tables:', tables.map(t => t.table_name).join(', '));
    
    // Verify the coupons were inserted
    const coupons = await sql`SELECT code, description FROM coupons`;
    console.log('\nInserted coupons:');
    coupons.forEach(c => console.log(`- ${c.code}: ${c.description}`));
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();