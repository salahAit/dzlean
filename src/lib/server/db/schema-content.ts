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
