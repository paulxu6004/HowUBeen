const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/auth');
const periodRoutes = require('./routes/period');
const checkinRoutes = require('./routes/checkin');
const contactRoutes = require('./routes/contacts');
const summaryRoutes = require('./routes/summary');

app.use('/api/auth', authRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/summary', summaryRoutes);

const db = require('./db'); // Initializes DB
const SafetyService = require('./services/safetyService');

// Run Safety Check every hour (3600000 ms)
setInterval(() => {
    SafetyService.checkAllUsers();
}, 3600000);

app.get('/', (req, res) => {
    res.send('HowUBeen API is running');
});

// Test Email Route
app.post('/api/test-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { sendEmail } = require('./services/emailService');
    const success = await sendEmail(email, 'Test Email from HowUBeen', '<h1>It Works!</h1><p>If you see this, email integration is active.</p>');

    if (success) res.json({ message: 'Email sent successfully via Ethereal/SMTP' });
    else res.status(500).json({ error: 'Failed to send email' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
