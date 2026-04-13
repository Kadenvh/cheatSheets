# Resilience — External Service Fallback

**Created:** 2026-04-13 (Session 15) | **Status:** Curating | **Updated:** 2026-04-13
**Depends on:** —

## Context

Several API endpoints depend on external services (ChromaDB on `:8001`, optionally Ava_Main hub). When those services are unreachable or slow, the endpoints currently **hang** instead of degrading gracefully. The Learn/Review UI surfaces then spin indefinitely, masking the fact that the learning system itself is still usable for scheduling-only flows.

Tracked via brain.db note `uyyt9zk6n` (opened Session 14).

## Affected Endpoints (known)

- `GET /api/learning/status` — hangs when ChromaDB down
- `GET /api/system/health` — hangs when ChromaDB down
- Likely others that perform ChromaDB or hub calls without timeouts

## What I'm NOT Doing

- Not building a service-mesh or circuit-breaker framework
- Not replacing ChromaDB or changing the search layer
- Not introducing a new observability stack — use existing logs + Health tab

## Known Items

- [ ] Audit `server/routes/` for calls to ChromaDB/hub without explicit timeouts
- [ ] Add per-call timeout (e.g. 2s for health probes, 5s for user-facing queries) using `AbortController`
- [ ] Define degraded-mode response shape so the UI can render "search unavailable" without blocking scheduling
- [ ] Update Health tab to display per-dependency status (ChromaDB up/down, hub up/down) instead of a single rolled-up hang
- [ ] Decide whether vault-sync should be allowed to run in degraded mode (ChromaDB down = no embeddings, but brain.db concept + prereq updates could still proceed)

## Open Questions

- Fail-closed (surface the error) vs fail-open (return partial data) for Q&A search when ChromaDB is down?
- Should ChromaDB auto-restart be part of the server-startup check, or stay manual?

## Sessions Contributing

| Session | Contribution |
|---------|-------------|
| 14 (2026-04-06) | Issue surfaced during curriculum e2e test — endpoint hang noted |
| 15 (2026-04-13) | Plan created |

## Cross-References

- brain.db note `uyyt9zk6n`
- `plans/learning-system.md` — Review/Learn surfaces consume these endpoints
