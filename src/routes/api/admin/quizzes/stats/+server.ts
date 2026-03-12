import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { quizzes, questions, questionCategories } from '$lib/server/db/schema-content';
import { sql } from 'drizzle-orm';

export async function GET({ locals }) {
    if (!locals.user || !['superadmin', 'admin'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const [stats] = await contentDatabase.select({
            totalQuizzes: sql`count(distinct ${quizzes.id})`.mapWith(Number),
            totalQuestions: sql`count(distinct ${questions.id})`.mapWith(Number),
            totalCategories: sql`count(distinct ${questionCategories.id})`.mapWith(Number),
        }).from(quizzes)
        .leftJoin(questions, sql`1=1`)
        .leftJoin(questionCategories, sql`1=1`);
        // This query might cross join if not careful. Let's do separate counts.
        
        const [quizCount] = await contentDatabase.select({ count: sql`count(*)`.mapWith(Number) }).from(quizzes);
        const [questionCount] = await contentDatabase.select({ count: sql`count(*)`.mapWith(Number) }).from(questions);
        const [categoryCount] = await contentDatabase.select({ count: sql`count(*)`.mapWith(Number) }).from(questionCategories);

        return json({
            totalQuizzes: quizCount.count,
            totalQuestions: questionCount.count,
            totalCategories: categoryCount.count
        });
    } catch (error) {
        return json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
