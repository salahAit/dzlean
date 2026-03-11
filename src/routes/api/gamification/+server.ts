import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import Database from 'better-sqlite3';

const usersDb = new Database('data/users.db');

// Ensure gamification tables exist
usersDb.exec(`
	CREATE TABLE IF NOT EXISTS badge_definitions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		slug TEXT NOT NULL UNIQUE,
		name TEXT NOT NULL,
		name_ar TEXT NOT NULL,
		description TEXT,
		icon TEXT NOT NULL,
		color TEXT DEFAULT '#3b82f6',
		condition TEXT NOT NULL,
		points INTEGER DEFAULT 10,
		created_at TEXT DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS user_badges (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fingerprint TEXT NOT NULL,
		badge_id INTEGER NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
		earned_at TEXT DEFAULT (datetime('now'))
	);

	CREATE TABLE IF NOT EXISTS user_points (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		fingerprint TEXT NOT NULL,
		points INTEGER NOT NULL,
		reason TEXT NOT NULL,
		quiz_id INTEGER,
		earned_at TEXT DEFAULT (datetime('now'))
	);
`);

// Seed default badges if empty
const badgeCount = usersDb.prepare('SELECT COUNT(*) as c FROM badge_definitions').get() as any;
if (badgeCount.c === 0) {
	const insert = usersDb.prepare('INSERT INTO badge_definitions (slug, name, name_ar, description, icon, color, condition, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
	const badges = [
		['first_quiz', 'First Quiz', 'التمرين الأول', 'أكمل تمرينك الأول', '🎯', '#3b82f6', '{"type":"quiz_count","threshold":1}', 10],
		['five_quizzes', 'Quiz Explorer', 'مستكشف التمارين', 'أكمل 5 تمارين', '📚', '#8b5cf6', '{"type":"quiz_count","threshold":5}', 25],
		['ten_quizzes', 'Quiz Master', 'خبير التمارين', 'أكمل 10 تمارين', '🏆', '#f59e0b', '{"type":"quiz_count","threshold":10}', 50],
		['perfect_score', 'Perfect Score', 'نتيجة مثالية', 'احصل على 100% في تمرين', '⭐', '#10b981', '{"type":"perfect_score","threshold":100}', 30],
		['speed_demon', 'Speed Demon', 'سريع البرق', 'أكمل تمرين في أقل من دقيقة', '⚡', '#ef4444', '{"type":"time_under","threshold":60}', 20],
		['streak_3', 'Hot Streak', 'سلسلة ناجحة', 'احصل على 80%+ في 3 تمارين متتالية', '🔥', '#f97316', '{"type":"streak","threshold":3}', 40],
		['all_types', 'Versatile', 'متعدد المهارات', 'جرّب 5 أنواع مختلفة من الأسئلة', '🎪', '#06b6d4', '{"type":"question_types","threshold":5}', 35],
		['hundred_points', 'Centurion', 'المائة نقطة', 'اجمع 100 نقطة', '💯', '#ec4899', '{"type":"total_points","threshold":100}', 20],
	];
	for (const b of badges) {
		insert.run(...b);
	}
}

export async function GET({ cookies }: RequestEvent) {
	const fingerprint = cookies.get('fp') || 'anonymous';

	// Get all badges
	const allBadges = usersDb.prepare('SELECT * FROM badge_definitions ORDER BY id').all();

	// Get user's earned badges
	const earnedBadges = usersDb.prepare(
		'SELECT badge_id FROM user_badges WHERE fingerprint = ?'
	).all(fingerprint) as any[];
	const earnedSet = new Set(earnedBadges.map((b: any) => b.badge_id));

	// Get user's total points
	const pointsRow = usersDb.prepare(
		'SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE fingerprint = ?'
	).get(fingerprint) as any;

	// Get points history
	const history = usersDb.prepare(
		'SELECT * FROM user_points WHERE fingerprint = ? ORDER BY earned_at DESC LIMIT 20'
	).all(fingerprint);

	// Get leaderboard (top 10)
	const leaderboard = usersDb.prepare(`
		SELECT fingerprint, SUM(points) as total_points, COUNT(DISTINCT quiz_id) as quizzes
		FROM user_points
		GROUP BY fingerprint
		ORDER BY total_points DESC
		LIMIT 10
	`).all();

	// Get quiz attempt count for this user
	const attemptCount = usersDb.prepare(
		'SELECT COUNT(*) as c FROM quiz_attempts WHERE fingerprint = ?'
	).get(fingerprint) as any;

	return json({
		badges: allBadges.map((b: any) => ({
			...b,
			earned: earnedSet.has(b.id),
			condition: JSON.parse(b.condition || '{}')
		})),
		totalPoints: pointsRow.total,
		history,
		leaderboard,
		quizCount: attemptCount?.c || 0
	});
}
