const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.post('/', (req, res) => {
    const { productId, customerId, rating, comment } = req.body;
    const reviewDate = new Date();

    pool.query(
        'INSERT INTO product_reviews (product_id, customer_id, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)',
        [productId, customerId, rating, comment, reviewDate],
        (error, _) => {
            if (error) {
                console.error('Error submitting review:', error);
                res.status(500).json({ message: 'Failed to submit review' });
            } else {
                res.status(201).json({ message: 'Review submitted successfully' });
            }
        }
    );
});

router.get('/average/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    pool.query('SELECT AVG(rating) AS rating FROM product_reviews WHERE product_id = ?', [itemId], (error, results) => {
        if (error) throw error;
        res.json(results[0]);
    });
});

router.get('/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    pool.query(
        'SELECT pr.*, c.username FROM product_reviews pr JOIN customers c ON pr.customer_id = c.id WHERE pr.product_id = ?',
        [itemId],
        (error, results) => {
            if (error) throw error;
            res.json(results);
        }
    );
});

module.exports = router;
