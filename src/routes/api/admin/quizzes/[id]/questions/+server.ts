import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { quizQuestions, questions } from '$lib/server/db/schema-content';
import { eq, and } from 'drizzle-orm';

// Get all questions for a specific quiz
export async function GET({ params, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await contentDatabase
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
            .where(eq(quizQuestions.quizId, Number(params.id)))
            .orderBy(quizQuestions.order);

        // To keep frontend compatibility without massive refactor, we map the joined result flat
        return json({ questions: result });
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        return json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

// Add a NEW question to a quiz (creates in bank, then links)
// Or import existing if questionId is provided
export async function POST({ params, request, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Fetch current max order
        const existingLinks = await contentDatabase
            .select({ order: quizQuestions.order })
            .from(quizQuestions)
            .where(eq(quizQuestions.quizId, Number(params.id)));
        const nextOrder = existingLinks.length > 0 ? Math.max(...existingLinks.map(q => q.order)) + 1 : 0;

        const data = await request.json();
        const quizId = Number(params.id);

        let questionId = data.questionId;

        // If no existing questionId is provided, create it in the global bank first
        if (!questionId) {
            // NOTE: the client needs to pass categoryId if creating fresh here, 
            // but normally the quiz has a context. Assuming it's passed or defaults to a generic category for now if missing.
            const newQ = await contentDatabase
                .insert(questions)
                .values({
                    categoryId: data.categoryId || 1, // Fallback, though builder should pass it
                    type: data.type,
                    difficulty: 'medium',
                    questionText: data.questionText,
                    questionTextAr: data.questionTextAr || null,
                    questionData: data.questionData,
                    explanation: data.explanation || null
                })
                .returning();
            questionId = newQ[0].id;
        }

        // Link it in the join table
        const newLink = await contentDatabase
            .insert(quizQuestions)
            .values({
                quizId,
                questionId,
                points: data.points || 1,
                order: nextOrder
            })
    } catch (error) {
        console.error('Add question error:', error);
        return json({ error: 'Failed to add question' }, { status: 500 });
    }
}

// Reorder questions
export async function PUT({ params, request, locals }) {
    if (!locals.user || !['superadmin', 'admin', 'editor'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quizId = parseInt(params.id);
    const data = await request.json(); // expect array of { id, order }

    try {
        // Drizzle SQLite doesn't have true bulk update, so we do it in a transaction
        await contentDatabase.transaction(async (tx) => {
            for (const item of data.orders) {
                await tx
                    .update(quizQuestions)
                    .set({ order: item.order })
                    .where(eq(quizQuestions.id, item.id));
            }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Reorder error:', error);
        return json({ error: 'Failed to reorder questions' }, { status: 500 });
    }
}
