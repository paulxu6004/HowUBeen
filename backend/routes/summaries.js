/**
 * API routes for weekly summaries
 * GET /api/summaries/:userId - Get all weekly summaries for a user
 * GET /api/summaries/:userId/latest - Get latest weekly summary
 * POST /api/summaries/generate - Manually trigger summary generation (for testing)
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { generateWeeklySummary } = require('../services/weeklySummaryService');

/**
 * Get all weekly summaries for a user
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();

  const query = `SELECT * FROM weekly_summaries WHERE user_id = ? ORDER BY week_start_date DESC`;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching summaries:', err);
      return res.status(500).json({ error: 'Failed to fetch summaries' });
    }

    const summaries = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      periodId: row.period_id,
      weekStartDate: row.week_start_date,
      weekEndDate: row.week_end_date,
      summaryText: row.summary_text,
      createdAt: row.created_at
    }));

    res.json(summaries);
  });
});

/**
 * Get latest weekly summary for a user
 */
router.get('/:userId/latest', (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();

  const query = `
    SELECT * FROM weekly_summaries 
    WHERE user_id = ? 
    ORDER BY week_start_date DESC 
    LIMIT 1
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching latest summary:', err);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }

    if (!row) {
      return res.status(404).json({ error: 'No summary found' });
    }

    res.json({
      id: row.id,
      userId: row.user_id,
      periodId: row.period_id,
      weekStartDate: row.week_start_date,
      weekEndDate: row.week_end_date,
      summaryText: row.summary_text,
      createdAt: row.created_at
    });
  });
});

/**
 * Manually trigger weekly summary generation (for testing)
 */
router.post('/generate', async (req, res) => {
  const { userId, periodId, weekStartDate, weekEndDate } = req.body;

  if (!userId || !weekStartDate || !weekEndDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const summary = await generateWeeklySummary(userId, periodId, weekStartDate, weekEndDate);
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;