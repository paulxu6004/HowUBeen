const express = require('express');
const router = express.Router();
const Period = require('../models/Period');

// POST /api/periods
router.post('/', (req, res) => {
  const { user_id, start_date, end_date, goal_1, goal_2, goal_3 } = req.body;

  if (!user_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Deactivate previous periods for this user first (optional, but good for cleanliness)
  Period.deactivateAll(user_id, (err) => {
    if (err) console.error('Error deactivating old periods', err);

    Period.create(user_id, start_date, end_date, goal_1, goal_2, goal_3, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: result.id,
        user_id,
        start_date,
        end_date,
        goal_1,
        goal_2,
        goal_3,
        is_active: 1
      });
    });
  });
});

// GET /api/periods/:userId/active
router.get('/:userId/active', (req, res) => {
  const userId = req.params.userId;
  Period.getActiveByUserId(userId, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'No active period found' });
    res.json(row);
  });
});

module.exports = router;
