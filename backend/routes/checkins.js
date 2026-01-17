/**
 * API routes for daily check-ins
 * POST /api/checkins - Submit a check-in (text or voice)
 * GET /api/checkins/:userId/:date - Get check-in for specific date
 * GET /api/checkins/:userId - Get all check-ins for a user
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getDatabase } = require('../db/database');
const { processCheckIn } = require('../services/aiService');

// Configure multer for voice note uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max for voice notes
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * Submit a daily check-in
 * Supports both text and voice inputs
 */
router.post('/', upload.single('voiceNote'), async (req, res) => {
  try {
    const { userId, periodId, date, textInput, emoji } = req.body;
    const voiceFile = req.file;

    // Validation
    if (!userId || !date) {
      return res.status(400).json({ error: 'Missing userId or date' });
    }

    // Determine input type and raw input
    let inputType = 'text';
    let rawInput = textInput || '';
    let voiceFilePath = null;

    if (voiceFile) {
      inputType = 'voice';
      voiceFilePath = `/uploads/${voiceFile.filename}`;
      
      // If both voice and text provided, prioritize voice
      // Voice will be transcribed later by AI
      rawInput = textInput || ''; // Keep text as fallback/context
    } else if (!textInput) {
      return res.status(400).json({ error: 'Either text input or voice note is required' });
    }

    const db = getDatabase();

    // Check if check-in already exists for this date
    db.get('SELECT id FROM checkins WHERE user_id = ? AND date = ?', [userId, date], async (err, existing) => {
      if (err) {
        console.error('Error checking existing check-in:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Insert or update check-in
      let checkInId;
      
      if (existing) {
        // Update existing check-in
        const updateQuery = `
          UPDATE checkins 
          SET raw_input = ?, input_type = ?, emoji = ?, voice_file_path = ?
          WHERE id = ?
        `;
        
        db.run(updateQuery, [rawInput, inputType, emoji, voiceFilePath, existing.id], async (err) => {
          if (err) {
            console.error('Error updating check-in:', err);
            return res.status(500).json({ error: 'Failed to update check-in' });
          }
          checkInId = existing.id;
          await processAndRespond();
        });
      } else {
        // Insert new check-in
        const insertQuery = `
          INSERT INTO checkins (user_id, period_id, date, raw_input, input_type, emoji, voice_file_path)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [userId, periodId || null, date, rawInput, inputType, emoji, voiceFilePath], async function(err) {
          if (err) {
            console.error('Error creating check-in:', err);
            return res.status(500).json({ error: 'Failed to create check-in' });
          }
          checkInId = this.lastID;
          await processAndRespond();
        });
      }

      async function processAndRespond() {
        try {
          // Process with AI (transcription + extraction)
          const aiResults = await processCheckIn(rawInput, voiceFilePath, inputType);
          
          // Update check-in with AI results
          const updateAiQuery = `
            UPDATE checkins 
            SET mood = ?, focus_area = ?, alignment = ?, takeaway = ?, raw_input = ?
            WHERE id = ?
          `;
          
          // If voice was transcribed, update raw_input
          const finalRawInput = aiResults.transcribedText || rawInput;

          db.run(
            updateAiQuery,
            [
              aiResults.mood || emoji,
              aiResults.focusArea,
              aiResults.alignment,
              aiResults.takeaway,
              finalRawInput,
              checkInId
            ],
            (err) => {
              if (err) {
                console.error('Error updating AI results:', err);
              }

              // Return check-in with AI results
              db.get('SELECT * FROM checkins WHERE id = ?', [checkInId], (err, row) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to fetch updated check-in' });
                }

                res.status(200).json({
                  id: row.id,
                  userId: row.user_id,
                  periodId: row.period_id,
                  date: row.date,
                  rawInput: row.raw_input,
                  inputType: row.input_type,
                  emoji: row.emoji,
                  mood: row.mood,
                  focusArea: row.focus_area,
                  alignment: row.alignment,
                  takeaway: row.takeaway,
                  voiceFilePath: row.voice_file_path,
                  createdAt: row.created_at
                });
              });
            }
          );
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          // Still return the check-in even if AI processing failed
          db.get('SELECT * FROM checkins WHERE id = ?', [checkInId], (err, row) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch check-in' });
            }
            res.status(200).json({
              id: row.id,
              userId: row.user_id,
              date: row.date,
              rawInput: row.raw_input,
              inputType: row.input_type,
              emoji: row.emoji,
              warning: 'AI processing failed, check-in saved without AI labels'
            });
          });
        }
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get check-in for a specific date
 */
router.get('/:userId/:date', (req, res) => {
  const { userId, date } = req.params;
  const db = getDatabase();

  const query = `SELECT * FROM checkins WHERE user_id = ? AND date = ?`;

  db.get(query, [userId, date], (err, row) => {
    if (err) {
      console.error('Error fetching check-in:', err);
      return res.status(500).json({ error: 'Failed to fetch check-in' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    res.json({
      id: row.id,
      userId: row.user_id,
      periodId: row.period_id,
      date: row.date,
      rawInput: row.raw_input,
      inputType: row.input_type,
      emoji: row.emoji,
      mood: row.mood,
      focusArea: row.focus_area,
      alignment: row.alignment,
      takeaway: row.takeaway,
      voiceFilePath: row.voice_file_path,
      createdAt: row.created_at
    });
  });
});

/**
 * Get all check-ins for a user
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit = 100 } = req.query;
  const db = getDatabase();

  const query = `SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT ?`;

  db.all(query, [userId, limit], (err, rows) => {
    if (err) {
      console.error('Error fetching check-ins:', err);
      return res.status(500).json({ error: 'Failed to fetch check-ins' });
    }

    const checkins = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      periodId: row.period_id,
      date: row.date,
      rawInput: row.raw_input,
      inputType: row.input_type,
      emoji: row.emoji,
      mood: row.mood,
      focusArea: row.focus_area,
      alignment: row.alignment,
      takeaway: row.takeaway,
      voiceFilePath: row.voice_file_path,
      createdAt: row.created_at
    }));

    res.json(checkins);
  });
});

module.exports = router;