const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(express.json());
app.use(helmet());
app.use(cors());

// Route middlewares
app.use('/api/v1/admin/admins', require('./routes/api/v1/admin/admins'));
app.use('/api/v1/admin/auth', require('./routes/api/v1/admin/auth'));
app.use('/api/v1/admin/discount-codes', require('./routes/api/v1/admin/discount-codes'));
app.use('/api/v1/admin/orders', require('./routes/api/v1/admin/orders'));
app.use('/api/v1/admin/products', require('./routes/api/v1/admin/products'));
app.use('/api/v1/admin/users', require('./routes/api/v1/admin/users'));
app.use('/api/v1/auth', require('./routes/api/v1/auth'));
app.use('/api/v1/products', require('./routes/api/v1/products'));
app.use('/api/v1/orders', require('./routes/api/v1/orders'));

app.listen(PORT, () => {
  console.log(`Server up and running at port ${PORT}`);
});

module.exports = app; // for testing
