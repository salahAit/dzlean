= Technical Architecture & Developer Guide

SujetStore is built on a modern, performance-oriented stack carefully selected for speed, simplicity, and developer experience.

== The Tech Stack

#table(
  columns: (1fr, 1fr, 2fr),
  [*Component*], [*Technology*], [*Rationale*],
  [Runtime], [Bun (v1.1+)], [3× faster than Node.js. Built-in bundler, test runner, and native SQLite driver.],
  [Framework], [SvelteKit (Svelte 5)], [Full-stack framework with SSR. No Virtual DOM — minimal client-side overhead.],
  [Database], [SQLite], [Embedded, zero-config, read-optimized. Uses `bun:sqlite` for native performance.],
  [ORM], [Drizzle ORM], [Lightweight, type-safe query builder with full TypeScript support.],
  [CSS], [TailwindCSS v4], [Utility-first CSS with native CSS variable support and zero-config setup.],
  [UI Components], [Shadcn-Svelte], [Accessible, themeable component library with semantic color tokens.],
  [Auth], [Custom (bcryptjs)], [Session-based authentication stored in SQLite. No external dependencies.],
  [Deployment], [Caddy + systemd], [Auto-SSL reverse proxy with process management.],
)

== Architecture Philosophy: The Compact Monolith

Rather than adopting microservices or a headless frontend/backend split, SujetStore uses a *Compact Monolith* architecture:

- *Single Process:* The frontend (Svelte 5) and backend (SvelteKit server routes) run within a single Bun process.
- *File-Based Routing:* Routes are defined by the filesystem structure under `src/routes/`, eliminating the need for manual route configuration.
- *Co-located Data:* Both SQLite databases (`content.db` and `users.db`) live on the same server, accessed via `bun:sqlite` for sub-millisecond query performance.

== Dual-Database Strategy

The system uses two separate SQLite databases to cleanly separate concerns:

=== Content Database (`content.db`) — Read-Only in Production

Stores all educational content: levels, years, subjects, trimesters, documents, quizzes, and quiz questions. This database is generated offline using the seed script and deployed as a single file. Updates are performed by replacing the entire file.

=== Users Database (`users.db`) — Read-Write

Stores admin user accounts, session data, user quiz attempts, ratings, comments, view statistics, and global notifications. WAL mode is enabled for concurrent read/write access:

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
```

This is the only database that requires periodic backup.

== Project Structure

```
sujetstore/
├── src/
│   ├── lib/
│   │   ├── components/           # Shared Svelte components
│   │   │   ├── ConfirmModal.svelte   # Destructive action confirmation
│   │   │   ├── DynamicIcon.svelte    # Runtime icon rendering
│   │   │   └── questions/            # The 8 Interactive Quiz Components
│   │   └── server/
│   │       └── db/               # Drizzle setup & schemas
│   │           ├── index.ts          # DB connection (bun:sqlite)
│   │           ├── schema-content.ts # Content tables (quizzes, docs)
│   │           └── schema.ts         # User interactions & Auth tables
│   ├── routes/
│   │   ├── +page.svelte              # Homepage (level cards + stats)
│   │   ├── stats/                    # Real-time dashboard using viewStats
│   │   ├── quizzes/                  # Interactive Quiz Web Player
│   │   ├── [level]/
│   │   │   ├── +page.svelte          # Year grid for a level
│   │   │   └── [year]/
│   │   │       ├── +page.svelte      # Subject grid for a year
│   │   │       └── [subject]/
│   │   │           ├── +page.svelte  # Document list (tabs + filters)
│   │   │           └── [docSlug]/
│   │   │               └── +page.svelte  # PDF viewer & interaction
│   │   └── admin/
│   │       ├── +page.svelte          # Admin dashboard
│   │       ├── login/                # Authentication
│   │       ├── levels/               # Level management
│   │       ├── years/                # Year management
│   │       ├── subjects/             # Subject management
│   │       ├── documents/            # Document management
│   │       └── quizzes/              # Quiz Admin Builder Forms
│   ├── hooks.server.ts               # Auth middleware
│   └── app.html & app.css            # Root layout & global styles
├── book/                             # This manual (Typst source)
├── data/
│   ├── content.db                    # Educational content
│   └── users.db                      # Admin accounts & sessions
├── scripts/
│   └── seed-education.ts             # Database seeding script
├── deploy.sh                         # Deployment automation
└── ARCHITECTURE.md                   # Foundational architecture doc
```

== Key Design Patterns

=== Reactive Filtering with Svelte 5 Runes

Document filtering uses Svelte 5's `$derived.by()` rune for zero-latency client-side filtering:

```typescript
let filteredDocs = $derived.by(() => {
    let docs = data.documents.filter(
        (d) => d.trimester_id === activeTrimesterTab
            || d.trimester_id === null
    );
    if (filterType !== 'all') docs = docs.filter(...);
    if (filterSource !== 'all') docs = docs.filter(...);
    // ... additional filters
    return docs;
});
```

=== Auto-Tab Selection

On page mount, the system scans trimesters in order and automatically activates the first one with available documents:

```typescript
onMount(() => {
    const firstTrimester = data.trimesters.find(
        (t) => getDocsByTrimester(t.id).length > 0
    );
    if (firstTrimester) activeTrimesterTab = firstTrimester.id;
});
```

=== Local State Persistence

Visited document tracking uses `localStorage` with `Set`-based serialization:

```typescript
const stored = localStorage.getItem('visited_docs');
visitedDocs = new Set(JSON.parse(stored));
// On update:
localStorage.setItem('visited_docs',
    JSON.stringify([...visitedDocs]));
```

== Development Workflow

```bash
# Install dependencies
bun install

# Seed the database with sample data
bun run scripts/seed-education.ts

# Start the development server
bun run dev

# Type-check the project
bunx svelte-check
```
