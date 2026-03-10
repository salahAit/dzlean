import type { PageServerLoad } from './$types';
import { Database } from 'bun:sqlite';

export const load: PageServerLoad = async () => {
    const db = new Database('data/content.db', { readonly: true });

    const subjects = db
        .query(
            `
		SELECT 
			s.name_ar as subject_name, s.slug as subject_slug, s.color as subject_color, s.icon as subject_icon,
			y.name_ar as year_name, y.slug as year_slug,
			el.name_ar as level_name, el.slug as level_slug,
			COUNT(d.id) as doc_count,
			GROUP_CONCAT(d.id) as doc_ids
		FROM documents d
		JOIN year_subjects ys ON d.year_subject_id = ys.id
		JOIN years y ON ys.year_id = y.id
		JOIN education_levels el ON y.level_id = el.id
		JOIN subjects s ON ys.subject_id = s.id
		WHERE d.is_published = 1
		GROUP BY ys.id
		ORDER BY el."order", y."order", s.name_ar
	`
        )
        .all();

    db.close();

    return { subjects };
};
