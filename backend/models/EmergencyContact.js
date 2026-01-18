const db = require('../db');

const EmergencyContact = {
    add: (userId, name, email, callback) => {
        const sql = `INSERT INTO emergency_contacts (user_id, name, email) VALUES (?, ?, ?)`;
        db.run(sql, [userId, name, email], function (err) {
            callback(err, { id: this.lastID });
        });
    },

    getByUserId: (userId, callback) => {
        const sql = `SELECT * FROM emergency_contacts WHERE user_id = ?`;
        db.all(sql, [userId], (err, rows) => {
            callback(err, rows);
        });
    },

    deleteAllByUserId: (userId, callback) => {
        const sql = `DELETE FROM emergency_contacts WHERE user_id = ?`;
        db.run(sql, [userId], function (err) {
            callback(err);
        });
    }
};

module.exports = EmergencyContact;
