import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questions, questionCategories } from '$lib/server/db/schema-content';

export async function POST({ request }) {
    try {
        const data = await request.json();

        if (!data.questions || !Array.isArray(data.questions)) {
            return json({ error: 'Invalid format: missing questions array' }, { status: 400 });
        }

        let importedCategories = 0;
        let importedQuestions = 0;
        const categoryIdMap: Record<number, number> = {};

        // Import categories first (if present)
        if (data.categories && Array.isArray(data.categories)) {
            for (const cat of data.categories) {
                const result = await contentDatabase.insert(questionCategories).values({
                    name: cat.name,
                    description: cat.description || null,
                    parentId: cat.parentId ? (categoryIdMap[cat.parentId] || null) : null,
                    yearSubjectId: cat.yearSubjectId || null
                }).returning();
                if (result[0]) {
                    categoryIdMap[cat.id] = result[0].id;
                    importedCategories++;
                }
            }
        }

        // Import questions
        for (const q of data.questions) {
            await contentDatabase.insert(questions).values({
                categoryId: q.categoryId ? (categoryIdMap[q.categoryId] || q.categoryId) : null,
                type: q.type,
                difficulty: q.difficulty || 'medium',
                questionText: q.questionText || q.question_text || '',
                questionTextAr: q.questionTextAr || q.question_text_ar || '',
                questionData: typeof q.questionData === 'string' ? q.questionData : JSON.stringify(q.questionData || q.question_data),
                explanation: q.explanation || null
            });
            importedQuestions++;
        }

        return json({
            success: true,
            importedCategories,
            importedQuestions
        });
    } catch (err: any) {
        return json({ error: err.message }, { status: 500 });
    }
}
