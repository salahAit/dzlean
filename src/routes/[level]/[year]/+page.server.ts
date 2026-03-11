import type { PageServerLoad } from './$types';
import { Database } from 'bun:sqlite';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
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

	// Check if this year has streams (secondary school)
	const streams = db.query(`
		SELECT s.* FROM streams s
		JOIN level_streams ls ON ls.stream_id = s.id
		WHERE ls.year_id = ?
		ORDER BY s."order"
	`).all(year.id) as any[];

	if (streams.length > 0 && streams[0].id !== 'GEN') {
		// Secondary school: return streams for selection
		// Count subjects per stream for display
		const streamsWithCounts = streams.map((stream: any) => {
			const subjectCount = db.query(`
				SELECT COUNT(DISTINCT ss.subject_id) as count
				FROM stream_subjects ss
				WHERE ss.stream_id = ? AND ss.year_id = ?
			`).get(stream.id, year.id) as any;
			return { ...stream, subjectCount: subjectCount?.count || 0 };
		});

		db.close();
		return { level, year, streams: streamsWithCounts, subjects: [], isSecondary: true };
	}

	// Primary/Middle: return subjects directly
	const subjects = db.query(`
		SELECT s.*, ys.id as yearSubjectId, ys.coefficient,
			(SELECT COUNT(d.id) FROM documents d WHERE d.year_subject_id = ys.id) as docCount
		FROM year_subjects ys
		JOIN subjects s ON ys.subject_id = s.id
		WHERE ys.year_id = ?
		ORDER BY ys."order"
	`).all(year.id);

	db.close();
	return { level, year, subjects, streams: [], isSecondary: false };
};
