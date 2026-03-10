import { json } from '@sveltejs/kit';
import { Database } from 'bun:sqlite';

export async function GET() {
    const db = new Database('data/users.db', { readonly: true });
    const contentDb = new Database('data/content.db', { readonly: true });

    // Overall stats
    const totalAttempts = db.query('SELECT COUNT(*) as count FROM quiz_attempts').get() as any;
    const avgScore = db.query('SELECT AVG(percentage) as avg FROM quiz_attempts').get() as any;
    const totalQuizzes = contentDb.query('SELECT COUNT(*) as count FROM quizzes WHERE is_published = 1').get() as any;
    const totalQuestions = contentDb.query('SELECT COUNT(*) as count FROM questions').get() as any;

    // Per-quiz stats
    const quizStats = db.query(`
		SELECT 
			quiz_id,
			COUNT(*) as attempts,
			ROUND(AVG(percentage), 1) as avg_score,
			MAX(percentage) as best_score,
			MIN(percentage) as worst_score,
			ROUND(AVG(time_taken), 0) as avg_time,
			SUM(CASE WHEN percentage >= 60 THEN 1 ELSE 0 END) as passed_count
		FROM quiz_attempts
		GROUP BY quiz_id
		ORDER BY attempts DESC
	`).all() as any[];

    // Enrich with quiz titles
    const enrichedStats = quizStats.map((s: any) => {
        const quiz = contentDb.query('SELECT title, title_ar, slug FROM quizzes WHERE id = ?').get(s.quiz_id) as any;
        return {
            ...s,
            title: quiz?.title_ar || quiz?.title || `Quiz ${s.quiz_id}`,
            slug: quiz?.slug || '',
            passRate: s.attempts > 0 ? Math.round((s.passed_count / s.attempts) * 100) : 0
        };
    });

    // Score distribution
    const distribution = db.query(`
		SELECT 
			CASE
				WHEN percentage >= 90 THEN 'ممتاز (90-100%)'
				WHEN percentage >= 75 THEN 'جيد جداً (75-89%)'
				WHEN percentage >= 60 THEN 'جيد (60-74%)'
				WHEN percentage >= 40 THEN 'متوسط (40-59%)'
				ELSE 'ضعيف (0-39%)'
			END as range,
			COUNT(*) as count
		FROM quiz_attempts
		GROUP BY range
		ORDER BY MIN(percentage) DESC
	`).all();

    // Recent attempts (last 20)
    const recentAttempts = db.query(`
		SELECT qa.*, 
			   datetime(qa.created_at) as attempt_date
		FROM quiz_attempts qa
		ORDER BY qa.created_at DESC
		LIMIT 20
	`).all() as any[];

    const enrichedRecent = recentAttempts.map((a: any) => {
        const quiz = contentDb.query('SELECT title_ar, title FROM quizzes WHERE id = ?').get(a.quiz_id) as any;
        return {
            ...a,
            quizTitle: quiz?.title_ar || quiz?.title || `Quiz ${a.quiz_id}`
        };
    });

    db.close();
    contentDb.close();

    return json({
        overview: {
            totalAttempts: totalAttempts?.count || 0,
            avgScore: Math.round(avgScore?.avg || 0),
            totalQuizzes: totalQuizzes?.count || 0,
            totalQuestions: totalQuestions?.count || 0
        },
        quizStats: enrichedStats,
        distribution,
        recentAttempts: enrichedRecent
    });
}
