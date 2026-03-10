import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questionCategories, questions } from '$lib/server/db/schema-content';
import { eq } from 'drizzle-orm';

// Update a category (rename or move)
export async function PUT({ params, request, locals }) {
    if (!locals.user || !['superadmin', 'admin'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categoryId = parseInt(params.id);
    const data = await request.json();

    try {
        // Prevent setting parentId to itself (circular reference)
        if (data.parentId === categoryId) {
            return json({ error: 'Cannot set category as its own parent' }, { status: 400 });
        }

        await contentDatabase
            .update(questionCategories)
            .set({
                name: data.name,
                description: data.description,
                parentId: data.parentId || null,
                yearSubjectId: data.yearSubjectId || null,
                updatedAt: new Date().toISOString()
            })
            .where(eq(questionCategories.id, categoryId));

        return json({ success: true });
    } catch (error) {
        console.error('Error updating category:', error);
        return json({ error: 'Failed to update category' }, { status: 500 });
    }
}

// Delete a category
export async function DELETE({ params, locals }) {
    if (!locals.user || !['superadmin', 'admin'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categoryId = parseInt(params.id);

    try {
        // 1. Check if it has child categories
        const children = await contentDatabase
            .select()
            .from(questionCategories)
            .where(eq(questionCategories.parentId, categoryId))
            .limit(1);

        if (children.length > 0) {
            return json({ error: 'Cannot delete category because it contains sub-categories.' }, { status: 400 });
        }

        // 2. Check if it has questions
        const linkedQuestions = await contentDatabase
            .select()
            .from(questions)
            .where(eq(questions.categoryId, categoryId))
            .limit(1);

        if (linkedQuestions.length > 0) {
            return json({ error: 'Cannot delete category because it contains questions. Move them first.' }, { status: 400 });
        }

        // 3. Delete
        await contentDatabase.delete(questionCategories).where(eq(questionCategories.id, categoryId));

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return json({ error: 'Failed to delete category' }, { status: 500 });
    }
}
