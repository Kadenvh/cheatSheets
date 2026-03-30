# Supabase Development Prompt

You are working with a Supabase-backed project. Your job is to design, implement, and maintain the Supabase layer — database schema, RLS policies, auth, edge functions, storage, and client integration — with production discipline.

---

## 0. BEFORE ANYTHING ELSE

Understand the existing Supabase setup before making changes.

```
1. Check for supabase/ directory (local dev setup):
   - supabase/config.toml — project configuration
   - supabase/migrations/ — SQL migration files (the source of truth for schema)
   - supabase/functions/ — Edge Functions
   - supabase/seed.sql — seed data
2. Read the most recent 2-3 migration files to understand schema patterns
3. Check how the client is initialized (look for createClient, supabaseUrl, supabaseKey)
4. Identify which Supabase features are in use (auth, storage, realtime, edge functions)
5. Check for existing RLS policies — run: supabase db dump --schema public --data-only=false
   or read migration files that contain CREATE POLICY
```

**If you skip this step, you will break existing patterns or create schema that doesn't fit.**

---

## 1. DETERMINE MODE

**Schema Design** — Creating or modifying database tables, relationships, and constraints.
Your job: Design normalized schema, write migrations, define indexes, set up RLS.

**RLS Policies** — Writing or auditing Row Level Security policies.
Your job: Ensure every table has appropriate policies. Default deny. Test policy logic.

**Auth Integration** — Configuring authentication and authorization flows.
Your job: Set up auth providers, configure redirects, implement client-side auth flows.

**Edge Functions** — Writing Deno-based serverless functions.
Your job: Handle request validation, business logic, response formatting. Follow Supabase conventions.

**Storage** — Configuring buckets, policies, and upload/download flows.
Your job: Create buckets with appropriate policies, implement upload flows, handle file references.

**Client Integration** — Writing frontend code that talks to Supabase.
Your job: Type-safe queries, proper error handling, real-time subscriptions where appropriate.

**Supabase Review** — Auditing existing Supabase setup for security, performance, or correctness.
Your job: Check RLS coverage, query performance, auth configuration, policy correctness.

---

## 2. SCHEMA DESIGN

### Migration Files

Always create migrations via the Supabase CLI or as numbered SQL files:

```bash
# Generate a new migration
supabase migration new <descriptive_name>

# Or manually: supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql
```

### Table Design

```sql
-- Timestamps and soft delete pattern (match existing project convention)
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Always add an index on foreign keys and frequently filtered columns
create index idx_items_user_id on public.items(user_id);
create index idx_items_status on public.items(status);

-- Updated_at trigger (reuse if project already has one)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.items
  for each row execute function public.handle_updated_at();

-- Enable RLS immediately
alter table public.items enable row level security;
```

**Rules:**
- Use `uuid` for primary keys (Supabase convention)
- Always `references auth.users(id)` for user ownership
- Always `on delete cascade` for user-owned data (or `set null` if records should survive)
- Use `check` constraints for enum-like columns instead of separate enum types
- Add indexes on foreign keys and WHERE clause columns
- Enable RLS on every table immediately after creation
- Use `timestamptz` not `timestamp`

### Relationships

```sql
-- One-to-many: FK on the "many" side
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- Many-to-many: junction table
create table public.item_tags (
  item_id uuid references public.items(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (item_id, tag_id)
);
```

---

## 3. ROW LEVEL SECURITY (RLS)

### Default Deny

Every table with RLS enabled denies all access by default. You must explicitly grant access.

### Standard Patterns

```sql
-- Users can read their own rows
create policy "Users can read own items"
  on public.items for select
  using (auth.uid() = user_id);

-- Users can insert their own rows
create policy "Users can create items"
  on public.items for insert
  with check (auth.uid() = user_id);

-- Users can update their own rows
create policy "Users can update own items"
  on public.items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own rows
create policy "Users can delete own items"
  on public.items for delete
  using (auth.uid() = user_id);

-- Public read access (no auth required)
create policy "Anyone can read published items"
  on public.items for select
  using (status = 'active');

-- Admin access via role claim in JWT
create policy "Admins can do anything"
  on public.items for all
  using (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Service role bypass (for server-side operations)
-- Don't create a policy — use supabase.auth.admin or service_role key
```

### RLS Rules

- **Every public table must have RLS enabled.** No exceptions.
- **Default deny.** If a table has no policies, no one can access it (good).
- **`using` = read filter.** Controls which rows can be read/updated/deleted.
- **`with check` = write filter.** Controls which rows can be inserted/updated.
- **`for update` needs both.** `using` filters which rows you can target, `with check` validates the new values.
- **Test policies.** Use `supabase db test` or query as different users to verify.
- **Never use `true` as a policy** unless the table is genuinely public.
- **Avoid `security definer` functions in policies** unless you understand the implications.

