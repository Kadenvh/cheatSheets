# 3D Printing (Slicer-Loop) — End Goal Plan

**Created:** 2026-03-11 | **Revised:** 2026-03-20 | **Status:** Milestones A-C complete (v0.7.1). D next. On hold pending PE agent-curator.
**Spoke CLAUDE.md:** `2 - 3D_Printing/CLAUDE.md`

---

## Core Constraint

This system is **not** trying to automate visual print-quality judgment.

Ratings are based on **physical appearance**, and that evaluation remains **human-only**. The system optimizes for:

- trustworthy automated **intake**
- low-friction human **rating**
- clean, stable **data semantics**
- useful **analysis**
- eventual **recommendations**, but **not automated appearance scoring**

## Guiding Principle

**Optimize for trustworthy automated intake and extremely low-friction rating capture, then use analytics to validate data health before investing in ML.**

---

## Current State (as of 2026-03-16)

### Working Strengths

- 4 sub-tabs (Dashboard, Inventory, Profiles, Print Log), 28 endpoints, SQLite WAL mode
- Profile sync over SSH implemented (SHA-256 change detection, non-destructive versioning)
- 21 snapshots synced (12 filament, 9 process), 2 filaments, 73 prints (45 finished)
- 9-dimension inline rating form with N/A toggle (UI-only)
- MQTT telemetry ingestion endpoint exists (`POST /telemetry`)
- ML training data export endpoint (`GET /ml/training-data`, 10 slicer params, JSON/CSV)
- Dashboard with stat cards + score trend chart (≥2 points)
- Non-destructive versioning throughout

### Current Weaknesses

- **4 rated prints** out of 73 — rating UX is too high-friction
- **Composite score bug**: partial upsert recalculates from request-only scores, not full stored set (`routes-3d.mjs:760-761`)
- **N/A not persisted**: `naDimensions` Set resets on panel reopen, excluded dimensions sent as absent (stored as null, indistinguishable from "never rated")
- **MQTT not wired**: telemetry endpoint exists but no printer source connected (requires Bambu LAN access code)
- **`telemetry_log`/`print_environment`/`ml_models` tables** exist in schema but are completely unpopulated
- **`filament_used_g`** column exists but always null — no endpoint writes to it
- **No quick-rate mode**: always 9 dimensions displayed
- **No DB-level score validation**: CHECK constraints absent, enforced only at API layer

---

## Product Truths to Preserve

1. **Human appearance judgment is the source of truth for visible print quality**
2. Automation handles intake, context capture, and safe metadata enrichment only
3. No automation silently invents or infers appearance ratings
4. Historical records remain append-friendly, versioned, and non-destructive
5. The system clearly distinguishes: unrated / not applicable / unknown / explicitly rated

---

## Decision Rule for Future Work

When evaluating any feature, ask:

1. Does it improve **trusted intake**?
2. Does it reduce **human rating friction**?
3. Does it improve **semantic clarity** of stored data?
4. Does it improve **appearance-focused analysis**?
5. Does it help future recommendations **without pretending to automate human judgment**?

If the answer is no to most, it is not a priority.

---

## Strategic Priorities

### Priority 0 — Data Correctness Before Expansion

#### 0.1 Fix composite score recalculation

Current behavior (`routes-3d.mjs:760-761`): composite is calculated from only the scores in the current request body. On upsert, if you update 1 of 9 dimensions, composite becomes just that 1 value while the other 8 are preserved in their columns but ignored.

**Required outcome:**
- Composite recalculated from the full stored + updated dimension set
- Omitted fields do not erase meaning
- null and N/A handled consistently

**Implementation:** After upsert, SELECT all 9 score columns + na_flags, compute mean of non-null non-N/A scores.

#### 0.2 Persist N/A state

Current behavior: N/A is a UI-only `Set<string>` in `PrintLogTab.tsx:208`. Toggling N/A excludes the dimension from the POST body. On reopen, the Set resets to empty — previous N/A state is lost. In the DB, N/A dimensions are indistinguishable from "never rated" (both null).

