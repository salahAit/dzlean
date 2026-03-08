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

	const years = db
		.query(
			`
		SELECT y.*,
			(SELECT COUNT(DISTINCT ys.subject_id) FROM year_subjects ys WHERE ys.year_id = y.id) as subjectCount,
			(SELECT COUNT(d.id) FROM documents d 
			 JOIN year_subjects ys ON d.year_subject_id = ys.id 
			 WHERE ys.year_id = y.id) as docCount
		FROM years y 
		WHERE y.level_id = ? 
		ORDER BY y."order"
	`
		)
		.all(level.id);

	db.close();

	return { level, years };
};
