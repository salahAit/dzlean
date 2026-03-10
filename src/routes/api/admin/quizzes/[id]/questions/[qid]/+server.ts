import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { quizQuestions, quizzes } from '$lib/server/db/schema-content';
import { eq, and, sql } from 'drizzle-orm';

// Update individual question linkage (points and order)
export async function PUT({ params, request, locals }) {
    if (!locals.user || !['superadmin', 'admin', 'editor'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const linkId = parseInt(params.qid);
    const data = await request.json();

    try {
        await contentDatabase
            .update(quizQuestions)
            .set({
                points: data.points,
                order: data.order
            })
            .where(eq(quizQuestions.id, linkId));

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
