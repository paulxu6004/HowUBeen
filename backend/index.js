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
// const summaryRoutes = require('./routes/summary'); // Commented out for now, focus on core logic

app.use('/api/auth', authRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/contacts', contactRoutes);
// app.use('/api/summaries', summaryRoutes);

const db = require('./db'); // Initializes DB
const SafetyService = require('./services/safetyService');

// Run Safety Check every hour (3600000 ms)
setInterval(() => {
    SafetyService.checkAllUsers();
}, 3600000);

app.get('/', (req, res) => {
    res.send('HowUBeen API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
