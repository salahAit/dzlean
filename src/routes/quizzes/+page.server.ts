import { contentDatabase } from '$lib/server/db';
import {
    quizzes,
    quizQuestions,
    yearSubjects,
    subjects,
    years,
    educationLevels
} from '$lib/server/db/schema-content';
import { eq, and } from 'drizzle-orm';

export async function load() {
    const rows = await contentDatabase
        .select({
            quiz: quizzes,
            subject: subjects,
            year: years,
            level: educationLevels
        })
        .from(quizzes)
        .innerJoin(yearSubjects, eq(quizzes.yearSubjectId, yearSubjects.id))
        .innerJoin(subjects, eq(yearSubjects.subjectId, subjects.id))
        .innerJoin(years, eq(yearSubjects.yearId, years.id))
        .innerJoin(educationLevels, eq(years.levelId, educationLevels.id))
        .where(eq(quizzes.isPublished, true));

    return { quizzes: rows };
}
