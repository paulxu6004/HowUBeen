// backend/index.js
const express = require('express');
const cors = require('cors');
const { checkMissedCheckins } = require('./utils/checkMissed');
checkMissedCheckins();
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const periodRoutes = require('./routes/period');
const checkinRoutes = require('./routes/checkin');
const summaryRoutes = require('./routes/summary');

app.use('/api/period', periodRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/summary', summaryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
