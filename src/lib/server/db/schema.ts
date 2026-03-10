import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// USERS DATABASE SCHEMA (users.db)
// MVP - مبسط
// ============================================

// Users table
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').unique(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role', { enum: ['superadmin', 'admin', 'editor', 'student'] })
		.default('student')
		.notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
	createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: text('updated_at')
});

// Sessions table (for authentication)
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(), // UUID
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull()
});

// ============================================
// COMMENTS (per document, no login required)
// ============================================
export const comments = sqliteTable('comments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	documentId: integer('document_id').notNull(),
	authorName: text('author_name').notNull(),
	content: text('content').notNull(),
	createdAt: text('created_at').default(sql`(datetime('now'))`).notNull()
});

// ============================================
// RATINGS (1-5 stars, unique per fingerprint)
// ============================================
export const ratings = sqliteTable('ratings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	documentId: integer('document_id').notNull(),
	fingerprint: text('fingerprint').notNull(), // cookie-based
	rating: integer('rating').notNull(), // 1-5
	createdAt: text('created_at').default(sql`(datetime('now'))`).notNull()
});

// ============================================
// VIEW STATS (aggregate per document per day)
// ============================================
export const viewStats = sqliteTable('view_stats', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	documentId: integer('document_id').notNull(),
	date: text('date').notNull(), // YYYY-MM-DD
	views: integer('views').default(0).notNull(),
	downloads: integer('downloads').default(0).notNull()
});

// ============================================
// NOTIFICATIONS (admin-published)
// ============================================
export const notifications = sqliteTable('notifications', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	body: text('body'),
	type: text('type', { enum: ['new_doc', 'announcement', 'update'] }).default('announcement').notNull(),
	documentId: integer('document_id'), // optional link to a document
	createdAt: text('created_at').default(sql`(datetime('now'))`).notNull()
});

// ============================================
// QUIZ ATTEMPTS (per user/fingerprint)
// ============================================
export const quizAttempts = sqliteTable(
	'quiz_attempts',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		quizId: integer('quiz_id').notNull(),
		fingerprint: text('fingerprint').notNull(),
		score: integer('score').default(0),
		totalPoints: integer('total_points').default(0),
		percentage: real('percentage').default(0),
		timeTaken: integer('time_taken').default(0),
		completedAt: text('completed_at'),
		createdAt: text('created_at').default(sql`(datetime('now'))`).notNull()
	},
	(table) => ({
		quizIdx: index('idx_attempts_quiz').on(table.quizId)
	})
);

// ============================================
// ATTEMPT ANSWERS (detailed responses)
// ============================================
export const attemptAnswers = sqliteTable('attempt_answers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	attemptId: integer('attempt_id')
		.references(() => quizAttempts.id, { onDelete: 'cascade' })
		.notNull(),
	questionId: integer('question_id').notNull(),
	answer: text('answer').notNull(), // JSON
	isCorrect: integer('is_correct').default(0).notNull(), // boolean mode
	pointsEarned: integer('points_earned').default(0).notNull()
});

// ============================================
// TYPE EXPORTS
// ============================================

export type Role = 'superadmin' | 'admin' | 'editor' | 'student';
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;

export type ViewStat = typeof viewStats.$inferSelect;
export type NewViewStat = typeof viewStats.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;

export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type NewAttemptAnswer = typeof attemptAnswers.$inferInsert;
