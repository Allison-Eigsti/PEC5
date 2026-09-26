require('./config/env');
const app = require('./app');
const { connectToDatabase } = require('./config/db');

// 1. Create a middleware that ensures the DB is connected before handling the request
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({ error: 'Internal Server Error (Database)' });
  }
});


module.exports = app;
