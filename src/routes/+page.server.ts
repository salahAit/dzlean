import type { PageServerLoad } from './$types';
import { Database } from 'bun:sqlite';

export const load: PageServerLoad = async () => {
	const db = new Database('data/content.db', { readonly: true });

	const levels = db
		.query(
			`
		SELECT el.*, 
			(SELECT COUNT(DISTINCT y.id) FROM years y WHERE y.level_id = el.id) as yearCount,
			(SELECT COUNT(d.id) FROM documents d 
			 JOIN year_subjects ys ON d.year_subject_id = ys.id 
			 JOIN years y ON ys.year_id = y.id 
			 WHERE y.level_id = el.id) as docCount
		FROM education_levels el 
		ORDER BY el."order"
	`
		)
		.all();

	const stats = db
		.query(
			`
		SELECT 
			(SELECT COUNT(*) FROM documents WHERE type = 'exam') as examCount,
			(SELECT COUNT(*) FROM documents WHERE type = 'test') as testCount,
			(SELECT COUNT(*) FROM documents WHERE type = 'summary') as summaryCount,
			(SELECT COUNT(*) FROM documents) as totalDocs,
			(SELECT COUNT(*) FROM subjects) as subjectCount
	`
		)
		.get();

	db.close();

	return { levels, stats };
};
