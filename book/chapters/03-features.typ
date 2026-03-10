= Features & User Experience

The platform was designed with the principle that _"simplicity creates effectiveness."_ Every feature serves a clear purpose: helping students find, filter, and study documents as quickly as possible.

== Student-Facing Interface

=== Homepage & Navigation Hierarchy

The homepage presents the three educational levels of the Algerian system as prominent, interactive cards:

- *Primary* — Grades 1 through 5
- *Middle School* — Grades 1AM through 4AM
- *Secondary* — Grades 1AS through 3AS (across all streams)

Each card displays live statistics (number of years and documents available) and links directly to the year selection page. A real-time stats bar shows the total count of documents, exams, quizzes, and subjects across the entire platform.

A global breadcrumb navigation system (`Level / Year / Subject`) ensures the student always knows their location and can navigate back to any level with a single click.

#figure(
  image("../images/01-homepage.png", width: 90%),
  caption: [The SujetStore homepage with level cards, stats bar, and feature highlights]
)

=== Mobile-First Responsive Design

The entire interface is built with a *mobile-first* approach, recognizing that the majority of Algerian students access educational content from smartphones. Key responsive behaviors include:

- Filter controls stack vertically on small screens and align horizontally on desktop.
- Tab navigation scrolls horizontally when screen width is constrained.
- Document rows adapt their layout for optimal touch interaction.
- All interactive elements meet minimum touch target sizes (44×44px).

=== Dark & Light Mode with Shadcn-Svelte Theming

The platform implements a complete dual-theme system using `Shadcn-Svelte` semantic color tokens. Every component — from buttons and dropdowns to cards and toggle switches — automatically adapts to the user's preferred color scheme.

Key tokens used throughout the interface:
- `bg-background` / `text-foreground` — Base page colors
- `bg-card` / `text-card-foreground` — Elevated surface containers
- `bg-muted` / `text-muted-foreground` — Subdued backgrounds and secondary text
- `bg-primary` / `text-primary-foreground` — Active and accent elements
- `bg-accent` / `text-accent-foreground` — Hover and interactive states

This approach guarantees that *no hardcoded colors* appear in the codebase, ensuring perfect contrast in both light and dark modes.

=== Native RTL & Arabic Typography

The design is built from the ground up for Right-to-Left (RTL) text direction, with the `Cairo` font applied globally for optimal Arabic readability. Flex layouts, padding, margins, and icon positions are all RTL-aware.

== Trimester Tabs — Segmented Control

The subject page organizes documents using a *Segmented Control* interface — a horizontal tab bar centered on the page with three segments: _Term 1_, _Term 2_, and _Term 3_.

#figure(
  image("../images/05-subject.png", width: 90%),
  caption: [Subject page showing Segmented Control tabs, contextual filter bar, and document list]
)

Implementation details:
- Built with a `bg-muted` container and `bg-background shadow-sm` for the active segment, following the standard Shadcn UI `TabsList` / `TabsTrigger` pattern.
- *Smart Auto-Selection:* On page load, the system automatically selects the first trimester that contains documents, preventing the user from landing on an empty tab.
- Documents with `trimester_id = null` (e.g., lessons and summaries) are displayed across *all* trimester tabs, ensuring they are always accessible regardless of the active tab.

== Contextual Filter Bar

Directly below the trimester tabs, a horizontal Filter Bar allows fine-grained filtering of documents:

#table(
  columns: (1fr, 1fr, 2fr),
  [*Filter*], [*Type*], [*Options*],
  [Document Type], [Dropdown], [All · Quiz · Exam · Lesson/Summary],
  [Source], [Dropdown], [All · Official · Proposed],
  [Academic Year], [Dropdown], [All · 2024 · 2023 · 2022],
  [Has Solution], [Toggle Switch], [On/Off — filters to documents with corrections only],
)

All filtering is performed *client-side and reactively* using Svelte 5's `$derived.by()` rune, providing instant results with zero network requests. When no documents match the current filter combination, a clear empty-state message with a filter icon is displayed.

The filter bar uses Shadcn-compatible classes (`bg-card`, `bg-background`, `text-foreground`) and adapts its layout based on screen size:
- *Mobile:* Controls stack vertically, each taking full width
- *Desktop:* Controls align horizontally in a single row

== Embedded PDF Document Viewer

When a student clicks a document row, a fullscreen modal opens with an embedded PDF viewer featuring:

