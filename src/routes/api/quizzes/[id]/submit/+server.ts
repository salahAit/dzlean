import { json } from '@sveltejs/kit';
import { usersDatabase } from '$lib/server/db';
import * as userSchema from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST({ request, cookies }) {
    try {
        const { quizId, score, totalPoints, percentage, timeTaken, details } = await request.json();

        if (!quizId || percentage === undefined) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use existing fingerprint or create one for tracking attempts
        let fingerprint = cookies.get('client_fp');
        if (!fingerprint) {
            fingerprint = crypto.randomUUID();
            cookies.set('client_fp', fingerprint, {
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                secure: true,
                sameSite: 'lax',
                httpOnly: true
            });
        }

        // 1. Insert Attempt
        const attemptResult = usersDatabase
            .insert(userSchema.quizAttempts)
            .values({
                quizId,
                fingerprint,
                score,
                totalPoints,
                percentage,
                timeTaken,
                completedAt: sql`(datetime('now'))`
            })
            .returning({ id: userSchema.quizAttempts.id })
            .get();

        if (!attemptResult) {
            return json({ error: 'Failed to save attempt' }, { status: 500 });
        }

        // 2. Insert detail answers
        if (details && Array.isArray(details) && details.length > 0) {
            const answerValues = details.map((d) => ({
                attemptId: attemptResult.id,
                questionId: d.question.id,
                answer: JSON.stringify(d.answer ?? {}),
                isCorrect: d.correct ? 1 : 0,
                pointsEarned: d.points || 0
            }));

            usersDatabase.insert(userSchema.attemptAnswers).values(answerValues).run();
        }

        return json({ success: true, attemptId: attemptResult.id });
    } catch (error) {
        console.error('Quiz submit error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
