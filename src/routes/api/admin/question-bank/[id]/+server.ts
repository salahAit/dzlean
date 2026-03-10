import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questions } from '$lib/server/db/schema-content';
import { eq } from 'drizzle-orm';

// Get a single question
export async function GET({ params, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const q = await contentDatabase.select().from(questions).where(eq(questions.id, Number(params.id))).get();
        if (!q) return json({ error: 'Question not found' }, { status: 404 });
        return json(q);
    } catch (error) {
        return json({ error: 'Failed to fetch question' }, { status: 500 });
    }
}

// Update a question
export async function PUT({ params, request, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await request.json();
        const updated = await contentDatabase
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
            .where(eq(questions.id, Number(params.id)))
            .returning();

        return json(updated[0]);
    } catch (error) {
        return json({ error: 'Failed to update question' }, { status: 500 });
    }
}

// Delete a question
export async function DELETE({ params, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await contentDatabase.delete(questions).where(eq(questions.id, Number(params.id)));
        return json({ success: true });
    } catch (error) {
        return json({ error: 'Failed to delete question' }, { status: 500 });
    }
}
