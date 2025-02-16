const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.post('/checkout', (req, res) => {
    const { userId, address, paymentType } = req.body;

    pool.getConnection(async (err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err);
            return res.status(500).json({ message: 'Error processing checkout' });
        }

        try {
            await beginTransaction(connection);
            const orderId = await createOrder(connection, userId);
            await insertOrderItems(connection, orderId, userId);
            await insertPaymentDetails(connection, userId, address, paymentType);
            await clearCartItems(connection, userId);
            await commitTransaction(connection);
            res.status(200).json({ message: 'Checkout processed successfully' });
        } catch (error) {
            await rollbackTransaction(connection);
            res.status(500).json({ message: 'Error processing checkout' });
        } finally {
            connection.release();
        }
    });
});

function beginTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function createOrder(connection, userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO orders (customer_id, order_date, total_amount) VALUES (?, CURRENT_TIMESTAMP, (SELECT SUM(p.price * ci.quantity) FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = (SELECT id FROM carts WHERE customer_id = ?)))',
            [userId, userId],
            (error, results) => {
                if (error) {
                    console.error('Error creating order:', error);
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            }
        );
    });
}

function insertOrderItems(connection, orderId, userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) SELECT ?, ci.product_id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = (SELECT id FROM carts WHERE customer_id = ?)',
            [orderId, userId],
            (error) => {
                if (error) {
                    console.error('Error inserting order items:', error);
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}

function insertPaymentDetails(connection, userId, address, paymentType) {
    return new Promise((resolve, reject) => {
        connection.query(
            'INSERT INTO payment_details (customer_id, address, payment_type) VALUES (?, ?, ?)',
            [userId, address, paymentType],
            (error) => {
                if (error) {
                    console.error('Error inserting payment details:', error);
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}

function clearCartItems(connection, userId) {
    return new Promise((resolve, reject) => {
        connection.query(
            'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE customer_id = ?)',
            [userId],
            (error) => {
                if (error) {
                    console.error('Error clearing cart items:', error);
                    reject(error);
                } else {
                    resolve();
                }
            }
        );
    });
}

function commitTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.commit((err) => {
            if (err) {
                console.error('Error committing transaction:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function rollbackTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.rollback((err) => {
            if (err) {
                console.error('Error rolling back transaction:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

router.get('/', (req, res) => {
    const userId = req.query.userId;

    pool.query(
        `SELECT o.id, o.order_date, o.total_amount,
        (SELECT pd.address
            FROM payment_details pd
            WHERE pd.customer_id = o.customer_id
            ORDER BY pd.id DESC
            LIMIT 1) AS address,
        (SELECT pd.payment_type
            FROM payment_details pd
            WHERE pd.customer_id = o.customer_id
            ORDER BY pd.id DESC
            LIMIT 1) AS payment_type
        FROM orders o
        WHERE o.customer_id = ?`,
        [userId],
        (error, orderResults) => {
            if (error) {
                console.error('Error retrieving orders:', error);
                return res.status(500).json({ message: 'Error retrieving orders' });
            }

            const orders = orderResults.map(order => ({
                id: order.id,
                order_date: order.order_date,
                total_amount: order.total_amount,
                address: order.address,
                payment_type: order.payment_type,
                items: []
            }));

            const orderIds = orders.map(order => order.id);

            pool.query(
                `SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id IN (?)`,
                [orderIds],
                (error, itemResults) => {
                    if (error) {
                        console.error('Error retrieving order items:', error);
                        return res.status(500).json({ message: 'Error retrieving order items' });
                    }

                    itemResults.forEach(item => {
                        const order = orders.find(order => order.id === item.order_id);
                        if (order) {
                            order.items.push({
                                product_id: item.product_id,
                                quantity: item.quantity,
                                price: item.price,
                                name: item.name
                            });
                        }
                    });

                    res.json(orders);
                }
            );
        }
    );
});

module.exports = router;
