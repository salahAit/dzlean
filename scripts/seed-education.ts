/**
 * سكريبت البيانات الأولية - المنهج الجزائري
 * bun run scripts/seed-education.ts
 */
import { Database } from 'bun:sqlite';

const db = new Database('data/content.db');

// Enable WAL mode
db.exec('PRAGMA journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS education_levels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS years (
    id TEXT PRIMARY KEY,
    level_id TEXT NOT NULL REFERENCES education_levels(id),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    stream TEXT
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    color TEXT
  );

  CREATE TABLE IF NOT EXISTS year_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_id TEXT NOT NULL REFERENCES years(id),
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    coefficient INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS trimesters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_subject_id INTEGER NOT NULL REFERENCES year_subjects(id),
    trimester_id TEXT REFERENCES trimesters(id),
    title TEXT NOT NULL,
    title_ar TEXT,
    slug TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('exam', 'test', 'lesson', 'summary', 'exercise', 'solution')),
    content TEXT,
    pdf_url TEXT,
    file_size INTEGER,
    source TEXT,
    academic_year TEXT,
    has_solution INTEGER DEFAULT 0,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    download_count INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );
`);

// ============================================
// 1. المراحل التعليمية
// ============================================
const levels = [
	{
		id: 'primaire',
		name: 'التعليم الابتدائي',
		name_ar: 'التعليم الابتدائي',
		name_fr: 'Enseignement Primaire',
		slug: 'primaire',
		description: 'المرحلة الابتدائية من السنة الأولى إلى السنة الخامسة',
		icon: '🎒',
		color: '#10b981',
		order: 1
	},
	{
		id: 'moyen',
		name: 'التعليم المتوسط',
		name_ar: 'التعليم المتوسط',
		name_fr: 'Enseignement Moyen',
		slug: 'moyen',
		description: 'المرحلة المتوسطة من السنة الأولى إلى السنة الرابعة',
		icon: '📚',
		color: '#3b82f6',
		order: 2
	},
	{
		id: 'secondaire',
		name: 'التعليم الثانوي',
		name_ar: 'التعليم الثانوي',
		name_fr: 'Enseignement Secondaire',
		slug: 'secondaire',
		description: 'المرحلة الثانوية من السنة الأولى إلى السنة الثالثة',
		icon: '🎓',
		color: '#8b5cf6',
		order: 3
	}
];

// ============================================
// 2. السنوات الدراسية
// ============================================
const yearsData = [
	// ابتدائي
	{
		id: '1ap',
		level_id: 'primaire',
		name: 'السنة الأولى ابتدائي',
		name_ar: 'السنة الأولى ابتدائي',
		name_fr: '1ère Année Primaire',
		slug: '1ap',
		order: 1
	},
	{
		id: '2ap',
		level_id: 'primaire',
		name: 'السنة الثانية ابتدائي',
		name_ar: 'السنة الثانية ابتدائي',
		name_fr: '2ème Année Primaire',
		slug: '2ap',
		order: 2
	},
	{
		id: '3ap',
		level_id: 'primaire',
		name: 'السنة الثالثة ابتدائي',
		name_ar: 'السنة الثالثة ابتدائي',
		name_fr: '3ème Année Primaire',
		slug: '3ap',
		order: 3
	},
	{
		id: '4ap',
		level_id: 'primaire',
		name: 'السنة الرابعة ابتدائي',
		name_ar: 'السنة الرابعة ابتدائي',
		name_fr: '4ème Année Primaire',
		slug: '4ap',
		order: 4
	},
	{
		id: '5ap',
		level_id: 'primaire',
		name: 'السنة الخامسة ابتدائي',
		name_ar: 'السنة الخامسة ابتدائي',
		name_fr: '5ème Année Primaire',
		slug: '5ap',
		order: 5
	},
	// متوسط
	{
		id: '1am',
		level_id: 'moyen',
		name: 'السنة الأولى متوسط',
		name_ar: 'السنة الأولى متوسط',
		name_fr: '1ère Année Moyenne',
		slug: '1am',
		order: 1
	},
	{
		id: '2am',
		level_id: 'moyen',
		name: 'السنة الثانية متوسط',
		name_ar: 'السنة الثانية متوسط',
		name_fr: '2ème Année Moyenne',
		slug: '2am',
		order: 2
	},
	{
		id: '3am',
		level_id: 'moyen',
		name: 'السنة الثالثة متوسط',
		name_ar: 'السنة الثالثة متوسط',
		name_fr: '3ème Année Moyenne',
		slug: '3am',
		order: 3
	},
	{
		id: '4am',
		level_id: 'moyen',
		name: 'السنة الرابعة متوسط',
		name_ar: 'السنة الرابعة متوسط',
		name_fr: '4ème Année Moyenne',
		slug: '4am',
		order: 4
	},
	// ثانوي
	{
		id: '1as',
		level_id: 'secondaire',
		name: 'السنة الأولى ثانوي',
		name_ar: 'السنة الأولى ثانوي',
		name_fr: '1ère Année Secondaire',
		slug: '1as',
		order: 1
	},
	{
		id: '2as',
		level_id: 'secondaire',
		name: 'السنة الثانية ثانوي',
		name_ar: 'السنة الثانية ثانوي',
		name_fr: '2ème Année Secondaire',
		slug: '2as',
		order: 2
	},
	{
		id: '3as',
		level_id: 'secondaire',
		name: 'السنة الثالثة ثانوي',
		name_ar: 'السنة الثالثة ثانوي',
		name_fr: '3ème Année Secondaire',
		slug: '3as',
		order: 3
	}
];

// ============================================
// 3. المواد الدراسية
// ============================================
const subjectsData = [
	{
		id: 'math',
		name: 'الرياضيات',
		name_ar: 'الرياضيات',
		name_fr: 'Mathématiques',
		slug: 'math',
		icon: '📐',
		color: '#ef4444'
	},
	{
		id: 'arabic',
		name: 'اللغة العربية',
		name_ar: 'اللغة العربية',
		name_fr: 'Langue Arabe',
		slug: 'arabic',
		icon: '📝',
		color: '#10b981'
	},
	{
		id: 'french',
		name: 'اللغة الفرنسية',
		name_ar: 'اللغة الفرنسية',
		name_fr: 'Langue Française',
		slug: 'french',
		icon: '🇫🇷',
		color: '#3b82f6'
	},
	{
		id: 'english',
		name: 'اللغة الإنجليزية',
		name_ar: 'اللغة الإنجليزية',
		name_fr: 'Langue Anglaise',
		slug: 'english',
		icon: '🇬🇧',
		color: '#6366f1'
	},
	{
		id: 'science',
		name: 'العلوم الطبيعية',
		name_ar: 'العلوم الطبيعية',
		name_fr: 'Sciences Naturelles',
		slug: 'science',
		icon: '🔬',
		color: '#22c55e'
	},
	{
		id: 'physics',
		name: 'الفيزياء',
		name_ar: 'العلوم الفيزيائية',
		name_fr: 'Sciences Physiques',
		slug: 'physics',
		icon: '⚡',
		color: '#f59e0b'
	},
	{
		id: 'history',
		name: 'التاريخ والجغرافيا',
		name_ar: 'التاريخ والجغرافيا',
		name_fr: 'Histoire-Géographie',
		slug: 'history',
		icon: '🌍',
		color: '#8b5cf6'
	},
	{
		id: 'islamic',
		name: 'التربية الإسلامية',
		name_ar: 'التربية الإسلامية',
		name_fr: 'Éducation Islamique',
		slug: 'islamic',
		icon: '🕌',
		color: '#059669'
	},
	{
		id: 'civic',
		name: 'التربية المدنية',
		name_ar: 'التربية المدنية',
		name_fr: 'Éducation Civique',
		slug: 'civic',
		icon: '⚖️',
		color: '#0891b2'
	},
	{
		id: 'philosophy',
		name: 'الفلسفة',
		name_ar: 'الفلسفة',
		name_fr: 'Philosophie',
		slug: 'philosophy',
		icon: '💭',
		color: '#7c3aed'
	},
	{
		id: 'informatics',
		name: 'الإعلام الآلي',
		name_ar: 'الإعلام الآلي',
		name_fr: 'Informatique',
		slug: 'informatics',
		icon: '💻',
		color: '#0ea5e9'
	}
];

// ============================================
// 4. الفصول الدراسية
// ============================================
const trimestersData = [
	{ id: 't1', name: 'الفصل الأول', name_ar: 'الفصل الأول', name_fr: '1er Trimestre', order: 1 },
	{ id: 't2', name: 'الفصل الثاني', name_ar: 'الفصل الثاني', name_fr: '2ème Trimestre', order: 2 },
	{ id: 't3', name: 'الفصل الثالث', name_ar: 'الفصل الثالث', name_fr: '3ème Trimestre', order: 3 }
];

// ============================================
// 5. ربط المواد بالسنوات
// ============================================
const yearSubjectsMap: Record<string, string[]> = {
	// ابتدائي (أقل مواد)
	'1ap': ['math', 'arabic', 'french', 'islamic', 'civic'],
	'2ap': ['math', 'arabic', 'french', 'islamic', 'civic'],
	'3ap': ['math', 'arabic', 'french', 'islamic', 'civic', 'science', 'history'],
	'4ap': ['math', 'arabic', 'french', 'islamic', 'civic', 'science', 'history'],
	'5ap': ['math', 'arabic', 'french', 'islamic', 'civic', 'science', 'history'],
	// متوسط
	'1am': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'civic',
		'informatics'
	],
	'2am': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'civic',
		'informatics'
	],
	'3am': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'civic',
		'informatics'
	],
	'4am': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'civic',
		'informatics'
	],
	// ثانوي
	'1as': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'philosophy',
		'informatics'
	],
	'2as': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'philosophy',
		'informatics'
	],
	'3as': [
		'math',
		'arabic',
		'french',
		'english',
		'science',
		'physics',
		'history',
		'islamic',
		'philosophy',
		'informatics'
	]
};

// ============================================
// SEED EXECUTION
// ============================================

console.log('🌱 بدء ملء قاعدة البيانات...\n');

// Clear existing data
db.exec('DELETE FROM documents');
db.exec('DELETE FROM year_subjects');
db.exec('DELETE FROM trimesters');
db.exec('DELETE FROM subjects');
db.exec('DELETE FROM years');
db.exec('DELETE FROM education_levels');

// Insert levels
const insertLevel = db.prepare(
	'INSERT INTO education_levels (id, name, name_ar, name_fr, slug, description, icon, color, "order") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const l of levels) {
	insertLevel.run(
		l.id,
		l.name,
		l.name_ar,
		l.name_fr,
		l.slug,
		l.description,
		l.icon,
		l.color,
		l.order
	);
}
console.log(`✅ ${levels.length} مراحل تعليمية`);

// Insert years
const insertYear = db.prepare(
	'INSERT INTO years (id, level_id, name, name_ar, name_fr, slug, "order") VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const y of yearsData) {
	insertYear.run(y.id, y.level_id, y.name, y.name_ar, y.name_fr, y.slug, y.order);
}
console.log(`✅ ${yearsData.length} سنة دراسية`);

// Insert subjects
const insertSubject = db.prepare(
	'INSERT INTO subjects (id, name, name_ar, name_fr, slug, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const s of subjectsData) {
	insertSubject.run(s.id, s.name, s.name_ar, s.name_fr, s.slug, s.icon, s.color);
}
console.log(`✅ ${subjectsData.length} مادة دراسية`);

// Insert trimesters
const insertTrimester = db.prepare(
	'INSERT INTO trimesters (id, name, name_ar, name_fr, "order") VALUES (?, ?, ?, ?, ?)'
);
for (const t of trimestersData) {
	insertTrimester.run(t.id, t.name, t.name_ar, t.name_fr, t.order);
}
console.log(`✅ ${trimestersData.length} فصول دراسية`);

// Insert year-subjects mapping
const insertYearSubject = db.prepare(
	'INSERT INTO year_subjects (year_id, subject_id, "order") VALUES (?, ?, ?)'
);
let ysCount = 0;
for (const [yearId, subjectIds] of Object.entries(yearSubjectsMap)) {
	for (let i = 0; i < subjectIds.length; i++) {
		insertYearSubject.run(yearId, subjectIds[i], i + 1);
		ysCount++;
	}
}
console.log(`✅ ${ysCount} ربط مادة-سنة`);

// Insert sample documents for 1AM (السنة الأولى متوسط) as examples
const insertDoc = db.prepare(
	`INSERT INTO documents (year_subject_id, trimester_id, title, title_ar, slug, type, source, academic_year, has_solution, difficulty)
	 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

