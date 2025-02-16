const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db.js');
require('dotenv').config();

const router = express.Router();

console.log( process.env)

router.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    pool.query('SELECT * FROM customers WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error("Database error during email check:", error);
            return res.status(500).json({ success: false, message: 'Error checking email' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, message: 'Error hashing password' });

            pool.query('INSERT INTO customers (username, password, email) VALUES (?, ?, ?)', [username, hash, email], (error) => {
                if (error) {
                    console.error("error:", error);
                    return res.status(500).json({ success: false, message: 'Error registering user' });
                }

                res.json({ success: true, message: 'User registered successfully' });
            });
        });
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    pool.query('SELECT * FROM customers WHERE username = ? OR email = ?', [username, username], (error, results) => {
        if (error) {
            console.error("Database error on login:", error);
            return res.status(500).json({ success: false, message: 'Error retrieving user' });
        }
        if (results.length === 0) {
            console.log("No username found for:", username); // Log if no user is found
            return res.status(401).json({ success: false, message: 'Authentication failed' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ success: false, message: 'Error checking password' });
            if (!isMatch) return res.status(401).json({ success: false, message: 'Authentication failed' });
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, message: 'Logged in successfully', token: token });
        });
    });
});

module.exports = router;
