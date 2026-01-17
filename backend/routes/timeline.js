/**
 * API routes for timeline view
 * GET /api/timeline/:userId - Get timeline of check-ins for a user
 * GET /api/timeline/:userId/:periodId - Get timeline for a specific period
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

/**
 * Get timeline of check-ins for a user
 * Returns check-ins with dates, moods, and AI labels
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const { periodId, startDate, endDate } = req.query;
  const db = getDatabase();

  let query = `SELECT * FROM checkins WHERE user_id = ?`;
  const params = [userId];

  if (periodId) {
    query += ` AND period_id = ?`;
    params.push(periodId);
  }

  if (startDate) {
    query += ` AND date >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY date DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching timeline:', err);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }

    const timeline = rows.map(row => ({
      id: row.id,
      date: row.date,
      rawInput: row.raw_input,
      inputType: row.input_type,
      emoji: row.emoji,
      mood: row.mood,
      focusArea: row.focus_area,
      alignment: row.alignment,
      takeaway: row.takeaway,
      voiceFilePath: row.voice_file_path
    }));

    res.json(timeline);
  });
});

/**
 * Get timeline for a specific period
 */
router.get('/:userId/period/:periodId', (req, res) => {
  const { userId, periodId } = req.params;
  const db = getDatabase();

  const query = `
    SELECT c.* FROM checkins c
    WHERE c.user_id = ? AND c.period_id = ?
    ORDER BY c.date DESC
  `;

  db.all(query, [userId, periodId], (err, rows) => {
    if (err) {
      console.error('Error fetching period timeline:', err);
      return res.status(500).json({ error: 'Failed to fetch timeline' });
    }

    const timeline = rows.map(row => ({
      id: row.id,
      date: row.date,
      rawInput: row.raw_input,
      inputType: row.input_type,
      emoji: row.emoji,
      mood: row.mood,
      focusArea: row.focus_area,
      alignment: row.alignment,
      takeaway: row.takeaway,
      voiceFilePath: row.voice_file_path
    }));

    res.json(timeline);
  });
});

module.exports = router;