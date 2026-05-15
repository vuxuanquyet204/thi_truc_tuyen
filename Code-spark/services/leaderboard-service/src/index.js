const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./db/connection');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { globalExceptionHandler, ApiResponse } = require('common-node-library');

const app = express();
const PORT = process.env.PORT || 9010;

// Trust the first proxy (API Gateway)
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.error('Too many requests, please try again later.'),
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'leaderboard-service', timestamp: new Date().toISOString() });
});

app.use('/api/leaderboard', leaderboardRoutes);

app.use(globalExceptionHandler);

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('[Leaderboard] Database connected successfully');

    const schemaSQL = `
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        country_code VARCHAR(3) DEFAULT 'USA',
        total_score DECIMAL(12,2) DEFAULT 0,
        algorithms JSONB DEFAULT '{}',
        contests_participated INTEGER DEFAULT 0,
        contests_completed INTEGER DEFAULT 0,
        average_score DECIMAL(8,2) DEFAULT 0,
        best_rank INTEGER DEFAULT NULL,
        rank INTEGER DEFAULT NULL,
        avatar_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(total_score DESC);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_leaderboard_country ON leaderboard_entries(country_code);
    `;
    await db.query(schemaSQL);
    console.log('[Leaderboard] Schema initialized');

    app.listen(PORT, () => {
      console.log(`[Leaderboard] Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Leaderboard] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
