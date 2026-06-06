---
archive_reason: superseded
reviewed_at: 2026-06-06T05:35:15.115Z
why_kept: "Historical record of the pre-Cortex era's three concurrent strategies; primary evidence for the viability post-mortem (Session 17 audit)."
superseded_by: "SPEC.md + plans/loop-1-ingestion.md"
extracted_to:
  - kind: plan
    target: "plans/loop-1-ingestion.md"
  - kind: spec
    target: "SPEC.md §4 (entity catalog), §10 (supersessions)"
  - kind: exploration
    target: "exploration/resource-landscape.md §1 (internal incumbents)"
  - kind: decision
    target: "brain.db:decisions:#14 (Cortex rebrand)"
  - kind: decision
    target: "brain.db:decisions:#15 (doc topology)"
  - kind: decision
    target: "brain.db:decisions:#16 (SPEC adoption + Loop 1)"
---

# cortex-rebrand — Archive Receipt

## Scope

The following plans were archived during the 2026-06-06 Cortex rebrand (Session 17), superseded by `SPEC.md` and consolidated into `plans/loop-1-ingestion.md`:

- `plans/learning-system.md`
- `plans/edx-courses.md`
- `plans/resilience.md`

## Why Archived (Not Deleted)

The Session 17 audit (9 territories) found these plans described aspirational state in the present tense ("Active, Phase 3") while the runtime 404'd every documented flow. They are kept as the primary evidence base for the viability post-mortem and as the historical record of the pre-Cortex strategy era.

## Extraction Complete

- **learning-system.md**: substrate inventory absorbed into the audit and `SPEC.md` §4 Tier 1/4; the vault+FSRS+search architecture is re-tagged honestly (STALLED/SPECULATIVE). The stale count claims (73 concepts / 152 edges / 338 docs) were disproven by the audit (4 notes, 0 edges, empty collection) and are extracted as post-mortem evidence, not state.
- **edx-courses.md**: the Course/Section/Lecture/Test design survives as `SPEC.md` §4 Tier 4/5 with revival trigger "first real course content authored". Phases 2-5 become named triggers, not active work. ColumbiaX scaffold remains in `vault/Courses/` and `learning.db` untouched.
- **resilience.md**: 0/5 items were ever done. Its real finding (the `/api/learning/status` + `/api/system/health` hang when the search backend is down) is superseded by the audit's larger finding that those routes do not exist on the live hub. Fallback-design value: deferred until Cortex's own backend exists (Loop 2+).

## Surviving Items

- Loop 1 work items: `plans/loop-1-ingestion.md` (the single active plan)
- Tier 4/5 revival triggers: `SPEC.md` §4
- Tutor identity-pack consolidation: `SPEC.md` §11 open question, this session
- All architecture verdicts: `exploration/resource-landscape.md`