- *Tabbed Navigation:* Separate "Subject" and "Solution" tabs for switching between the exam paper and its model answer.
- *Direct Download:* A download button (📥) for saving the PDF locally.
- *Background Printing:* A print button (🖨️) that triggers printing without opening disruptive browser dialogs.
- *Visited Tracking:* Documents the student has already opened are marked with a checkmark (✓) and a visual color change on the button, powered by `localStorage`.

#figure(
  image("../images/06-document-viewer.png", width: 90%),
  caption: [Fullscreen PDF viewer with Subject/Solution tab switching, download, and print controls]
)

== Smart Local Tracking

To respect student privacy while still providing useful study progress features, the platform implements a *localStorage-based tracking system*:

- Documents are marked as "viewed" when opened, and this state persists across browser sessions.
- No server-side tracking, no user accounts required, and no data is transmitted to external services.
- Subject and Solution buttons visually reflect their visited state, enabling students to quickly identify which materials they have already reviewed.

== Interactive Document Features & Social Proof

Beyond static documents, SujetStore engages students with social and interactive features:

- *Star Ratings:* Students can rate documents from 1 to 5 stars. High-rated documents are highlighted.
- *Comments Section:* A seamless discussion area allows students to leave feedback or ask questions directly underneath any exam or lesson.
- *Notifications Bell:* An intuitive navigation bell alerts users to new platform announcements or newly published high-value documents.
- *Live View & Download Stats:* Every document tracks interaction velocity, helping surface the most popular and useful materials.

== Interactive Quiz Engine

A core monetizable and highly engaging feature of SujetStore is its dynamic Quiz Engine. Rather than just reading PDFs, students can test their knowledge interactively.

=== Eight Powerful Question Types

The platform supports a diverse array of question formats built natively in Svelte 5:
1. *Multiple Choice (MCQ):* Single or multi-select options.
2. *True/False:* Binary decision making.
3. *Ordering:* HTML5 drag-and-drop to sequence historical events or logical steps.
4. *Drag & Drop:* Categorizing items into predefined matching zones.
5. *Matching:* Connecting pairs between two columns.
6. *Fill in the Blank:* Replacing `___` gaps with precise text.
7. *Short Answer:* Open text evaluated against a list of acceptable keywords.
8. *Cloze Dropdown:* Selecting inline missing words from a dropdown menu.

=== Real-time Feedback & Scoring

The quiz player provides an immersive experience:
- Live progress indicators and a countdown timer.
- Immediate evaluation upon submission.
- A beautiful, animated circular score dashboard.
- Post-quiz review mode, showing explanations for correct and incorrect answers.

== Admin Content Management System (CMS)

The platform includes a full-featured admin panel protected by session-based authentication using `bcryptjs` password hashing.

#figure(
  image("../images/02-admin-dashboard.png", width: 90%),
  caption: [Admin dashboard with statistics, quick actions, and sidebar navigation]
)

=== Admin Capabilities

- *Hierarchical CRUD:* Full create, read, update, and delete operations for educational levels, academic years, subjects, and documents.
- *Modal-Based Editing:* All add/edit operations use floating modals for fast interaction without full page navigation.
- *Confirmation Dialogs:* Destructive operations (e.g., deleting a document) require explicit confirmation through a custom `ConfirmModal` component, preventing accidental data loss.
- *File Upload & Linking:* Documents can be uploaded directly or linked via URL, with preview capabilities before publishing.
- *Mobile-Friendly Dashboard:* The admin interface is fully responsive, allowing content management from any device.

#figure(
  image("../images/03-admin-documents.png", width: 90%),
  caption: [Document management table with type badges, file links, and CRUD actions]
)

#figure(
  image("../images/04-admin-modal.png", width: 90%),
  caption: [Floating modal for adding a new document with form fields and dropdowns]
)

#figure(
  image("../images/07-admin-levels.png", width: 90%),
  caption: [Educational levels management with icons, slugs, and edit/delete actions]
)

=== Quiz Admin Builder

Creating interactive educational content is complex, but the SubjectStore Admin Panel makes it intuitive:

- *Drag-and-Drop Question Builder:* Teachers and admins can reorder questions visually.
- *Specialized Question Sub-forms:* Each of the 8 question types has a dedicated, tailored form (e.g., adding pairs for Matching, or defining correct sequences for Ordering).
- *Quiz Metadata:* Set time limits, required passing scores, and toggle premium access gates.
