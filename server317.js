const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const cartRoutes = require('./routes/carts');
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);

app.get('/header', (_, res) => {
  res.sendFile(path.join(__dirname, '/public/header.html'));
});

app.get('/modal', (_, res) => {
  res.sendFile(path.join(__dirname, '/public/authmodal.html'));
});

app.get('/footer', (_, res) => {
    res.sendFile(path.join(__dirname, '/public/footer.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
