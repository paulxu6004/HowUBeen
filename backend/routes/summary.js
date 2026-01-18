const express = require('express');
const router = express.Router();
const db = require('../db');
const { generateWeeklySummary } = require('../utils/ai');

router.get('/:period_id', (req, res) => {
  const period_id = req.params.period_id;

  db.all(`SELECT * FROM checkins WHERE period_id = ?`, [period_id], async (err, rows) => {
    if (err) return res.status(500).send(err.message);

    const summary = await generateWeeklySummary(rows);
    res.json({ summary });
  });
});

module.exports = router;
