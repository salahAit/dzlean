= The Educational Hierarchy Engine

SujetStore models the complex, multi-tiered Algerian educational system with high precision. Understanding this hierarchy is crucial for administrators managing documents and quizzes, as it dictates how content is routed to specific students.

== 1. The Core Entities

Our database schema breaks the educational journey into four distinct mathematical entities: *Levels*, *Years*, *Streams*, and *Subjects*.

=== 1.1. Levels (المراحل التعليمية)
Levels represent the broadest categorization in the Algerian system (`education_levels` table):
- *Primary Education (التعليم الابتدائي)*: 5 years of schooling.
- *Middle Education (التعليم المتوسط)*: 4 years of schooling culminating in the BEM exam.
- *Secondary Education (التعليم الثانوي)*: 3 years of schooling culminating in the BAC exam.

=== 1.2. Years (السنوات الدراسية)
Each Level is subdivided into specific Years (`years` table).
- For Primary: 1AP, 2AP, 3AP, 4AP, 5AP.
- For Middle: 1AM, 2AM, 3AM, 4AM.
- For Secondary: 1AS, 2AS, 3AS.
Years are strictly parented to a single Level (`level_id` foreign key).

=== 1.3. Streams (الشعب الدراسية)
Streams represent the specialized academic tracks that students follow. In the Algerian system, specialization begins in Secondary Education (`streams` table).
Examples of Streams include:
- *Common Trunk Science & Tech (جذع مشترك علوم وتكنولوجيا)* - Typically 1AS.
- *Common Trunk Letters (جذع مشترك آداب)* - Typically 1AS.
- *Experimental Sciences (علوم تجريبية)* - 2AS and 3AS.
- *Mathematics (رياضيات)* - 2AS and 3AS.
- *Management and Economics (تسيير واقتصاد)* - 2AS and 3AS.
- *Foreign Languages (لغات أجنبية)* - 2AS and 3AS.

To map which streams are available in which years, the database uses a many-to-many join table (`level_streams`). For example, the *Experimental Sciences* stream is mapped to *2AS* and *3AS*, but never *1AS*, *4AM*, or *1AP*. 
Primary and Middle education act functionally as a single "General" stream per year, although the architecture supports adding arbitrary streams if the educational system changes.

=== 1.4. Base Subjects (المواد الأساسية)
The `subjects` table holds the normalized names of subjects (e.g., "Mathematics", "Physics", "Arabic Language"). These are abstract entities. They do not belong to a year or a stream; they are just labels and icons.

== 2. The Intersection: YearSubjects and StreamSubjects

To attach actual educational content (PDF documents, interactive quizzes) to the hierarchy, we must define exactly *when* and *where* a base subject is taught.

=== 2.1. Year Subjects (مواد السنة)
The `year_subjects` table connects a Base Subject to a specific Year.
- *Examples*: "Math for 1AM", "Physics for 3AS".
When an admin navigates the backend dashboard (e.g., clicking on Secondary -> 3AS -> Physics), they are viewing a `year_subject`. All documents and quizzes are ultimately parented to a `year_subject_id`.

=== 2.2. The Complexity of Secondary Education (Shared vs. Specialized)
While `year_subjects` map subjects to years, Secondary Education introduces a severe complication: *Streams*.
In 3AS (3rd Year Secondary), Physics is taught to both the *Experimental Sciences* stream and the *Mathematics* stream. 

Must the admin upload the "2024 Final Physics Exam" twice—once for Experimental Sciences and once for Mathematics? 
*No.* SujetStore implements the *Algierian Exam Paper Coding System* via the `stream_subjects` table.

=== 2.3. Stream Subjects and the Exam Code Rule
The `stream_subjects` join table maps a `year_subject` to a combination of `stream` and `trimester`.
The Golden Rule of SujetStore is: _"If two streams take the exact same physical piece of paper in an exam, they share the exact same exam code and thus the same `year_subject`."_

*Scenario A: Shared Subjects (المواد المشتركة)*
Consider the Islamic Sciences exam in the BAC. Every single stream (Math, Sciences, Letters, Management, etc.) takes the exact same exam paper on the same day. 
- The admin uploads the "2024 Islamic Sciences BAC" document *once* to the `year_subject` "Islamic Sciences - 3AS".
- In the `stream_subjects` table, this single `year_subject_id` is linked to *all six* 3AS streams.
- If a Math student or a Letters student browses their unique stream profile, they will both see this shared document. If the admin fixes a typo in the title, it updates instantly for all streams.

*Scenario B: Specialized Subjects (المواد الخاصة)*
Consider Physics in 3AS. The *Mathematics* stream takes a much harder Physics exam than the *Experimental Sciences* stream. They take different papers on different days.
- To handle this, the system creates *two distinct* `year_subjects`:
  1. "Physics (Math Stream) - 3AS"
  2. "Physics (Science Stream) - 3AS"
- The admin uploads the Math Physics exam to year_subject #1, and the Science Physics exam to year_subject #2.
- In `stream_subjects`, year_subject #1 is mapped *only* to the Math stream, and year_subject #2 is mapped *only* to the Experimental Sciences stream.

== 3. Dynamic Trimesters

The Algerian school year is divided into three trimesters (الفصل الأول، الثاني، الثالث), plus General (عام) files for things like full-year curriculums or BAC subjects.
- Documents are assigned an optional `trimester_id`.
- Quizzes are assigned an optional `trimester_id`.
- The user interface automatically clusters and tabs content horizontally based on their trimester, calculating the exact document count for each trimester on the fly ensuring empty trimesters are hidden.
