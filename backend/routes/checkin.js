const express = require('express');
const router = express.Router();
const db = require('../db');
const { extractCheckinData, transcribeAudio } = require('../utils/ai');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for local storage
const upload = multer({ 
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Submit a daily check-in
// Uses 'upload.single("voice")' to handle the file field named "voice"
router.post('/', upload.single('voice'), async (req, res) => {
  try {
    const { user_id, status, text_note } = req.body;
    let voice_url = null; // We'll store the filename or path in DB

    // Default status if not provided
    const finalStatus = status || 'neutral';
    const date = new Date().toISOString().split('T')[0];

    // 1. Determine Input for AI
    let aiInput = text_note || "";

    // 2. If valid voice file is uploaded, transcribe it
    if (req.file) {
      voice_url = req.file.path; // Store full local path for now (or relative if serving statically)
      
      const transcript = await transcribeAudio(voice_url);
      if (transcript) {
        aiInput += `\n[Voice Transcript]: ${transcript}`;
      }
    }

    // 3. Extract Insights using AI
    // We pass the combined text (note + transcript) to the AI
    const aiResult = await extractCheckinData(aiInput);

    // 4. Save to Database
    db.run(
      `INSERT INTO checkins (user_id, date, status, voice_url, text_note)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        date,
        finalStatus,
        voice_url, // Path to file on server
        text_note
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Return full info including AI analysis
        res.status(201).json({
          id: this.lastID,
          checked_in: true,
          date,
          status: finalStatus,
          voice_url,
          text_note,
          ai_analysis: aiResult
        });
      }
    );
  } catch (error) {
    console.error("Check-in Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/checkins/:userId/today
router.get('/:userId/today', (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().split('T')[0];

  const Checkin = require('../models/Checkin'); // Quick fix: import model or use direct DB query
  // Actually, I should check if I imported db correctly. 
  // The code above uses direct db.run for POST but Checkin model for GET? 
  // Let's stick to consistent style. The previous file had: 
  // const Checkin = require('../models/Checkin');

  // Re-adding the model import at the top is cleaner.
  Checkin.getByUserIdAndDate(userId, today, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    // If row exists, they checked in.
    res.json({ checked_in: !!row, checkin: row });
  });
});

// GET /api/checkins/:userId
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const Checkin = require('../models/Checkin');
  Checkin.getByUserId(userId, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
