require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const countriesRoutes = require('./routes/countriesRoutes');

const app = express();

// CORS — allow the Railway frontend and local dev
const allowedOrigins = [
  'https://hopeful-enthusiasm-production-aa4b.up.railway.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/countries', countriesRoutes);

// Start server only when run directly (not when imported in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  // Start server immediately so health check works even if DB is slow
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Connect to MongoDB (non-blocking — server stays up even if DB fails)
  connectDB().catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.warn('Server is running but DB-dependent routes will fail.');
  });
}

module.exports = app;
