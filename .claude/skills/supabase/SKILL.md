---
name: supabase
description: "Supabase development: schema design, RLS policies, auth, edge functions, storage, and client integration"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash
  - Glob
  - Grep
---

# Supabase — Schema, RLS, Auth, Functions & Client Integration

Design, implement, and maintain the Supabase layer with production discipline.

## Instructions

Follow the protocol below. For the full detailed version, read `.prompts/supabase.md`.

### Protocol:
   - **Step 0 (mandatory)** → Read existing migrations, RLS policies, client setup, and config BEFORE changing anything
   - **Schema Design** → Migrations → tables/indexes/constraints → RLS enabled immediately
   - **RLS Policies** → Default deny → per-operation policies → test with real tokens
   - **Auth** → Environment variables → auth flows → state change listeners
   - **Edge Functions** → Auth validation → CORS → business logic → error handling
   - **Client Integration** → Type-safe queries → error handling → real-time cleanup
   - **Storage** → Bucket policies → scoped upload paths → public URL handling
   - **Supabase Review** → Score 6 dimensions → flag red flags → prioritized fixes

## Key Rules

- **RLS on every table.** Enable immediately after creation. Default deny. No exceptions.
- **Migrations are truth.** Never modify the database directly. All changes go through migration files.
- **Never expose service_role key.** Client gets anon key only. Service role is server-side only.
- **Handle every error.** Every Supabase call can fail. Handle `error` before using `data`.
- **Regenerate types.** After any schema change: `supabase gen types typescript`.

## Full Protocol

Detailed steps:

1. **Read existing setup.** Check supabase/ directory, read recent migrations, find client initialization, identify which features are in use.
2. **Schema:** Use uuid PKs, timestamptz, check constraints for enums, cascade deletes on user-owned data. Index foreign keys.
3. **RLS:** Write SELECT/INSERT/UPDATE/DELETE policies per table. `using` for read filter, `with check` for write filter. UPDATE needs both. Never `using (true)` on non-public data.
4. **Auth:** Store URL and anon key in env vars. Use `onAuthStateChange` for reactive state. Handle OAuth redirects properly.
5. **Edge Functions:** Validate auth header, handle CORS, parse request body, return proper status codes. Use service role only for admin operations.
6. **Client:** Type-safe queries with generated types. `.select()` after insert/update. `.single()` for one row. Unsubscribe real-time channels on cleanup.
7. **Review:** Check RLS coverage, auth security, schema quality, query safety, migration hygiene, performance. Flag tables without RLS, exposed keys, missing indexes.
