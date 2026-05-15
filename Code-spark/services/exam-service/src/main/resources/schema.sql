-- Fix: Add missing `id` column to exam_tags table
-- The ExamTag entity has @Id @GeneratedValue UUID id field,
-- but the existing table was created without this column.
-- Hibernate generates SQL referencing t1_0.id which does not exist.
-- This script is idempotent - safe to run multiple times.

DO $$
BEGIN
    -- Only add id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exam_tags' AND column_name = 'id'
    ) THEN
        ALTER TABLE exam_tags ADD COLUMN id UUID DEFAULT gen_random_uuid();
        ALTER TABLE exam_tags ALTER COLUMN id SET NOT NULL;

        -- Remove existing FK constraint if present (it references exam_id directly)
        -- The new PK will replace it
        ALTER TABLE exam_tags ADD CONSTRAINT pk_exam_tags PRIMARY KEY (id);
    END IF;
END
$$;
