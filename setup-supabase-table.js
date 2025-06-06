import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

console.log('🔗 Connecting to Supabase PostgreSQL...');

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setupTable() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create user_progress table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          protocol_id INTEGER NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          practice_count INTEGER DEFAULT 1,
          last_score INTEGER,
          UNIQUE(user_id, protocol_id)
      );
    `;

    console.log('🔨 Creating user_progress table...');
    await client.query(createTableSQL);
    console.log('✅ Table created successfully');

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id);
    `;

    console.log('📊 Creating indexes...');
    await client.query(createIndexes);
    console.log('✅ Indexes created successfully');

    // Test insert
    const testInsert = `
      INSERT INTO user_progress (user_id, protocol_id, last_score, practice_count) 
      VALUES ('test-user-123', 1, 75, 1)
      ON CONFLICT (user_id, protocol_id) DO UPDATE SET
          practice_count = user_progress.practice_count + 1,
          last_score = EXCLUDED.last_score,
          completed_at = NOW()
      RETURNING *;
    `;

    console.log('💾 Testing insert...');
    const result = await client.query(testInsert);
    console.log('✅ Insert successful:', result.rows[0]);

    // Test select
    console.log('📖 Testing select...');
    const selectResult = await client.query('SELECT * FROM user_progress WHERE user_id = $1', ['test-user-123']);
    console.log('✅ Select successful:', selectResult.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setupTable();