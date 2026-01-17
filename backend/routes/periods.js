/**
 * API routes for managing life periods
 * POST /api/periods - Create a new period
 * GET /api/periods/:userId - Get all periods for a user
 * GET /api/periods/:userId/current - Get current active period
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/database');

/**
 * Create a new life period
 * Body: { userId, name, startDate, endDate, focusAreas[], descriptions[] }
 */
router.post('/', (req, res) => {
  const { userId, name, startDate, endDate, focusAreas, descriptions } = req.body;

  // Validation
  if (!userId || !name || !startDate || !endDate || !focusAreas || focusAreas.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (focusAreas.length > 3) {
    return res.status(400).json({ error: 'Maximum 3 focus areas allowed' });
  }

  const db = getDatabase();
  
  // Store focus areas and descriptions as JSON strings
  const focusAreasJson = JSON.stringify(focusAreas);
  const descriptionsJson = descriptions ? JSON.stringify(descriptions) : null;

  const query = `
    INSERT INTO periods (user_id, name, start_date, end_date, focus_areas, descriptions)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [userId, name, startDate, endDate, focusAreasJson, descriptionsJson], function(err) {
    if (err) {
      console.error('Error creating period:', err);
      return res.status(500).json({ error: 'Failed to create period' });
    }

    res.status(201).json({
      id: this.lastID,
      userId,
      name,
      startDate,
      endDate,
      focusAreas: JSON.parse(focusAreasJson),
      descriptions: descriptionsJson ? JSON.parse(descriptionsJson) : null,
      message: 'Period created successfully'
    });
  });
});

/**
 * Get all periods for a user
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();

  const query = `SELECT * FROM periods WHERE user_id = ? ORDER BY created_at DESC`;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching periods:', err);
      return res.status(500).json({ error: 'Failed to fetch periods' });
    }

    const periods = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      focusAreas: JSON.parse(row.focus_areas),
      descriptions: row.descriptions ? JSON.parse(row.descriptions) : null,
      createdAt: row.created_at
    }));

    res.json(periods);
  });
});

/**
 * Get current active period for a user
 */
router.get('/:userId/current', (req, res) => {
  const { userId } = req.params;
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const query = `
    SELECT * FROM periods 
    WHERE user_id = ? 
    AND start_date <= ? 
    AND end_date >= ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.get(query, [userId, today, today], (err, row) => {
    if (err) {
      console.error('Error fetching current period:', err);
      return res.status(500).json({ error: 'Failed to fetch current period' });
    }

    if (!row) {
      return res.status(404).json({ error: 'No active period found' });
    }

    res.json({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      focusAreas: JSON.parse(row.focus_areas),
      descriptions: row.descriptions ? JSON.parse(row.descriptions) : null,
      createdAt: row.created_at
    });
  });
});

module.exports = router;