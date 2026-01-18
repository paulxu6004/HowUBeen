const express = require('express');
const router = express.Router();
const Checkin = require('../models/Checkin');

// POST /api/checkins
router.post('/', (req, res) => {
  const { user_id, status, voice_url, text_note } = req.body;

  // Simple validation
  if (!user_id) return res.status(400).json({ error: 'User ID required' });

  // Default status if not provided (though prompt implies explicit choice or "good" logic)
  // Logic: "Check in button" ensures they are alive.
  // Status is optional? User said "selecting one of a few states". 
  // Let's enforce status if possible, or default to 'neutral' if purely 'alive' check.
  const finalStatus = status || 'neutral';
  const date = new Date().toISOString().split('T')[0];

  Checkin.create(user_id, date, finalStatus, voice_url, text_note, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      id: result.id,
      user_id,
      date,
      status: finalStatus,
      voice_url,
      text_note
    });
  });
});

// GET /api/checkins/:userId/today
router.get('/:userId/today', (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().split('T')[0];

  Checkin.getByUserIdAndDate(userId, today, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    // If row exists, they checked in.
    res.json({ checked_in: !!row, checkin: row });
  });
});

// GET /api/checkins/:userId
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  Checkin.getByUserId(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
