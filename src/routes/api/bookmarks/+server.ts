import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Database } from 'bun:sqlite';

export const GET: RequestHandler = async ({ url }) => {
    const idsParam = url.searchParams.get('ids');
    if (!idsParam) return json({ documents: [] });

    const ids = idsParam
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));

    if (ids.length === 0) return json({ documents: [] });

    const db = new Database('data/content.db', { readonly: true });

    const placeholders = ids.map(() => '?').join(',');
    const documents = db
        .query(
            `
		SELECT 
			d.id, d.title, d.title_ar, d.type, d.slug, d.pdf_url, d.solution_url,
			s.name_ar as subject_name, s.slug as subject_slug,
			y.name_ar as year_name, y.slug as year_slug,
			el.name_ar as level_name, el.slug as level_slug
		FROM documents d
		JOIN year_subjects ys ON d.year_subject_id = ys.id
		JOIN years y ON ys.year_id = y.id
		JOIN education_levels el ON y.level_id = el.id
		JOIN subjects s ON ys.subject_id = s.id
		WHERE d.id IN (${placeholders}) AND d.is_published = 1
	`
        )
        .all(...ids);

    db.close();

    return json({ documents });
};
