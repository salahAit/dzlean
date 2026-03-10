import { error } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import {
    quizzes,
    quizQuestions,
    yearSubjects,
    subjects,
    years,
    educationLevels
} from '$lib/server/db/schema-content';
import { eq, asc } from 'drizzle-orm';

export async function load({ params }) {
    const slug = params.slug;

    const [quizRow] = await contentDatabase
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
        .where(eq(quizzes.slug, slug))
        .limit(1);

    if (!quizRow) {
        error(404, 'التمرين غير موجود');
    }

    const questions = await contentDatabase
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizRow.quiz.id))
        .orderBy(asc(quizQuestions.order));

    // Parse questionData JSON
    const parsedQuestions = questions.map((q) => ({
        ...q,
        questionData: JSON.parse(q.questionData)
    }));

    return {
        quiz: quizRow.quiz,
        subject: quizRow.subject,
        year: quizRow.year,
        level: quizRow.level,
        questions: parsedQuestions
    };
}
