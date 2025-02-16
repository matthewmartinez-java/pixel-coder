const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db.js');

router.put('/update', (req, res) => {
    const { username, email, newPassword } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ success: false, message: 'Error updating settings' });
        }

        pool.query('UPDATE customers SET username = ?, email = ?, password = ? WHERE id = ?',
            [username, email, hashedPassword, userId], (error, _) => {
                if (error) {
                    console.error("Database error during user update:", error);
                    return res.status(500).json({ success: false, message: 'Error updating settings' });
                }
                res.json({ success: true, message: 'Settings updated successfully' });
            });
    });
});

router.get('/:userId', (req, res) => {
    const userId = req.params.userId;
    pool.query('SELECT * FROM customers WHERE id = ?', [userId], (error, results) => {
        if (error) {
            console.error("Database error during user retrieval:", error);
            return res.status(500).json({ success: false, message: 'Error retrieving user' });
        }
        res.json(results);
    });
});

module.exports = router;
