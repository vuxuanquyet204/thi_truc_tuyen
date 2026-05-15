const db = require('../db/connection');

async function recalculateRanks() {
  const sql = `
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC, average_score DESC) as new_rank
      FROM leaderboard_entries
    )
    UPDATE leaderboard_entries le
    SET rank = ranked.new_rank, updated_at = CURRENT_TIMESTAMP
    FROM ranked
    WHERE le.id = ranked.id
  `;
  await db.query(sql);
}

module.exports = { recalculateRanks };
