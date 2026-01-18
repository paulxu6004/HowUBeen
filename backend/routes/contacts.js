const express = require('express');
const router = express.Router();
const EmergencyContact = require('../models/EmergencyContact');

// GET /api/contacts/:userId
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    EmergencyContact.getByUserId(userId, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/contacts/:userId
router.post('/:userId', (req, res) => {
    const userId = req.params.userId;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Missing name or email' });
    }

    EmergencyContact.add(userId, name, email, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.id, user_id: userId, name, email });
    });
});

module.exports = router;
