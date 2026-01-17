/**
 * Main Express server for Life Tracker / Accountability App
 * Handles API routes for periods, check-ins, and AI processing
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const periodsRouter = require('./routes/periods');
const checkinsRouter = require('./routes/checkins');
const summariesRouter = require('./routes/summaries');
const timelineRouter = require('./routes/timeline');

// Import database initialization
const { initDatabase } = require('./db/database');

// Import cron job for weekly summaries
const { setupWeeklySummaryCron } = require('./services/weeklySummaryService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file uploads (for voice notes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database on startup
initDatabase().then(() => {
  console.log('✓ Database initialized');
  
  // Setup weekly summary cron job (runs every Sunday at 9 AM)
  setupWeeklySummaryCron();
  console.log('✓ Weekly summary cron job scheduled');
}).catch(err => {
  console.error('Database initialization error:', err);
});

// API Routes
app.use('/api/periods', periodsRouter);
app.use('/api/checkins', checkinsRouter);
app.use('/api/summaries', summariesRouter);
app.use('/api/timeline', timelineRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Life Tracker API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API available at http://localhost:${PORT}/api`);
});

module.exports = app;