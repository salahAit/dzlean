= Future Roadmap & Business Model

The initial release of SujetStore is a foundation — not a final product. The platform is designed with clear expansion vectors that build on the existing architecture.

== Phase 1: Interactive Assessment Engine ✅ (Implemented)

The platform includes a comprehensive interactive exercise engine with:

- *14 Question Types:* MCQ, True/False, Ordering, Drag-and-Drop, Matching, Fill-in-the-Blank, Short Answer, Cloze, Calculated, Sentence Reorder, Hotspot, Drag-to-Image, Matrix, and Essay.
- *Dual Modes:* Practice mode with instant feedback and exam mode with timed assessment.
- *Gamification:* Point-based rewards, 8 achievement badges, and a global leaderboard to drive engagement.
- *Question Bank:* Import/export functionality, preview mode, and category management.
- *Curriculum-Aligned:* Quizzes mapped directly to the competencies defined in the official Ministry of Education curriculum for each subject and trimester.

== Phase 2: Video Solutions & Streaming Architecture

To support deeper understanding — especially for subjects like Physics and Mathematics where static PDFs have limitations — the platform will integrate video walkthroughs using a "pen and paper" recording style that mimics a teacher sitting beside the student.

The streaming infrastructure is designed for cost-efficiency at scale:

#table(
  columns: (1fr, 2fr),
  [*Technology*], [*Purpose*],
  [HLS Protocol], [Adaptive bitrate streaming with 10-second chunks. Instant playback without full download.],
  [AES-128 Encryption], [Per-chunk encryption to prevent unauthorized download via browser extensions.],
  [Backblaze B2], [Cold storage at 1/5th the cost of Amazon S3.],
  [Cloudflare CDN], [Zero egress fees via the Bandwidth Alliance. Edge distribution across North Africa and Europe.],
)

This architecture enables the platform to serve millions of video views while paying only for storage — not bandwidth.

== Phase 3: Centralized Analytics Dashboard

Transitioning from local tracking to a server-side analytics system:

- *Student Progress Profiles:* Visual progress indicators showing completed vs. remaining documents as percentages per subject and trimester.
- *Automated Weakness Detection:* Analysis of quiz errors to identify knowledge gaps and generate targeted review recommendations.
- *Parent Dashboards:* Summary statistics showing study effort and progress by trimester and academic year.

== Business Model: Freemium with Zero Advertising

SujetStore adopts a *Product-Led Growth* (PLG) strategy with an absolute zero-advertising policy. This is a strategic decision to build trust with students and parents, and to maintain a distraction-free study environment.

=== Revenue Structure

#table(
  columns: (1fr, 2fr),
  [*Tier*], [*Details*],
  [Free (Forever)], [Full access to the document archive, PDF viewer, Typst-formatted documents, filters, and local tracking. This tier drives organic traffic.],
  [Premium], [Interactive quizzes, video solutions, and advanced analytics behind a paywall.],
)

=== Pricing Strategy & Unit Economics

The pricing model is designed to be accessible to all socioeconomic segments of Algerian society:

- *Per-Subject:* 100 DZD (~\$0.70 USD) per subject for a full academic year.
- *Full-Level Bundle (Decoy Effect):* 1,000 DZD (~\$7 USD) for all subjects within a level — effectively providing 2 free subjects and driving the majority of users toward the bundle.
- *Market Penetration Target:* With approximately 11 million students in the Algerian educational system, reaching less than 1% (≈100,000 subscribers) at the bundle price would generate 100 million DZD in sustainable annual revenue — sufficient to compensate content creators and fund continuous platform development.

== Deployment & Operations

=== Current Infrastructure

#table(
  columns: (1fr, 2fr),
  [*Component*], [*Specification*],
  [Provider], [Contabo VPS],
  [Resources], [12 vCPU · 48GB RAM · NVMe Storage],
  [Web Server], [Caddy (auto-SSL reverse proxy)],
  [Process Manager], [systemd service unit],
  [Backup Strategy], [Daily SQLite `.backup` of `users.db` with 7-day retention],
)

=== Deployment Commands

```bash
./deploy.sh full    # Initial setup + deployment
./deploy.sh deploy  # Subsequent updates
```

=== Security Layers

#table(
  columns: (1fr, 2fr),
  [*Layer*], [*Implementation*],
  [Transport], [HTTPS enforced via Caddy auto-SSL],
  [Cookies], [`HttpOnly` · `Secure` · `SameSite=Lax`],
  [Passwords], [bcryptjs hashing],
  [SQL Injection], [Prepared statements via Drizzle ORM],
  [Rate Limiting], [Request throttling on `/admin/login` endpoints],
)
