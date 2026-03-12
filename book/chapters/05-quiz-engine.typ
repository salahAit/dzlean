= The Interactive Assessment Engine

SujetStore features an incredibly robust, deeply integrated interactive quiz engine that goes far beyond simple multiple-choice questions. It provides a full-featured Moodle-like assessment environment tailored specifically for the Algerian curriculum, complete with 14 distinct question types, visual interactive editors, and a centralized question bank.

== 1. Admin Quiz Management System

The Quiz Management System is designed to give administrators and educators total control over interactive content.

=== 1.1. Quiz Creation and Configuration
Administrators can create quizzes and bind them to specific `year_subjects` (e.g., "Math - 2nd Year Secondary - Science Stream") and, optionally, specific trimesters. Each quiz can be configured with:
- *Difficulty Levels*: Easy, Medium, Hard (affecting gamification point yields).
- *Monetization/Premium Gating*: Quizzes can be marked as `isPremium`. Free users cannot access premium quizzes, driving subscription conversions.
- *Publishing States*: Quizzes can be kept as drafts (`isPublished = false`) while under construction.
- *Time Limits & Passing Scores*: Formal assessment parameters to simulate real exam conditions.

=== 1.2. Quiz Duplication
To maximize educator productivity, the system features a one-click *Quiz Duplication* mechanism. Clicking "Copy" on a quiz triggers a backend API (`/api/admin/quizzes/[id]/duplicate`) that:
- Deep-clones the quiz metadata.
- Appends "(Copy)" to the title.
- Resets the `isPublished` flag to `false`.
- Duplicates all relation links (`quiz_questions`) while preserving the exact ordering and point values of the original quiz, without duplicating the underlying questions in the bank.

== 2. The Centralized Question Bank

Instead of siloing questions within individual quizzes, SujetStore utilizes a *Centralized Question Bank*. All questions are stored in a single table (`questions`) and mapped to quizzes via a many-to-many relationship table (`quiz_questions`).

=== 2.1. Benefits of the Question Bank
- *Reusability*: A single "Algebra Hard Question" can be linked to a Midterm Quiz, a Final Exam Quiz, and a Premium Practice Quiz simultaneously.
- *Data Integrity*: Updating a question's typo in the bank instantly fixes it across all quizzes that use it.
- *Categorization*: Questions can be organized into `question_categories` (e.g., "Grammar", "Mechanics", "Fractions"), allowing for structured storage.

=== 2.2. Visual Identification
The Question Bank UI is designed for rapid parsing. Each of the 14 question types is represented by a unique, color-coded Lucide icon (e.g., a green check-square for True/False, a purple mapping pin for Hotspots). This visual taxonomy persists across the bank, the builder, and the preview modals.

== 3. The Quiz Builder Interface

The Quiz Builder is a highly interactive, drag-and-drop SPA (Single Page Application) built with Svelte 5. 

=== 3.1. Drag-and-Drop Sequencing
Educators can visually reorder questions within a quiz using HTML5 Drag-and-Drop API. The new order is automatically saved and synchronized with the backend.

=== 3.2. JSON Import Engine
For massive bulk operations, the builder includes a *JSON Import Engine*. Educators can author hundreds of questions in JSON format (usually generated via AI or exported from other systems) and ingest them instantly. The specific API parses the JSON array, validates the schema for the requested question types, inserts them into the Question Bank, and automatically links them to the active quiz.

=== 3.3. Question Bank Modal
Educators can click "Import from Bank" to open a modal that searches the entire database. They can filter by Type, Difficulty, and Search Query, then multi-select questions to inject into the current quiz.

=== 3.4. Live Previewing
Every question can be previewed directly from the Bank or the Builder. The preview modal renders the exact Svelte component that the student will see, and includes a test validation engine (`checkPreviewAnswer()`) to ensure the grading logic works perfectly before publishing.

== 4. The 14 Question Types in Detail

SujetStore supports an unparalleled variety of 14 interactive question types, all serialized seamlessly into a single `question_data` JSONB column.

=== 4.1. Standard & Text Types
1. *Multiple Choice (MCQ)*: Supports single or multiple correct answers. Arabic lettering (أ، ب، ج، د) is automatically applied for localization. Options are randomized at runtime.
2. *True/False*: A streamlined binary choice with bold, recognizable UI cards.
3. *Short Answer*: Free-form text input. Evaluated server-side by checking if the student's string contains a minimum number of required predefined `keywords` (allowing for typographical leniency).
4. *Fill in the Blank*: A paragraph with blank text inputs. Evaluated by strict or case-insensitive string matching array.
5. *Cloze (Dropdowns)*: Similar to Fill-in-the-Blank, but replaces free-text inputs with HTML `<select>` dropdowns defined inline.
6. *Essay/Long Answer*: A rich text or plain text area that tracks word counts. Graded manually, or automatically via keyword density analysis.

=== 4.2. Complex Interactive Types
7. *Matching*: Students draw connections or select corresponding pairs from two columns (e.g., matching a philosopher to their quote).
8. *Ordering*: A vertical stack of draggable items (e.g., historical events). Students drag them to arrange them in chronological order.
9. *Drag & Drop (Categorization)*: Students drag draggable pills into designated drop-zone buckets.
10. *Sentence Reorder*: Designed for language learning. A scrambled list of words that the student must tap/drag sequentially to form a syntactically correct sentence.
11. *Matrix*: A 2D grid where rows are statements and columns are evaluation criteria (e.g., mapping 5 different animals to "Mammal", "Reptile", or "Bird" via radio buttons).

=== 4.3. Advanced Mathematical Types
12. *Calculated*: A highly dynamic mathematical engine. The teacher defines a formula (e.g., `{x} * {y} + 10`). At runtime, the server generates random values for `x` and `y` within defined minimum/maximum boundaries. The student is presented with the unique numbers, and their text input is evaluated against the dynamically computed mathematical result, incorporating an acceptable `tolerance` margin for floating-point errors.

=== 4.4. Visual & Image Editors (The Image Upload API)
To support visual questions, SujetStore includes an internal `/api/admin/upload-image` endpoint that handles secure file uploads (WebP, PNG, JPEG), returns a public path, and integrates directly into the visual editors.

13. *Hotspot*: The teacher uploads an image (e.g., a map of Algeria or a human heart). The admin UI provides a *Visual Click-to-Place Editor*. The teacher clicks directly on the image to define circular "Zones". They then designate one or more zones as the correct answer. The student sees the image and must click the correct physical coordinate.
14. *Drag to Image*: The teacher uploads a background image and defines text "Labels". Using the Visual Editor, the teacher drags the labels to specific coordinates on the image to define their `correctX` and `correctY` positions. The student receives the image with labels clustered at the bottom, and must drag them to their correct physical overlays within a 10px tolerance threshold.

== 5. Grading and Security Architecture
All evaluation logic runs *Server-Side*. When a student clicks "Check Answer" or "Submit Exam":
1. Only the student's payload (e.g., `selectedZone: 2` or `order: [3, 1, 2]`) is dispatched to the server.
2. The server loads the true schema from the database (which was never sent to the client, preventing DevTools cheating).
3. The server runs the specific evaluator for the question type.
4. The server responds with `isCorrect: true/false`, the points earned, and optionally the `correctAnswer` payload so the UI can highlight mistakes in red and correct answers in green.
