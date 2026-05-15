const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const rankingService = require('../services/rankingService');
const { optionalVerifyToken, AppException, ApiResponse } = require('common-node-library');

router.get('/', optionalVerifyToken, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const country = req.query.country;
    const sortBy = req.query.sortBy || 'rank';

    let orderColumn = 'rank';
    if (sortBy === 'score') orderColumn = 'total_score';
    else if (sortBy === 'username') orderColumn = 'username';
    else if (sortBy === 'contests') orderColumn = 'contests_completed';

    let whereClause = '';
    const params = [];
    if (country) {
      whereClause = 'WHERE country_code = $1';
      params.push(country.toUpperCase());
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM leaderboard_entries ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT id, user_id, username, country_code, total_score, algorithms,
             contests_participated, contests_completed, average_score,
             best_rank, rank, avatar_url, created_at, updated_at
      FROM leaderboard_entries
      ${whereClause}
      ORDER BY ${orderColumn} ASC NULLS LAST
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json(ApiResponse.success({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }));
  } catch (err) {
    console.error('[Leaderboard] GET / error:', err.message);
    next(err);
  }
});

router.get('/top', optionalVerifyToken, async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await db.query(
      `SELECT id, user_id, username, country_code, total_score, algorithms,
              contests_participated, contests_completed, average_score,
              best_rank, rank, avatar_url, avatar_url as profile_url
       FROM leaderboard_entries
       ORDER BY rank ASC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    res.json(ApiResponse.success(result.rows));
  } catch (err) {
    console.error('[Leaderboard] GET /top error:', err.message);
    next(err);
  }
});

router.get('/:userId', optionalVerifyToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      `SELECT id, user_id, username, country_code, total_score, algorithms,
              contests_participated, contests_completed, average_score,
              best_rank, rank, avatar_url, created_at, updated_at
       FROM leaderboard_entries
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new AppException('User not found in leaderboard', 404));
    }

    res.json(ApiResponse.success(result.rows[0]));
  } catch (err) {
    console.error('[Leaderboard] GET /:userId error:', err.message);
    next(err);
  }
});

router.post('/submit', async (req, res, next) => {
  try {
    const { userId, username, countryCode, score, algorithmScores, contestId, contestName } = req.body;

    if (!userId || !username || score === undefined) {
      return next(new AppException('userId, username, and score are required', 400));
    }

    const algScores = typeof algorithmScores === 'object' ? algorithmScores : {};
    const country = (countryCode || 'USA').toUpperCase();

    const existing = await db.query(
      'SELECT * FROM leaderboard_entries WHERE user_id = $1',
      [userId]
    );

    let entry;
    if (existing.rows.length > 0) {
      entry = existing.rows[0];
      const newTotal = parseFloat(entry.total_score) + parseFloat(score);
      const newParticipated = entry.contests_participated + 1;
      const newCompleted = entry.contests_completed + 1;
      const newAvg = newTotal / newCompleted;
      const newAlgs = { ...entry.algorithms, ...algScores };

      await db.query(
        `UPDATE leaderboard_entries
         SET total_score = $1, algorithms = $2, contests_participated = $3,
             contests_completed = $4, average_score = $5, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [newTotal, JSON.stringify(newAlgs), newParticipated, newCompleted, newAvg, userId]
      );
    } else {
      const result = await db.query(
        `INSERT INTO leaderboard_entries
           (user_id, username, country_code, total_score, algorithms,
            contests_participated, contests_completed, average_score)
         VALUES ($1, $2, $3, $4, $5, 1, 1, $4)
         RETURNING *`,
        [userId, username, country, score, JSON.stringify(algScores)]
      );
      entry = result.rows[0];
    }

    await rankingService.recalculateRanks();

    const updated = await db.query(
      'SELECT * FROM leaderboard_entries WHERE user_id = $1',
      [userId]
    );

    res.status(201).json(ApiResponse.success(updated.rows[0], 'Score submitted successfully'));
  } catch (err) {
    console.error('[Leaderboard] POST /submit error:', err.message);
    next(err);
  }
});

router.put('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, countryCode, avatarUrl } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (username) { fields.push(`username = $${idx++}`); values.push(username); }
    if (countryCode) { fields.push(`country_code = $${idx++}`); values.push(countryCode.toUpperCase()); }
    if (avatarUrl !== undefined) { fields.push(`avatar_url = $${idx++}`); values.push(avatarUrl); }

    if (fields.length === 0) {
      return next(new AppException('No fields to update', 400));
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    const result = await db.query(
      `UPDATE leaderboard_entries SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return next(new AppException('User not found', 404));
    }

    res.json(ApiResponse.success(result.rows[0]));
  } catch (err) {
    console.error('[Leaderboard] PUT /:userId error:', err.message);
    next(err);
  }
});

module.exports = router;
