import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questions, questionCategories } from '$lib/server/db/schema-content';
import { eq, desc } from 'drizzle-orm';

// Fetch all questions for the bank
export async function GET({ url, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const allQuestions = await contentDatabase
            .select({
                id: questions.id,
                categoryId: questions.categoryId,
                type: questions.type,
                difficulty: questions.difficulty,
                questionText: questions.questionText,
                questionTextAr: questions.questionTextAr,
                questionData: questions.questionData,
                explanation: questions.explanation,
                createdAt: questions.createdAt,
                updatedAt: questions.updatedAt,
                categoryName: questionCategories.name
            })
            .from(questions)
            .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
            .orderBy(desc(questions.createdAt));

        return json({ questions: allQuestions });
    } catch (error) {
        console.error('Error fetching question bank:', error);
        return json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
} // added missing brace

// Create a new question in the bank
export async function POST({ request, locals }) {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const newQuestion = await contentDatabase
            .insert(questions)
            .values({
                categoryId: data.categoryId,
                type: data.type,
                difficulty: data.difficulty || 'medium',
                questionText: data.questionText,
                questionTextAr: data.questionTextAr || null,
                questionData: data.questionData,
                explanation: data.explanation || null
            })
            .returning();

        return json(newQuestion[0], { status: 201 });
    } catch (error) {
        console.error('Error creating question:', error);
        return json({ error: 'Failed to create question' }, { status: 500 });
    }
}
