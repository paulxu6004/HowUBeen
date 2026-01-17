/**
 * Database initialization and connection management
 * Uses SQLite for simplicity in MVP
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../data/life_tracker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

/**
 * Initialize database connection and create tables if they don't exist
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return reject(err);
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

/**
 * Create all required tables
 */
function createTables() {
  return new Promise((resolve, reject) => {
    const queries = [
      // Life periods table
      `CREATE TABLE IF NOT EXISTS periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        focus_areas TEXT NOT NULL,
        descriptions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Daily check-ins table
      `CREATE TABLE IF NOT EXISTS checkins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        period_id INTEGER,
        date DATE NOT NULL,
        raw_input TEXT,
        input_type TEXT NOT NULL,
        emoji TEXT,
        mood TEXT,
        focus_area TEXT,
        alignment TEXT,
        takeaway TEXT,
        voice_file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (period_id) REFERENCES periods(id),
        UNIQUE(user_id, date)
      )`,
      
      // Weekly summaries table
      `CREATE TABLE IF NOT EXISTS weekly_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        period_id INTEGER,
        week_start_date DATE NOT NULL,
        week_end_date DATE NOT NULL,
        summary_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (period_id) REFERENCES periods(id)
      )`,
      
      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_checkins_period ON checkins(period_id)`,
      `CREATE INDEX IF NOT EXISTS idx_periods_user ON periods(user_id)`
    ];

    let completed = 0;
    queries.forEach((query) => {
      db.run(query, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return reject(err);
        }
        completed++;
        if (completed === queries.length) {
          console.log('✓ All tables created successfully');
          resolve();
        }
      });
    });
  });
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          return reject(err);
        }
        console.log('Database connection closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};