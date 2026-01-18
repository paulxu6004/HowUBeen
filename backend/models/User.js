const db = require('../db');

const User = {
    create: (name, email, password, callback) => {
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(sql, [name, email, password], function (err) {
            callback(err, { id: this.lastID });
        });
    },

    findByEmail: (email, callback) => {
        const sql = `SELECT * FROM users WHERE email = ?`;
        db.get(sql, [email], (err, row) => {
            callback(err, row);
        });
    },

    findById: (id, callback) => {
        const sql = `SELECT * FROM users WHERE id = ?`;
        db.get(sql, [id], (err, row) => {
            callback(err, row);
        });
    },

    getAll: (callback) => {
        const sql = `SELECT * FROM users`;
        db.all(sql, [], (err, rows) => {
            callback(err, rows);
        });
    }
};

module.exports = User;
