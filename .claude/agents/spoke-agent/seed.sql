-- Echelon Spoke Agent — brain.db seed
-- Run once after DAL deployment: sqlite3 .ava/brain.db < seed.sql
-- OR use DAL CLI for each entry (see README.md)
--
-- Replace {placeholders} with domain-specific values.
-- Delete example rows and add domain-specific entries.

-- Required identity (every spoke needs these)
INSERT OR REPLACE INTO identity (key, value)
VALUES
  ('project.name', '{DomainName}'),
  ('project.version', '{0.1.0}'),
  ('project.vision', '{One sentence: what this system does and why}'),
  ('tech.stack', '{e.g., Node.js, Express 5, React 19, SQLite}'),
  ('tech.build', '{e.g., npm run build}');

-- Required architecture
INSERT OR REPLACE INTO architecture (key, value, scope)
VALUES
  ('echelon.role', 'spoke', 'project'),
  ('echelon.hub', '{path to hub brain.db, e.g., Ava_Main/.ava/brain.db}', 'ecosystem');

-- Initial notes (seed the task queue)
-- Categories: improvement, issue, bug, idea, handoff, feedback
INSERT INTO notes (id, category, text)
VALUES
  ('seed_001', 'improvement', '{First task: describe initial setup or verification work}');
