import { error } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import {
	documents,
	subjects,
	years,
	educationLevels,
	yearSubjects
} from '$lib/server/db/schema-content';
import { eq, ne, and } from 'drizzle-orm';

export async function load({ params }) {
	const docSlug = params.docSlug;

	// fetch document with level, year, subject info for breadcrumbs
	const [docRow] = await contentDatabase
		.select({
			doc: documents,
			subject: subjects,
			year: years,
			level: educationLevels
		})
		.from(documents)
		.innerJoin(yearSubjects, eq(documents.yearSubjectId, yearSubjects.id))
		.innerJoin(subjects, eq(yearSubjects.subjectId, subjects.id))
		.innerJoin(years, eq(yearSubjects.yearId, years.id))
		.innerJoin(educationLevels, eq(years.levelId, educationLevels.id))
		.where(eq(documents.slug, docSlug))
		.limit(1);

	if (!docRow) {
		error(404, 'الوثيقة غير موجودة');
	}

	// Fetch related documents from the same subject
	const relatedDocs = await contentDatabase
		.select({
			id: documents.id,
			title: documents.title,
			titleAr: documents.titleAr,
			slug: documents.slug,
			type: documents.type,
			hasSolution: documents.hasSolution
		})
		.from(documents)
		.where(
			and(
				eq(documents.yearSubjectId, docRow.doc.yearSubjectId),
				ne(documents.id, docRow.doc.id),
				eq(documents.isPublished, true)
			)
		)
		.limit(5);

	return {
		document: docRow.doc,
		subject: docRow.subject,
		year: docRow.year,
		level: docRow.level,
		relatedDocs
	};
}
