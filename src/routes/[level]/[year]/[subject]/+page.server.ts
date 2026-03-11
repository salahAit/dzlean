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

	// ========================================
	// Smart Detection: Is params.subject a STREAM slug or a SUBJECT slug?
	// For secondary school, the URL pattern is:
	//   /secondaire/3as/se       → stream page (show subjects)
	//   /primaire/5ap/arb-b      → subject page (show documents)
	// ========================================

	// Try to match as a stream first (stream IDs are uppercase, slugs are lowercase)
	const streamSlug = params.subject.toUpperCase();
	const stream = db.query(`
		SELECT s.* FROM streams s
		JOIN level_streams ls ON ls.stream_id = s.id
		WHERE s.id = ? AND ls.year_id = ?
	`).get(streamSlug, year.id) as any;

	if (stream) {
		// === STREAM MODE: Show subjects for this stream ===
		const subjects = db.query(`
			SELECT sub.*, ss.coefficient, ss."order",
				(SELECT COUNT(d.id) FROM documents d 
				 JOIN year_subjects ys ON d.year_subject_id = ys.id
				 WHERE ys.subject_id = sub.id AND ys.year_id = ? AND ys.stream_id = ?) as docCount
			FROM stream_subjects ss
			JOIN subjects sub ON ss.subject_id = sub.id
			WHERE ss.stream_id = ? AND ss.year_id = ?
			ORDER BY ss."order"
		`).all(year.id, stream.id, stream.id, year.id);

		db.close();
		return {
			mode: 'stream' as const,
			level, year, stream, subjects,
			// Empty fields for type compatibility
			subject: null, yearSubject: null, trimesters: [], documents: [], quizzes: [],
			user: locals.user
		};
	}

	// === SUBJECT MODE: Show documents (original behavior) ===
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
		.query(`
		SELECT * FROM documents 
		WHERE year_subject_id = ? AND is_published = 1
		ORDER BY trimester_id, type, title
	`)
		.all(yearSubject.id);

	const quizzes = db
		.query(`
		SELECT * FROM quizzes 
		WHERE year_subject_id = ? AND is_published = 1
		ORDER BY trimester_id, title
	`)
		.all(yearSubject.id);

	db.close();

	return {
		mode: 'subject' as const,
		level, year, subject, yearSubject, trimesters, documents, quizzes,
		stream: null, subjects: [],
		user: locals.user
	};
};