// Get year_subject IDs for 1am
const ysRows = db
	.query('SELECT id, subject_id FROM year_subjects WHERE year_id = ?')
	.all('1am') as { id: number; subject_id: string }[];

let docCount = 0;
for (const ys of ysRows) {
	const subjectName = subjectsData.find((s) => s.id === ys.subject_id)?.name_ar || ys.subject_id;

	for (const trim of trimestersData) {
		// فرض
		insertDoc.run(
			ys.id,
			trim.id,
			`فرض ${trim.name_ar} في ${subjectName} - السنة الأولى متوسط`,
			`فرض ${trim.name_ar} في ${subjectName}`,
			`test-${ys.subject_id}-${trim.id}-1am`,
			'test',
			'نموذج مقترح',
			'2024/2025',
			1,
			'medium'
		);
		docCount++;

		// اختبار
		insertDoc.run(
			ys.id,
			trim.id,
			`اختبار ${trim.name_ar} في ${subjectName} - السنة الأولى متوسط`,
			`اختبار ${trim.name_ar} في ${subjectName}`,
			`exam-${ys.subject_id}-${trim.id}-1am`,
			'exam',
			'نموذج رسمي',
			'2024/2025',
			1,
			'medium'
		);
		docCount++;
	}

	// درس واحد لكل مادة
	insertDoc.run(
		ys.id,
		null,
		`ملخص دروس ${subjectName} - السنة الأولى متوسط`,
		`ملخص دروس ${subjectName}`,
		`summary-${ys.subject_id}-1am`,
		'summary',
		'ملخص شامل',
		'2024/2025',
		0,
		'easy'
	);
	docCount++;
}

console.log(`✅ ${docCount} وثيقة تمثيلية`);
console.log('\n🎉 تم ملء قاعدة البيانات بنجاح!');

db.close();
