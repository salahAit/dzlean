import { sqliteTable, text, integer, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

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
// TYPE EXPORTS
// ============================================

export type Role = 'superadmin' | 'admin' | 'editor' | 'student';
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
