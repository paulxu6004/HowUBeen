const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new life period
router.post('/', (req, res) => {
  const { name, start_date, end_date, focus_areas } = req.body;
  const focusStr = focus_areas.join(',');
  db.run(
    `INSERT INTO periods (name, start_date, end_date, focus_areas) VALUES (?, ?, ?, ?)`,
    [name, start_date, end_date, focusStr],
    function(err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID });
    }
  );
});

// Get all periods (for testing)
router.get('/', (req, res) => {
  db.all(`SELECT * FROM periods`, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

module.exports = router;
