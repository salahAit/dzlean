import { error } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import {
    quizzes,
    quizQuestions,
    questions,
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

    const rawQuestions = await contentDatabase
        .select({
            id: quizQuestions.id,
            quizId: quizQuestions.quizId,
            questionId: quizQuestions.questionId,
            points: quizQuestions.points,
            order: quizQuestions.order,
            // Nested question data
            type: questions.type,
            difficulty: questions.difficulty,
            questionText: questions.questionText,
            questionTextAr: questions.questionTextAr,
            questionData: questions.questionData,
            explanation: questions.explanation
        })
        .from(quizQuestions)
        .innerJoin(questions, eq(quizQuestions.questionId, questions.id))
        .where(eq(quizQuestions.quizId, quizRow.quiz.id))
        .orderBy(asc(quizQuestions.order));

    // Parse questionData JSON (only if it's still a string, though Drizzle should handle it)
    const parsedQuestions = rawQuestions.map((q) => {
        let parsedData = q.questionData;
        if (typeof q.questionData === 'string') {
            try {
                parsedData = JSON.parse(q.questionData);
            } catch (e) {
                console.error('Failed to parse questionData:', e);
            }
        }

        return {
            ...q,
            questionData: parsedData
        };
    });

    return {
        quiz: quizRow.quiz,
        subject: quizRow.subject,
        year: quizRow.year,
        level: quizRow.level,
        questions: parsedQuestions
    };
}
