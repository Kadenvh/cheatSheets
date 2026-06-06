---
type: architecture
project: cheatsheets
status: active
date: 2026-03-30
tags: [vision, north-star, learning-system]
---

# CheatSheets Knowledge System — End Goal

## North Star

A personal learning system where Kaden authors high-density cheat sheet notes in Obsidian, the system schedules spaced reviews via FSRS to build durable memory, AI tutoring guides understanding, and semantic search makes the entire knowledge base instantly accessible.

## Three Layers

| Layer | Tool | Purpose |
|-------|------|---------|
| **Content** | Obsidian vault | Author, organize, and link learning material |
| **Scheduling** | brain.db (FSRS) | Track mastery, schedule reviews, build prerequisite graph |
| **Search** | ChromaDB | Semantic retrieval, RAG Q&A, concept similarity |

## Success Criteria

- New concepts authored directly in Obsidian without process overhead
- Vault sync reliably updates brain.db + ChromaDB with correct prerequisite edges
- Learn/Review experience reflects actual mastered/due state
- Compass suggestions are relevant and actionable
- Streak visualization supports sustained daily review habit
- Reference material (PDFs, manuals) searchable alongside learning content

## What "Done" Looks Like

- 100+ vault concepts across all categories
- Daily review streak active (5-10 reviews/day)
- 50%+ concepts at familiar or above mastery
- Hardware learning track with Arduino/Orin Nano reference material ingested
- Q&A returns useful answers for any topic in the knowledge base

## Content Tracks

1. **Meta-learning** — How learning works (OODA, PDCA, spaced repetition, active recall)
2. **Software** — Python, TypeScript, React, Docker, Linux, Git
3. **Data science** — Statistics, pandas, visualization, ML fundamentals
4. **Hardware** — Arduino Mega, Jetson Orin Nano, servos, sensors, protocols
5. **Automation** — CI/CD, shell scripting, cron, Makefiles

## Architecture Evolution

- **Current:** Ava_Main Express server hosts learning API routes, CheatSheets owns vault + brain.db
- **Future:** PDF reference ingestion (`type: reference`), standalone vault-sync in DAL, Compass quality pass, streak visualization in Obsidian
