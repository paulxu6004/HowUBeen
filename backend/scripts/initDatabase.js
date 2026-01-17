/**
 * Database initialization script
 * Run with: npm run init-db
 */

const { initDatabase, closeDatabase } = require('../db/database');

async function main() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('✓ Database initialized successfully');
    await closeDatabase();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();