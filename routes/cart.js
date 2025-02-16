const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get('/', (req, res) => {
    const userId = req.query.userId;

    pool.query(
        `SELECT ci.id, ci.quantity, p.name, p.price, p.image_url
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        JOIN products p ON ci.product_id = p.id
        WHERE c.customer_id = ?`,
        [userId],
        (error, results) => {
            if (error) {
                console.error('Error retrieving cart items:', error);
                return res.status(500).json({ message: 'Error retrieving cart items' });
            }
            res.json(results);
        }
    );
});

router.post('/', (req, res) => {
    const { productId, quantity, userId } = req.body;

    pool.query('SELECT id FROM carts WHERE customer_id = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error checking cart existence:', error);
            return res.status(500).json({ message: 'Error adding item to cart' });
        }

        let cartId;
        if (results.length > 0) {
            cartId = results[0].id;
            addItemToCart(cartId);
        } else {
            pool.query('SELECT id FROM customers WHERE id = ?', [userId], (error, results) => {
                if (error) {
                    console.error('Error checking customer existence:', error);
                    return res.status(500).json({ message: 'Error adding item to cart' });
                }
                if (results.length === 0) {
                    return res.status(400).json({ message: 'Invalid customer ID' });
                }
                pool.query('INSERT INTO carts (customer_id) VALUES (?)', [userId], (error, results) => {
                    if (error) {
                        console.error('Error creating new cart:', error);
                        return res.status(500).json({ message: 'Error adding item to cart' });
                    }
                    cartId = results.insertId;
                    addItemToCart(cartId);
                });
            });
        }
    });

    function addItemToCart(cartId) {
        pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId],
            (error, results) => {
                if (error) {
                    console.error('Error checking cart item existence:', error);
                    return res.status(500).json({ message: 'Error adding item to cart' });
                }

                if (results.length > 0) {
                    const newQuantity = results[0].quantity + quantity;
                    pool.query(
                        'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
                        [newQuantity, cartId, productId],
                        (error) => {
                            if (error) {
                                console.error('Error updating cart item quantity:', error);
                                return res.status(500).json({ message: 'Error updating item quantity' });
                            }
                            res.status(200).json({ message: 'Item quantity updated successfully' });
                        }
                    );
                } else {
                    pool.query(
                        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                        [cartId, productId, quantity],
                        (error) => {
                            if (error) {
                                console.error('Error adding item to cart:', error);
                                return res.status(500).json({ message: 'Error adding item to cart' });
                            }
                            res.status(201).json({ message: 'Item added to cart successfully' });
                        }
                    );
                }
            }
        );
    }

});

router.delete('/:itemId', (req, res) => {
    const itemId = req.params.itemId;

    pool.query('SELECT quantity FROM cart_items WHERE id = ?', [itemId], (error, results) => {
        if (error) {
            console.error('Error fetching cart item quantity:', error);
            return res.status(500).json({ message: 'Error removing item from cart' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const quantity = results[0].quantity;

        if (quantity > 1) {
            pool.query('UPDATE cart_items SET quantity = quantity - 1 WHERE id = ?', [itemId], (error) => {
                if (error) {
                    console.error('Error updating cart item quantity:', error);
                    return res.status(500).json({ message: 'Error updating item quantity' });
                }
                res.sendStatus(200);
            });
        } else {
            pool.query('DELETE FROM cart_items WHERE id = ?', [itemId], (error) => {
                if (error) {
                    console.error('Error removing item from cart:', error);
                    return res.status(500).json({ message: 'Error removing item from cart' });
                }
                res.sendStatus(204);
            });
        }
    });
});

module.exports = router;