### RLS Audit Checklist

For every table, answer:
- [ ] RLS enabled?
- [ ] SELECT policy exists? (Who can read?)
- [ ] INSERT policy exists? (Who can create?)
- [ ] UPDATE policy exists? (Who can modify? What can they change?)
- [ ] DELETE policy exists? (Who can remove?)
- [ ] Policies tested with actual user tokens?
- [ ] No overly permissive policies (`using (true)`)?

---

## 4. AUTH INTEGRATION

### Client-Side Setup

```typescript
import { createClient } from '@supabase/supabase-js';

// Type-safe client (generate types with: supabase gen types typescript)
import type { Database } from './database.types';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,     // or process.env.NEXT_PUBLIC_...
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Auth Flows

```typescript
// Email/password sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
});

// Email/password sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
});

// OAuth sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` },
});

// Sign out
await supabase.auth.signOut();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
});
```

### Auth Rules

- Store `SUPABASE_URL` and `SUPABASE_ANON_KEY` in environment variables, never in code
- Never expose the `service_role` key to the client
- Always handle auth errors — show the user what happened
- Use `onAuthStateChange` for reactive auth state, not polling

---

## 5. EDGE FUNCTIONS

### Structure

```
supabase/functions/
  function-name/
    index.ts        # Entry point (Deno)
```

### Pattern

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  // CORS headers for browser calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Get the user from the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();

    // Business logic here...

    return new Response(JSON.stringify({ data: result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Edge Function Rules

- Always validate the auth header — don't trust the caller
- Always handle CORS for browser-invoked functions
- Parse and validate request body before processing
- Return proper HTTP status codes (400 for bad input, 401 for auth, 500 for server error)
- Use `SUPABASE_SERVICE_ROLE_KEY` only when you need to bypass RLS (admin operations)

---

## 6. CLIENT QUERIES

### Type-Safe Queries

```typescript
// Generate types first: supabase gen types typescript --local > src/database.types.ts

// Select with filtering
const { data, error } = await supabase
  .from('items')
  .select('id, title, status, comments(id, body)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20);

// Insert
const { data, error } = await supabase
  .from('items')
  .insert({ title: 'New item', user_id: user.id })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('items')
  .update({ status: 'archived' })
  .eq('id', itemId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId);
```

### Real-Time Subscriptions

```typescript
// Subscribe to changes on a table
const channel = supabase
  .channel('items-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'items', filter: `user_id=eq.${user.id}` },
    (payload) => {
      // Handle INSERT, UPDATE, DELETE
      console.log('Change:', payload.eventType, payload.new);
    }
  )
  .subscribe();

// Clean up when done
channel.unsubscribe();
```

### Query Rules

- Always handle `error` from every Supabase call
- Use `.select()` after `.insert()` / `.update()` to get the result back
- Use `.single()` when expecting exactly one row
- Use `.maybeSingle()` when the row might not exist
- Regenerate types after schema changes: `supabase gen types typescript`
- Unsubscribe from real-time channels on component unmount

---

## 7. STORAGE

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.png`);

// Download
const { data, error } = await supabase.storage
  .from('documents')
  .download('path/to/file.pdf');
```

### Storage Policies

```sql
-- Users can upload to their own folder
create policy "Users can upload own files"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Users can read their own files
create policy "Users can read own files"
  on storage.objects for select
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public read for public buckets
create policy "Public read"
  on storage.objects for select
  using (bucket_id = 'public-assets');
```

---

## 8. SUPABASE REVIEW

Score each dimension (1-5):

| Dimension | Question |
|-----------|----------|
| **RLS coverage** | Does every table have RLS enabled with appropriate policies? |
| **Auth security** | Are keys in env vars? Service role protected? Redirects configured? |
| **Schema quality** | Proper types, constraints, indexes, foreign keys? |
| **Query safety** | All errors handled? Types generated? No raw SQL from user input? |
| **Migration hygiene** | Changes tracked in migrations? Seed data present? Reproducible? |
| **Performance** | Indexes on filtered columns? N+1 queries avoided? Subscriptions cleaned up? |

### Red Flags

- Tables without RLS enabled
- `using (true)` policies on non-public data
- Service role key exposed to client
- Missing indexes on foreign keys
- No type generation (`database.types.ts` missing or stale)
- Raw user input in `.rpc()` or `.sql()` calls

---

## EXECUTE NOW

1. **Read existing Supabase setup** (Section 0 — never skip this)
2. Determine mode from the request
3. Follow the corresponding section
4. Write migrations for all schema changes (never modify the database directly)
5. Enable RLS and write policies for every new table
6. Handle errors in every client query
7. Regenerate types after schema changes
