import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// CONTENT DATABASE SCHEMA (content.db)
// النظام التعليمي الجزائري
// education_levels → years → subjects → documents
// ============================================

/**
 * 1. المراحل التعليمية (Education Levels)
 * ابتدائي، متوسط، ثانوي
 */
export const educationLevels = sqliteTable('education_levels', {
	id: text('id').primaryKey(), // 'primaire', 'moyen', 'secondaire'
	name: text('name').notNull(), // التعليم الابتدائي
	nameAr: text('name_ar').notNull(), // الاسم بالعربية
	nameFr: text('name_fr').notNull(), // الاسم بالفرنسية
	slug: text('slug').notNull().unique(), // للرابط
	description: text('description'),
	icon: text('icon'), // 🎒 📚 🎓
	color: text('color'), // لون البطاقة
	order: integer('order').notNull().default(0)
});

/**
 * 2. السنوات الدراسية (Years)
 * السنة الأولى، الثانية، الثالثة...
 */
export const years = sqliteTable('years', {
	id: text('id').primaryKey(), // '1am', '2am', '1as'...
	levelId: text('level_id')
		.references(() => educationLevels.id)
		.notNull(),
	name: text('name').notNull(),
	nameAr: text('name_ar').notNull(),
	nameFr: text('name_fr').notNull(),
	slug: text('slug').notNull().unique(),
	order: integer('order').notNull().default(0),
	// للثانوي: الشعبة (علوم تجريبية، آداب...)
	stream: text('stream') // null للابتدائي والمتوسط
});

/**
 * 3. المواد الدراسية (Subjects)
 */
export const subjects = sqliteTable('subjects', {
	id: text('id').primaryKey(), // 'math', 'arabic', 'physics'
	name: text('name').notNull(),
	nameAr: text('name_ar').notNull(),
	nameFr: text('name_fr').notNull(),
	slug: text('slug').notNull().unique(),
	icon: text('icon'), // أيقونة المادة
	color: text('color') // لون المادة
});

/**
 * 4. ربط المواد بالسنوات (Year-Subject mapping)
 * many-to-many
 */
export const yearSubjects = sqliteTable('year_subjects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	yearId: text('year_id')
		.references(() => years.id)
		.notNull(),
	subjectId: text('subject_id')
		.references(() => subjects.id)
		.notNull(),
	coefficient: integer('coefficient'), // معامل المادة
	order: integer('order').notNull().default(0)
});

/**
 * 5. الفصول الدراسية (Trimesters)
 */
export const trimesters = sqliteTable('trimesters', {
	id: text('id').primaryKey(), // 't1', 't2', 't3'
	name: text('name').notNull(),
	nameAr: text('name_ar').notNull(),
	nameFr: text('name_fr').notNull(),
	order: integer('order').notNull().default(0)
});

/**
 * 6. الوثائق التعليمية (Documents)
 * فروض، اختبارات، دروس، ملخصات
 */
export const documents = sqliteTable('documents', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	yearSubjectId: integer('year_subject_id')
		.references(() => yearSubjects.id)
		.notNull(),
	trimesterId: text('trimester_id').references(() => trimesters.id),

	title: text('title').notNull(),
	titleAr: text('title_ar'),
	slug: text('slug').notNull(),

	// نوع الوثيقة
	type: text('type', {
		enum: ['exam', 'test', 'lesson', 'summary', 'exercise', 'solution']
	}).notNull(),

	// المحتوى
	content: text('content'), // محتوى HTML/Markdown
	pdfUrl: text('pdf_url'), // رابط PDF
	solutionUrl: text('solution_url'), // رابط PDF الحل
	fileSize: integer('file_size'), // حجم الملف

	// بيانات إضافية
	source: text('source'), // المصدر (رسمي، مقترح...)
	year: text('academic_year'), // السنة الدراسية (2024/2025)
	hasSolution: integer('has_solution', { mode: 'boolean' }).default(false),
	difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }),

	// تتبع
	downloadCount: integer('download_count').default(0),
	isPublished: integer('is_published', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').default(sql`(datetime('now'))`),
	updatedAt: text('updated_at')
});

/**
 * 7. التمارين التفاعلية (Quizzes)
 */
