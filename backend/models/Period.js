const db = require('../db');

const Period = {
    create: (userId, startDate, endDate, goalsJSON, callback) => {
        const sql = `INSERT INTO periods (user_id, start_date, end_date, goals) VALUES (?, ?, ?, ?)`;
        db.run(sql, [userId, startDate, endDate, goalsJSON], function (err) {
            callback(err, { id: this.lastID });
        });
    },

    getActiveByUserId: (userId, callback) => {
        const sql = `SELECT * FROM periods WHERE user_id = ? AND is_active = 1 ORDER BY start_date DESC LIMIT 1`;
        db.get(sql, [userId], (err, row) => {
            callback(err, row);
        });
    },

    deactivateAll: (userId, callback) => {
        const sql = `UPDATE periods SET is_active = 0 WHERE user_id = ?`;
        db.run(sql, [userId], function (err) {
            callback(err);
        });
    }
};

module.exports = Period;
