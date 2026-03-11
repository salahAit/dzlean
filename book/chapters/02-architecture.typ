= System Architecture & Tech Stack

SujetStore is built on a modern, performance-oriented stack carefully selected for speed, simplicity, and developer experience.

== The Tech Stack

#table(
  columns: (1fr, 1fr, 2fr),
  [*Component*], [*Technology*], [*Rationale*],
  [Runtime], [Bun (v1.1+)], [3× faster than Node.js. Built-in bundler, test runner, and native SQLite driver.],
  [Framework], [SvelteKit (Svelte 5)], [Full-stack framework with SSR. Powerful reactive runes (`$state`, `$derived`). Minimal client-side overhead.],
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

=== Content Database (`content.db`) — Read-Intensive

Stores all educational content: levels, years, subjects, trimesters, documents, quizzes, and quiz questions. This database is generated offline using the seed script and deployed as a single file. Updates are often performed by replacing the entire file or making bulk inserts through the Admin panel.

=== Users Database (`users.db`) — Read-Write

Stores admin user accounts, session data, user gamification data (points, badges), quiz attempts, ratings, comments, and global notifications. WAL mode is enabled for concurrent read/write access:

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
```

This ensures that high-volume writes (like tracking points and attempts) never block reads on the content database.

== The Exam Paper Coding System

A core feature of SujetStore is its adherence to the *Algerian Exam Coding System*. This handles the complex relationship between educational streams (شعب) and subject papers.

=== The Golden Rule
The system follows a strict principle: _"If two streams take the exact same exam paper, they share a single Exam Code."_

- *Shared Papers:* If "Physics" for the _Experimental Sciences_ stream is identical to "Physics" for the _Math_ stream, both map to a single `PHY-SCI` code.
- *Unique Papers:* If "Math" for _Math_ stream is different from "Math" for _Literary_ stream, they receive separate `MAT-MTM` and `MAT-LIT` codes respectively.

=== Relational Mapping
The SQLite schema implements this through three dedicated tables:
- `streams`: Defines secondary education tracks (e.g., GEN, SE, MATH).
- `level_streams`: Maps specific years (e.g., 2AS, 3AS) to available streams.
- `stream_subjects`: Maps streams to their respective exam-code subjects and trimesters, ensuring students only see relevant materials for their track.


== Development Workflow

```bash
# Install dependencies using Bun
bun install

# Seed the databases with the Algerian default tree (Primary, Middle, Secondary)
bun run scripts/seed-education.ts
bun run scripts/seed-algerian-questions.ts

# Start the development server
bun run dev

# Type-check the project
bunx svelte-check
```