export const quizzes = sqliteTable('quizzes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	yearSubjectId: integer('year_subject_id')
		.references(() => yearSubjects.id)
		.notNull(),
	trimesterId: text('trimester_id').references(() => trimesters.id),

	title: text('title').notNull(),
	titleAr: text('title_ar'),
	slug: text('slug').notNull().unique(),
	description: text('description'),

	difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),
	timeLimit: integer('time_limit').default(0), // seconds, 0 = unlimited
	questionCount: integer('question_count').default(0),
	passingScore: integer('passing_score').default(60), // percentage

	// New enhancement fields
	shuffleOptions: integer('shuffle_options', { mode: 'boolean' }).default(false),
	maxAttempts: integer('max_attempts').default(0), // 0 = unlimited
	gradingMethod: text('grading_method', { enum: ['best', 'last', 'average'] }).default('best'),
	showAnswers: integer('show_answers', { mode: 'boolean' }).default(true),
	practiceMode: integer('practice_mode', { mode: 'boolean' }).default(false),

	isPremium: integer('is_premium', { mode: 'boolean' }).default(false).notNull(),
	isPublished: integer('is_published', { mode: 'boolean' }).default(false).notNull(),
	createdAt: text('created_at').default(sql`(datetime('now'))`),
	updatedAt: text('updated_at')
});

/**
 * 8. تصنيفات الأسئلة (Question Categories)
 * Moodle-style: Hierarchical tree structure for question banks
 */
export const questionCategories = sqliteTable('question_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),

	// Self-referencing FK to build a tree structure
	// If parentId is null, it's a top-level category
	parentId: integer('parent_id'),

	// Context association (Optional, but often tied to a specific subject/year)
	yearSubjectId: integer('year_subject_id').references(() => yearSubjects.id),

	createdAt: text('created_at').default(sql`(datetime('now'))`),
	updatedAt: text('updated_at')
});

/**
 * 9. بنك الأسئلة (Global Question Bank)
 * Moodle-style: Questions belong to categories, not just a single quiz or flat subject list.
 */
export const questions = sqliteTable('questions', {
	id: integer('id').primaryKey({ autoIncrement: true }),

	// Replaced flat yearSubjectId and trimesterId with hierarchical category
	categoryId: integer('category_id')
		.references(() => questionCategories.id)
		.notNull(),

	type: text('type', {
		enum: ['mcq', 'true_false', 'ordering', 'drag_drop', 'matching', 'fill_blank', 'short_answer', 'cloze']
	}).notNull(),

	difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] }).default('medium'),

	questionText: text('question_text').notNull(),
	questionTextAr: text('question_text_ar'),
	questionData: text('question_data').notNull(), // JSON payload specific to the type
	explanation: text('explanation'),

	createdAt: text('created_at').default(sql`(datetime('now'))`),
	updatedAt: text('updated_at')
});

/**
 * 9. ربط الأسئلة بالتمارين (Quiz Questions Join Table)
 * Many-to-Many relationship between Quizzes and Questions
 */
export const quizQuestions = sqliteTable('quiz_questions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	quizId: integer('quiz_id')
		.references(() => quizzes.id, { onDelete: 'cascade' })
		.notNull(),
	questionId: integer('question_id')
		.references(() => questions.id, { onDelete: 'cascade' })
		.notNull(),

	points: integer('points').default(1).notNull(), // يمكن تخصيص النقاط داخل هذا الاختبار تحديداً
	order: integer('order').default(0).notNull() // ترتيب السؤال في هذا الاختبار
});

// ============================================
// TYPE EXPORTS
// ============================================

export type EducationLevel = typeof educationLevels.$inferSelect;
export type NewEducationLevel = typeof educationLevels.$inferInsert;

export type Year = typeof years.$inferSelect;
export type NewYear = typeof years.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type YearSubject = typeof yearSubjects.$inferSelect;
export type NewYearSubject = typeof yearSubjects.$inferInsert;

export type Trimester = typeof trimesters.$inferSelect;
export type NewTrimester = typeof trimesters.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentType = 'exam' | 'test' | 'lesson' | 'summary' | 'exercise' | 'solution';

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type NewQuizQuestion = typeof quizQuestions.$inferInsert;

export type QuestionType = 'mcq' | 'true_false' | 'ordering' | 'drag_drop' | 'matching' | 'fill_blank' | 'short_answer' | 'cloze';
