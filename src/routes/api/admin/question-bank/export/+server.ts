import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questions, questionCategories } from '$lib/server/db/schema-content';

export async function GET() {
    const allQuestions = await contentDatabase.select().from(questions);
    const allCategories = await contentDatabase.select().from(questionCategories);

    return json({
        exportedAt: new Date().toISOString(),
        version: '1.0',
        categories: allCategories,
        questions: allQuestions
    });
}
