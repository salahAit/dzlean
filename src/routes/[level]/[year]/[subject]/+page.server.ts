import type { PageServerLoad } from './$types';
import { Database } from 'bun:sqlite';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const db = new Database('data/content.db', { readonly: true });

	const level = db.query('SELECT * FROM education_levels WHERE slug = ?').get(params.level) as any;
	if (!level) {
		db.close();
		throw error(404, 'المرحلة غير موجودة');
	}

	const year = db
		.query('SELECT * FROM years WHERE slug = ? AND level_id = ?')
		.get(params.year, level.id) as any;
	if (!year) {
		db.close();
		throw error(404, 'السنة غير موجودة');
	}

	const subject = db.query('SELECT * FROM subjects WHERE slug = ?').get(params.subject) as any;
	if (!subject) {
		db.close();
		throw error(404, 'المادة غير موجودة');
	}

	const yearSubject = db
		.query('SELECT * FROM year_subjects WHERE year_id = ? AND subject_id = ?')
		.get(year.id, subject.id) as any;
	if (!yearSubject) {
		db.close();
		throw error(404, 'المادة غير مسجلة لهذه السنة');
	}

	const trimesters = db.query('SELECT * FROM trimesters ORDER BY "order"').all();

	const documents = db
		.query(
			`
		SELECT * FROM documents 
		WHERE year_subject_id = ? AND is_published = 1
		ORDER BY trimester_id, type, title
	`
		)
		.all(yearSubject.id);

	const quizzes = db
		.query(
			`
		SELECT * FROM quizzes 
		WHERE year_subject_id = ? AND is_published = 1
		ORDER BY trimester_id, title
	`
		)
		.all(yearSubject.id);

	db.close();

	return {
		level,
		year,
		subject,
		yearSubject,
		trimesters,
		documents,
		quizzes,
		user: locals.user
	};
};
