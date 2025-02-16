const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get('/recommended', (_, res) => {
    pool.query('SELECT * FROM products WHERE recommended = 1 LIMIT 5', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/community-picks', (_, res) => {

    pool.query('SELECT * FROM products WHERE community_pick = 1 LIMIT 5', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/trending', (_, res) => {

    pool.query('SELECT * FROM products WHERE trending = 1 LIMIT 5', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

//https://stackabuse.com/guide-to-the-like-clause-in-mysql/
router.get('/search', (req, res) => {
    const searchTerm = req.query.term;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? LIMIT ? OFFSET ?';
    const values = [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset];

    pool.query(query, values, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/filter', (req, res) => {
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products';
    let values = [];

    if (category === 'recommended') {
        query += ' WHERE recommended = 1';
    } else if (category === 'community_pick') {
        query += ' WHERE community_pick = 1';
    } else if (category === 'trending') {
        query += ' WHERE trending = 1';
    }

    query += ' LIMIT ? OFFSET ?';
    values = [...values, limit, offset];

    pool.query(query, values, (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/related/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    pool.query('SELECT * FROM products WHERE id != ? ORDER BY RAND() LIMIT 5', [itemId], (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    pool.query('SELECT * FROM products WHERE id = ?', [itemId], (error, results) => {
        if (error) throw error;
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        const item = results[0];
        res.json(item);
    });
});

module.exports = router;
