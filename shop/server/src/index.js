require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const addressRoutes = require('./routes/addresses');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/error');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'shop' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`角落小铺 API http://localhost:${port}`);
});