**Required outcome:**
- Reopening a rated print restores exact N/A state
- Analytics can distinguish not-applicable from missing
- Rating semantics become stable

**Implementation:** Add `na_flags INTEGER DEFAULT 0` column to `print_ratings` (bitmask — bit 0 = bonding, bit 1 = stringing, ..., bit 8 = consistency). One column, bit-shift operations, clean schema.

#### 0.3 Clarify rating-state semantics

The system should formally distinguish:
- **unrated** — no `print_ratings` row exists
- **quick-rated** — `rating_type = 'quick'`, only `composite_score` + `would_reprint` + `notes` populated
- **full-rated** — `rating_type = 'full'`, individual dimensions populated, N/A flags set
- **N/A** — dimension intentionally marked not applicable (bit set in `na_flags`)
- **null** — dimension not yet rated (no bit set, no score value)

**Schema addition:**
```sql
ALTER TABLE print_ratings ADD COLUMN rating_type TEXT NOT NULL DEFAULT 'full';
ALTER TABLE print_ratings ADD COLUMN na_flags INTEGER NOT NULL DEFAULT 0;
ALTER TABLE print_ratings ADD COLUMN would_reprint INTEGER; -- 0/1 boolean
```

---

### Priority 1 — Reduce Human Rating Friction

#### 1.1 Quick-rate as default path

**Fields:**
- Overall appearance score (1-10, maps to `composite_score`)
- Would reprint? (yes/no, stored as `would_reprint`)
- Optional note

**UX:** Quick-rate is the default panel. "Expand for detailed rating" link reveals the full 9-dimension form. `rating_type` stored as `'quick'` or `'full'`.

**Target:** Useful rating in under 10 seconds.

#### 1.2 Full diagnostic rating as expansion

The 9-dimension schema remains for deeper inspection and tuning. Accessible via expansion toggle, not forced every time. `rating_type = 'full'`.

#### 1.3 Descriptors and scoring guidance

Each dimension needs visible meaning. Tooltip or inline text:

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 1-3 | Poor | Obvious defects, would not use |
| 4-5 | Below Average | Noticeable issues, functional but flawed |
| 6-7 | Good | Minor imperfections, acceptable quality |
| 8-9 | Excellent | Near-perfect, hard to improve |
| 10 | Perfect | No visible defects |

Per-dimension examples (e.g., "Bonding 3 = layers separating under light stress", "Surface 8 = smooth with barely visible layer lines").

#### 1.4 Improved defaults and prefill

- Existing ratings prefill accurately (current behavior — works)
- N/A state restored from `na_flags` bitmask (Priority 0.2 enables this)
- Previous rating of same filament/material available as reference (not auto-filled — shown as "last time you scored this material X")

---

### Priority 2 — Increase Trusted Automated Intake

#### 2.1 Wire MQTT telemetry

Bambu printers expose MQTT on LAN. Requires the LAN access code from the printer's touchscreen.

**Prerequisite:** Confirm LAN access code is available and MQTT is reachable from Ava's network (printer → Tailscale or direct LAN).

**Required outcome:**
- Printer events populate print_log entries automatically
- Dedup works against real message patterns (5-minute window already implemented)
- Stale jobs handled safely (>24h auto-close to `unknown` already implemented)
- Failures visible and debuggable

**Automation must NOT assign appearance ratings.** It captures lifecycle, machine info, process context, timestamps only.

#### 2.2 Scheduled profile sync

The sync model is already safe enough for unattended execution (SHA-256 comparison, no deletes, version incrementing, error isolation).

**Implementation:** systemd user timer (like `jobspy-scanner.timer`), every 4-6 hours. Manual sync button remains available.

**Observability:** Log sync results to a file or DB table. Failed syncs should be visible in the dashboard (not just toast on manual trigger).

