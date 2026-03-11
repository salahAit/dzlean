import type { PageServerLoad } from './$types';
import { contentDatabase, contentSchema } from '$lib/server/db/index';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const trimesters = await contentDatabase.select().from(contentSchema.trimesters).all();

	const yearSubjectsQuery = await contentDatabase
		.select({
			id: contentSchema.yearSubjects.id,
			yearAr: contentSchema.years.nameAr,
			subjectAr: contentSchema.subjects.nameAr,
			streamAr: contentSchema.streams.nameAr,
			yearSlug: contentSchema.years.slug,
			subjectSlug: contentSchema.subjects.slug,
			levelSlug: contentSchema.educationLevels.slug
		})
		.from(contentSchema.yearSubjects)
		.innerJoin(contentSchema.years, eq(contentSchema.yearSubjects.yearId, contentSchema.years.id))
		.innerJoin(
			contentSchema.educationLevels,
			eq(contentSchema.years.levelId, contentSchema.educationLevels.id)
		)
		.innerJoin(
			contentSchema.subjects,
			eq(contentSchema.yearSubjects.subjectId, contentSchema.subjects.id)
		)
		.leftJoin(
			contentSchema.streams,
			eq(contentSchema.yearSubjects.streamId, contentSchema.streams.id)
		)
		.all();

	return {
		trimesters,
		yearSubjects: yearSubjectsQuery
	};
};
