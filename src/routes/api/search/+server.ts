import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Database } from 'bun:sqlite';

export const GET: RequestHandler = async ({ url }) => {
    const q = url.searchParams.get('q')?.trim();
    if (!q || q.length < 2) {
        return json({ results: [] });
    }

    const db = new Database('data/content.db', { readonly: true });

    const results = db
        .query(
            `
		SELECT 
			d.id, d.title, d.title_ar, d.type, d.slug, d.academic_year,
			s.name_ar as subject_name, s.slug as subject_slug, s.icon as subject_icon, s.color as subject_color,
			y.name_ar as year_name, y.slug as year_slug,
			el.name_ar as level_name, el.slug as level_slug
		FROM documents d
		JOIN year_subjects ys ON d.year_subject_id = ys.id
		JOIN years y ON ys.year_id = y.id
		JOIN education_levels el ON y.level_id = el.id
		JOIN subjects s ON ys.subject_id = s.id
		WHERE d.is_published = 1 
			AND (d.title LIKE ? OR d.title_ar LIKE ? OR s.name_ar LIKE ?)
        
        UNION ALL

        SELECT 
			q.id, q.title, q.title_ar, 'quiz' as type, q.slug, NULL as academic_year,
			s.name_ar as subject_name, s.slug as subject_slug, s.icon as subject_icon, s.color as subject_color,
			y.name_ar as year_name, y.slug as year_slug,
			el.name_ar as level_name, el.slug as level_slug
		FROM quizzes q
		JOIN year_subjects ys ON q.year_subject_id = ys.id
		JOIN years y ON ys.year_id = y.id
		JOIN education_levels el ON y.level_id = el.id
		JOIN subjects s ON ys.subject_id = s.id
		WHERE q.is_published = 1 
			AND (q.title LIKE ? OR q.title_ar LIKE ? OR s.name_ar LIKE ?)

		ORDER BY title_ar
		LIMIT 20
	`
        )
        .all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);

    db.close();

    return json({ results });
};
