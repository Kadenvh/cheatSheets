# Learning System Restoration Plan

**Created:** 2026-03-30
**Status:** In Progress
**Session:** 3 (first real restoration work)

## Problem

The CheatSheets project moved from `Ava_Main/0 - cheatSheets/` to standalone `/home/ava/cheatSheets/` but the learning pipeline was never migrated. The vault-sync Express route was archived, pointed at the wrong database and wrong path. Result: 61 vault notes, 0 brain.db concepts.

## Solution

1. Fix all stale documentation and path references (DONE)
2. Migrate learning data from Ava_Main brain.db → CheatSheets brain.db
3. Restore archived learning backend (45 endpoints, FSRS engine) with DB routing fix
4. Restore Learn tab UI (6 components recovered from git)
5. Validate end-to-end pipeline

## Architecture Decision

**Restore in Ava_Main (Path A):** The learning code (2663 LOC) is complete and tested. CheatSheets has no server. Fix the DB routing (use SPOKE_DB_MAP) and vault path, then un-archive.

## Content Tracks (post-restoration)

1. Learning methods (spaced-repetition, active-recall, deliberate-practice, etc.)
2. Existing meta-learning frameworks (PDCA → single-loop → OODA → double-loop)
3. Hardware fundamentals (Arduino Mega, Jetson Orin Nano, servos, sensors)
4. PDF reference ingestion for instruction manuals (`type: reference` in ChromaDB)

## Full Plan

See `/home/ava/.claude/plans/sparkling-chasing-seahorse.md` for the complete phased plan with verification steps.
