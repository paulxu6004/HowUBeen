const db = require('../db');

const Checkin = {
    create: (userId, date, status, voiceUrl, textNote, callback) => {
        const sql = `INSERT INTO checkins (user_id, date, status, voice_url, text_note) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [userId, date, status, voiceUrl, textNote], function (err) {
            callback(err, { id: this.lastID });
        });
    },

    getByUserId: (userId, callback) => {
        const sql = `SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC`;
        db.all(sql, [userId], (err, rows) => {
            callback(err, rows);
        });
    },

    getByUserIdAndDate: (userId, date, callback) => {
        const sql = `SELECT * FROM checkins WHERE user_id = ? AND date = ?`;
        db.get(sql, [userId, date], (err, row) => {
            callback(err, row);
        });
    },

    getLatest: (userId, callback) => {
        const sql = `SELECT * FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
        db.get(sql, [userId], (err, row) => {
            callback(err, row);
        });
    }
};

module.exports = Checkin;