#### 2.3 Automation boundaries

Automation may capture: print lifecycle, machine/source info, process context, timestamps, environmental data.

Automation must **not**: assign appearance ratings, modify existing human ratings, infer quality from telemetry data.

---

### Priority 3 — Preserve Trust in Historical Context

Already strong — non-destructive versioning, soft deletes, append-only ratings. Continue this pattern.

Add observability to automation (Priority 2.2) — if sync or telemetry runs automatically, silent failure is dangerous. Failed syncs should surface in the dashboard, not just disappear.

---

### Priority 4 — Data Health Analytics Before ML

#### 4.1 Rating funnel metrics

- Total finished prints vs rated prints (coverage %)
- Quick vs full rating counts
- Rating latency (time from print completion to rating)
- N/A frequency by dimension
- Ratings by filament/material

#### 4.2 Appearance trend analysis

- Average appearance score over time
- Per-material visible quality trends
- Per-process profile trends
- Score shifts after profile version changes
- Which changes correlate with better/worse visible outcomes

#### 4.3 Confidence tiers in the dataset

- Quick appearance rating (lightweight evidence)
- Full diagnostic rating (rich evidence)
- Unrated print with telemetry only (context only, no label)

Analytics and future ML must know what kind of evidence they're using.

---

### Priority 5 — Recommendation Layer (After Dataset Health Is Proven)

Only after: intake is reliable, rating throughput is meaningfully higher, composite logic is fixed, N/A semantics are stable, dataset size is actually usable (50+ rated prints minimum).

**What it should do:** correlate process/profile combinations with visible outcomes, suggest what's worth trying next, flag historically problematic parameter ranges.

**What it should not do:** fabricate appearance ratings, overstate confidence from small datasets, treat partial labels as ground truth.

---

## Milestone Plan

### Milestone A — Rating Integrity -- COMPLETE (v0.54.0)

Fixed composite score recalculation (full stored state merge). N/A persisted via bitmask. `rating_type`, `would_reprint`, `overall_score` columns added. Rating semantics locked.

### Milestone B — Rating Throughput -- COMPLETE (v0.54.0)

Quick-rate as default (overall slider + would-reprint + notes, <10sec). Full diagnostic expansion (3 primary + 2 optional dimensions). Slider inputs. Print row badges (Q/F type, score, reprint icon).

### Milestone C — Trusted Automation -- COMPLETE (v0.54.0)

MQTT listener deployed as NSSM service on Zoe. Telemetry flowing. Scheduled SSH profile sync (6hr systemd timer). Print data auto-captured.

### Milestone F — Full Slicer Replacement (Next Major Evolution)

Replace BambuStudio entirely. All prints sent through Ava UI.

**Architecture:** Upload STL → Ava slices (OrcaSlicer CLI) → Preview → Send .3mf via MQTT → Monitor → Rate → Analyze

**Components:**
1. OrcaSlicer CLI on Ava (headless Linux install, Bambu P1S support)
2. STL upload endpoint + file storage
3. Slice endpoint (call OrcaSlicer CLI with selected profile, return .3mf)
4. MQTT publish — upgrade listener from receive-only to bidirectional
5. Model viewer (three.js/STL — already in bundle via 3d-force-graph)
6. Print queue / send UI — profile picker + slice + confirm + send
7. Calibration print library — pre-configured test prints with auto-suggested rating dimensions per type
8. G-code layer preview (deferred)

**Estimated effort:** 2-3 focused sessions.

### Milestone D — Data Health Analytics

Rating funnel metrics. Quick vs full analytics. Material/process trends. N/A distribution. Change-to-outcome analysis.

**Done criteria:** Can see whether dataset quality is improving. Can identify friction points. Can identify promising parameters.

**Files touched:** `routes-3d.mjs` (new analytics endpoints), `DashboardTab.tsx` (new visualizations)

### Milestone E — Recommendations

