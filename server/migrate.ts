import { db } from './db';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

async function runMigrations() {
  console.log('Running migrations...');
  try {
    // Add new columns to applications table
    await db.execute(sql`
      ALTER TABLE IF EXISTS applications 
      ADD COLUMN IF NOT EXISTS resume TEXT,
      ADD COLUMN IF NOT EXISTS cover_letter TEXT,
      ADD COLUMN IF NOT EXISTS employer_notes TEXT,
      ADD COLUMN IF NOT EXISTS requested_documents TEXT;
    `);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

// Export for importing in other files
export { runMigrations };