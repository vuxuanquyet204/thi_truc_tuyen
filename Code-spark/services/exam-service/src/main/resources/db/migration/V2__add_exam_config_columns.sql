-- ============================================================
-- Migration: Add missing columns to exams table
-- Run this against the exam_db database (PostgreSQL)
-- Connection: postgresql://postgres:password@localhost:5433/exam_db
-- ============================================================

-- 1. Add the new boolean columns (default FALSE for existing rows)
ALTER TABLE exams ADD COLUMN IF NOT EXISTS randomize_question_order BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS randomize_option_order BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS show_correct_answers BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS partial_scoring_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'exams'
  AND column_name IN (
    'randomize_question_order',
    'randomize_option_order',
    'show_correct_answers',
    'partial_scoring_enabled'
  )
ORDER BY column_name;

-- Expected output after migration:
-- | column_name               | data_type | column_default | is_nullable |
-- |---------------------------|-----------|----------------|------------|
-- | partial_scoring_enabled   | boolean   | false          | NOT NULL   |
-- | randomize_option_order    | boolean   | false          | NOT NULL   |
-- | randomize_question_order  | boolean   | false          | NOT NULL   |
-- | show_correct_answers      | boolean   | true           | NOT NULL   |

-- 3. (Optional) List all columns in exams table to confirm full schema
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'exams'
ORDER BY ordinal_position;
