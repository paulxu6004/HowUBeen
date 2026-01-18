const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateWeeklySummary } = require('../utils/ai');

// GET /api/summary/:userId
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch last 7 days check-ins
  db.all(
    `SELECT * FROM checkins WHERE user_id = ? AND date >= ? ORDER BY date DESC`,
    [userId, sevenDaysAgo],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Generate Summary
      // Note: This might be slow if we call OpenAI every time. 
      // Ideally we cache this or run it via cron. 
      // For MVP demo, calling it live is acceptable but slow.
      const summary = await generateWeeklySummary(rows);

      // To mimic the array structure frontend expects (legacy code)
      // we wrap it in an array.
      res.json([summary]);
    }
  );
});

module.exports = router;
