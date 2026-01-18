const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/signup
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    User.create(name, email, password, (err, result) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.id, name, email });
    });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    User.findByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({ id: user.id, name: user.name, email: user.email });
    });
});

module.exports = router;
