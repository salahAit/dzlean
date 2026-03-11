import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { quizQuestions, quizzes, questions } from '$lib/server/db/schema-content';
import { eq, sql } from 'drizzle-orm';

// Update individual question linkage (points and order)
export async function PUT({ params, request, locals }) {
    if (!locals.user || !['superadmin', 'admin', 'editor'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const linkId = parseInt(params.qid);
    const data = await request.json();

    try {
        // First, get the link to find the actual question ID
        const link = await contentDatabase.select().from(quizQuestions).where(eq(quizQuestions.id, linkId)).get();
        if (!link) return json({ error: 'Question link not found' }, { status: 404 });

        await contentDatabase.transaction(async (tx) => {
            // Update the link (points, order)
            await tx
                .update(quizQuestions)
                .set({
                    points: data.points !== undefined ? data.points : link.points,
                    order: data.order !== undefined ? data.order : link.order
                })
                .where(eq(quizQuestions.id, linkId));

            // Update the actual question content
            await tx
                .update(questions)
                .set({
                    type: data.type,
                    difficulty: data.difficulty,
                    questionText: data.questionText,
                    questionTextAr: data.questionTextAr || null,
                    questionData: data.questionData,
                    explanation: data.explanation || null,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(questions.id, link.questionId));
        });

        return json({ success: true });
    } catch (error) {
        console.error('Update question link error:', error);
        return json({ error: 'Failed to update question link' }, { status: 500 });
    }
}

// Delete question linkage from this quiz
export async function DELETE({ params, locals }) {
    if (!locals.user || !['superadmin', 'admin', 'editor'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quizId = parseInt(params.id);
    const linkId = parseInt(params.qid);

    try {
        await contentDatabase.delete(quizQuestions).where(eq(quizQuestions.id, linkId));

        // Update quiz question count
        await contentDatabase
            .update(quizzes)
            .set({ questionCount: sql`question_count - 1` })
            .where(eq(quizzes.id, quizId));

        return json({ success: true });
    } catch (error) {
        return json({ error: 'Failed to delete question link' }, { status: 500 });
    }
}