Heuristics or lightweight recommendation layer first. ML only if data volume and quality justify it. Confidence-aware output.

**Done criteria:** Suggestions grounded in enough data to be useful. Recommendations are explainable. System improves decision-making without pretending certainty.

**Blocked until:** 50+ rated prints, stable semantics, proven data health.

---

## Anti-Goals

1. Automating appearance scoring without a validated vision pipeline and ground truth
2. Over-investing in ML before the rating dataset is large and semantically clean
3. Adding schema complexity that doesn't improve trust, throughput, or interpretability
4. Building UX around idealized power-user behavior instead of the real repeated workflow
5. Letting automation mutate records in ways that are hard to inspect or reason about later
6. Dimension weighting systems before data quality is proven (all-equal composite is fine for now)

---

## Implementation Reference

### Schema (Current: 4 core + 3 unpopulated)

| Table | Rows | Status |
|-------|------|--------|
| `filaments` | 2 | Active (PETG-CF, PLA) |
| `profile_snapshots` | 21 | 12 filament + 9 process, 20 synced |
| `print_log` | 73 | 45 finished, 4 failed, 1 unknown |
| `print_ratings` | 4 | All from 2026-03-03 (test entries) |
| `print_environment` | 0 | Schema only |
| `telemetry_log` | 0 | Schema only |
| `ml_models` | 0 | Schema only |

### Rating Dimensions (9)

1. **Bonding** — layer adhesion strength
2. **Stringing** — ooze/whisker artifacts between travel moves
3. **Accuracy** — dimensional tolerance vs designed geometry
4. **Surface** — visible finish quality and layer line appearance
5. **Overhang** — unsupported geometry print quality
6. **Warping** — shrinkage, lifting, or curling from thermal stress
7. **Bridging** — span quality across unsupported gaps
8. **Detail** — fine feature reproduction (small holes, text, edges)
9. **Consistency** — uniformity across the entire print

### ML Training Data Export (10 Slicer Params)

`hot_plate_temp`, `hot_plate_temp_initial_layer`, `nozzle_temperature`, `filament_flow_ratio`, `filament_max_volumetric_speed`, `filament_retraction_length`, `filament_z_hop`, `fan_max_speed`, `overhang_fan_speed`, `pressure_advance`

### Files

| File | Purpose |
|------|---------|
| `ava_hub/server/routes-3d.mjs` | 28 API endpoints |
| `ava_hub/server/db-3d.mjs` | Schema + migrations |
| `ava_hub/server/profile-reader.mjs` | SSH sync from Zoe |
| `ava_hub/src/features/3d-printing/Page.tsx` | Tab shell (lazy-loaded sub-tabs) |
| `ava_hub/src/features/3d-printing/components/PrintLogTab.tsx` | Print list + rating form |
| `ava_hub/src/features/3d-printing/components/DashboardTab.tsx` | Stats + sync + chart |
| `ava_hub/src/features/3d-printing/components/InventoryTab.tsx` | Filament CRUD |
| `ava_hub/src/features/3d-printing/components/ProfilesTab.tsx` | Snapshot management |
| `ava_hub/src/features/3d-printing/types.ts` | Interfaces + SCORE_LABELS |
| `2 - 3D_Printing/CLAUDE.md` | Spoke rules |

### Key Decisions (Preserved)

- SQLite over JSON (relational queries, JOIN, filtering)
- Snapshot-based not delta (BambuStudio profiles are opaque blobs)
- Separate ratings table (optional, nullable dimensions)
- Soft deletes only (audit trail, cost tracking)
- Lime accent, modular router (`routes-3d.mjs` mounted at `/api/3d`)
- N/A as bitmask column (1 column vs 9 booleans)
- Quick-rate vs full stored as `rating_type` column

---

## End State in One Sentence

A trustworthy 3D printing evaluation system that automatically captures operational context, lets me rate physical appearance quickly and accurately as a human, and turns that growing body of evidence into useful, explainable decisions.
