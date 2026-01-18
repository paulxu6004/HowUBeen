const express = require('express');
const router = express.Router();
const db = require('../db');
const { extractCheckinData } = require('../utils/ai');

// Submit a daily check-in
router.post('/', async (req, res) => {
  const { period_id, input_type, raw_input } = req.body;

  // AI extraction
  const aiResult = await extractCheckinData(raw_input);

  db.run(
    `INSERT INTO checkins (period_id, date, input_type, raw_input, mood, focus_area, alignment, takeaway)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      period_id,
      new Date().toISOString().split('T')[0], // current date
      input_type,
      raw_input,
      aiResult.mood,
      aiResult.focus_area,
      aiResult.alignment,
      aiResult.takeaway
    ],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID, aiResult });
    }
  );
});

module.exports = router;
