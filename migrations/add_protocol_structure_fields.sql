-- Add new fields to protocols table for enhanced structure
-- These fields support the new problem-solution format

ALTER TABLE protocols 
ADD COLUMN problem_statement text,
ADD COLUMN why_explanation text,
ADD COLUMN solution_approach text,
ADD COLUMN difficulty_level text CHECK (difficulty_level IN ('BEGINNER', 'O''RTA DARAJA', 'YUQORI DARAJA')),
ADD COLUMN level_order integer;

-- Add comment for documentation
COMMENT ON COLUMN protocols.problem_statement IS 'The main problem this protocol solves (Muammo)';
COMMENT ON COLUMN protocols.why_explanation IS 'Explanation of why this problem occurs (Nega bunday bo''ladi?)';
COMMENT ON COLUMN protocols.solution_approach IS 'The solution approach for this protocol (Yechim)';
COMMENT ON COLUMN protocols.difficulty_level IS 'Difficulty level: BEGINNER (1-20), O''RTA DARAJA (21-40), YUQORI DARAJA (41-57)';
COMMENT ON COLUMN protocols.level_order IS 'Order within the difficulty level for proper sorting';