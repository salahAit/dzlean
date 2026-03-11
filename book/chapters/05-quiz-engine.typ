= The Interactive Assessment Engine

To complement the static document archive, SujetStore features a fully functional, interactive quiz engine that allows students to test their knowledge and receive instant feedback.

== Architecture of the Quiz Engine

The assessment engine is deeply integrated with the platform's core architecture:

- *Type-Safe JSON Storage:* All quiz questions are stored in a single `questions` table. Instead of fragmented schemas per question type, SujetStore uses a single `question_data` column configured as a custom JSON type in Drizzle ORM. This enables seamless storage of nested objects (options, coordinates, formulas) with automatic JSON serialization and deserialization at the database driver level.
- *Dual Modes:* Students can take a quiz in "Practice Mode" (instant feedback per question) or "Exam Mode" (timed, all answers submitted at once).

== The 14 Supported Question Types

The platform supports a comprehensive set of 14 interactive Moodle-style question types, categorized as follows:

=== Standard Selections
- *MCQ:* Multiple choice questions with single or multiple correct answers.
- *True/False:* Binary choice with visual action buttons.
- *Matrix:* A multi-row grid selection (e.g., True/False evaluation per statement row).

=== Drag & Drop Interactions
- *Ordering:* Native drag-and-drop handles to reorder items into a correct sequence.
- *Drag & Drop:* Categorize items by dragging them into corresponding drop zones.
- *Matching:* Connect pairs of related terms from two separate columns.

=== Text Inputs
- *Fill in the Blank:* Inline text inputs replacing gap placeholders within a paragraph.
- *Short Answer:* Free text input with keyword matching and tolerance validation.
- *Cloze:* Inline gaps with dropdown selection menus instead of free text.
- *Essay:* Free-text area with word limit tracking and optional keyword-based auto-grading.
- *Calculated:* Formula-based questions (e.g., `x + y = ?`) where variables are randomized per student, and answers are evaluated against a tolerance margin.

=== Visual & Touch Interactions
- *Sentence Reorder:* Tap words to reassemble them into a grammatically correct sentence (optimized for mobile).
- *Hotspot:* Click or tap on the correct defined area of an uploaded image.
- *Drag to Image:* Place floating text labels onto a background diagram at their correct geometric positions.

== Instant Feedback & Analytics

When a student submits an answer, the evaluation logic runs server-side to prevent cheating. The UI immediately displays:
- A clear visual indicator (Red/Green or Cross/Checkmark).
- The correct answer (if the student was wrong).
- An optional explanation or hint defined by the teacher.

Results are saved to the `user_points` and `quiz_attempts` tables to power the Gamification system.
