import { Database } from "bun:sqlite";
const db = new Database("data/content.db");

// 1. Add missing columns safely
const cols = (db.query("PRAGMA table_info(quizzes)").all() as any[]).map((c: any) => c.name);
const newCols: [string, string][] = [
    ['shuffle_options', 'INTEGER DEFAULT 0'],
    ['max_attempts', 'INTEGER DEFAULT 0'],
    ['grading_method', "TEXT DEFAULT 'best'"],
    ['show_answers', 'INTEGER DEFAULT 1'],
    ['practice_mode', 'INTEGER DEFAULT 0'],
];
for (const [name, type] of newCols) {
    if (!cols.includes(name)) { db.run(`ALTER TABLE quizzes ADD COLUMN ${name} ${type}`); console.log(`✅ Added: ${name}`); }
    else console.log(`⏭️  Exists: ${name}`);
}

// 2. Categories
console.log("\n📚 Creating categories...");
function addCat(name: string, pid: number | null, ysId: number | null): number {
    const e = db.query("SELECT id FROM question_categories WHERE name = ? AND parent_id IS ?").get(name, pid) as any;
    if (e) return e.id;
    db.run("INSERT INTO question_categories (name, parent_id, year_subject_id) VALUES (?, ?, ?)", [name, pid, ysId]);
    return (db.query("SELECT last_insert_rowid() as id").get() as any).id;
}

const catPrim = addCat("الطور الابتدائي", null, null);
const catMid = addCat("الطور المتوسط", null, null);
const catSec = addCat("الطور الثانوي", null, null);

const catMathP = addCat("رياضيات - ابتدائي", catPrim, null);
const catArabP = addCat("لغة عربية - ابتدائي", catPrim, null);
const catMathM = addCat("رياضيات - متوسط", catMid, null);
const catPhysM = addCat("فيزياء - متوسط", catMid, null);
const catArabM = addCat("لغة عربية - متوسط", catMid, null);
const catMathS = addCat("رياضيات - ثانوي", catSec, null);
const catPhysS = addCat("فيزياء - ثانوي", catSec, null);
const catSciS = addCat("علوم طبيعية - ثانوي", catSec, null);

const catArith = addCat("الحساب والعمليات", catMathP, null);
const catGeom = addCat("الهندسة", catMathP, null);
const catGram = addCat("القواعد النحوية", catArabP, null);
const catAlg = addCat("الجبر", catMathM, null);
const catElec = addCat("الكهرباء", catPhysM, null);
const catGramM = addCat("الإعراب والصرف", catArabM, null);
const catAnal = addCat("التحليل والدوال", catMathS, null);
const catMech = addCat("الميكانيك", catPhysS, null);
const catBio = addCat("علم الأحياء", catSciS, null);
const catMaster = addCat("تمرين شامل (14 نوع)", catSec, null);

// 3. Questions
console.log("\n📝 Adding questions...");
function addQ(cat: number, type: string, diff: string, text: string, tAr: string, data: any, exp: string) {
    db.run(`INSERT INTO questions (category_id, type, difficulty, question_text, question_text_ar, question_data, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cat, type, diff, text, tAr, JSON.stringify(data), exp]);
}

// رياضيات ابتدائي
addQ(catArith, 'mcq', 'easy', '3×7=?', 'ما حاصل ضرب 3 × 7 ؟', { options: [{ id: "1", text: "18", isCorrect: false }, { id: "2", text: "21", isCorrect: true }, { id: "3", text: "24", isCorrect: false }, { id: "4", text: "27", isCorrect: false }] }, '3 × 7 = 21');
addQ(catArith, 'mcq', 'easy', '8×6=?', 'ما حاصل ضرب 8 × 6 ؟', { options: [{ id: "1", text: "42", isCorrect: false }, { id: "2", text: "46", isCorrect: false }, { id: "3", text: "48", isCorrect: true }, { id: "4", text: "56", isCorrect: false }] }, '8 × 6 = 48');
addQ(catArith, 'true_false', 'easy', '15÷3', 'هل العدد 15 يقبل القسمة على 3 ؟', { correctAnswer: true }, '15 ÷ 3 = 5');
addQ(catArith, 'true_false', 'easy', '0 even', 'هل الصفر عدد زوجي ؟', { correctAnswer: true }, 'الصفر عدد زوجي لأنه يقبل القسمة على 2');
addQ(catArith, 'fill_blank', 'easy', '45+?=100', 'أكمل: 45 + ___ = 100', { sentence: "45 + ___ = 100", answers: ["55"] }, '100 - 45 = 55');
addQ(catArith, 'ordering', 'easy', 'Order nums', 'رتّب الأعداد تصاعدياً', { items: ["125", "89", "201", "56", "150"], correctOrder: [3, 1, 0, 4, 2] }, '56 ← 89 ← 125 ← 150 ← 201');
addQ(catGeom, 'mcq', 'medium', 'Hexagon sides', 'كم عدد أضلاع الشكل السداسي ؟', { options: [{ id: "1", text: "5", isCorrect: false }, { id: "2", text: "6", isCorrect: true }, { id: "3", text: "7", isCorrect: false }, { id: "4", text: "8", isCorrect: false }] }, 'السداسي = 6 أضلاع');
addQ(catArith, 'calculated', 'hard', 'Perimeter', 'احسب محيط مستطيل طوله {a} وعرضه {b}', { formula: "({a} + {b}) * 2", displayTemplate: "الطول = {a} ، العرض = {b}", variables: [{ name: "a", min: 10, max: 20 }, { name: "b", min: 1, max: 9 }], tolerance: 0 }, 'المحيط = (الطول + العرض) × 2');
// لغة عربية ابتدائي
addQ(catGram, 'mcq', 'medium', 'Subject', 'ما إعراب "التلميذُ" في: كتبَ التلميذُ الدرسَ ؟', { options: [{ id: "1", text: "مفعول به", isCorrect: false }, { id: "2", text: "فاعل مرفوع", isCorrect: true }, { id: "3", text: "مبتدأ", isCorrect: false }, { id: "4", text: "خبر", isCorrect: false }] }, '"التلميذُ" فاعل مرفوع بالضمة');
addQ(catGram, 'true_false', 'easy', 'Hamza', 'الهمزة في كلمة "سأل" همزة وصل', { correctAnswer: false }, 'الهمزة في "سأل" همزة قطع');
addQ(catGram, 'fill_blank', 'medium', 'Complete', 'أكمل: ذهبَ ___ إلى المدرسة', { sentence: "ذهبَ ___ إلى المدرسة", answers: ["الولدُ", "الولد"] }, '"الولدُ" فاعل مرفوع');
addQ(catGram, 'sentence_reorder', 'easy', 'Reorder', 'رتب الكلمات لتكوين جملة مفيدة:', { words: ["التلميذُ", "الدرسَ", "كتبَ"], correctOrder: [2, 0, 1] }, 'كتب التلميذ الدرس');
addQ(catGram, 'essay', 'medium', 'Essay', 'اكتب فقرة قصيرة عن فضل العلم (تحتوي على كلمتي "نور" و "المستقبل"):', { minWords: 10, maxWords: 50, keywords: ["نور", "المستقبل"], minKeywords: 2 }, 'تقييم معتمد على الكلمات المفتاحية وطول النص');
// رياضيات متوسط
addQ(catAlg, 'mcq', 'medium', 'Solve', 'حل المعادلة: 2س + 6 = 20', { options: [{ id: "1", text: "س = 5", isCorrect: false }, { id: "2", text: "س = 7", isCorrect: true }, { id: "3", text: "س = 8", isCorrect: false }, { id: "4", text: "س = 10", isCorrect: false }] }, '2س = 14 ← س = 7');
addQ(catAlg, 'mcq', 'hard', 'Factor', 'حلّل: س² - 9', { options: [{ id: "1", text: "(س-3)(س+3)", isCorrect: true }, { id: "2", text: "(س-9)(س+1)", isCorrect: false }, { id: "3", text: "(س-3)²", isCorrect: false }, { id: "4", text: "(س+3)²", isCorrect: false }] }, 'فرق مربعين: (س-3)(س+3)');
addQ(catAlg, 'true_false', 'medium', 'Ineq', 'إذا كان س > 5 فإن 2س > 10', { correctAnswer: true }, 'ضرب بعدد موجب يحافظ على الاتجاه');
addQ(catAlg, 'short_answer', 'hard', 'System', 'حل: س + ص = 10 و س - ص = 4', { keywords: ["7", "3"], minKeywords: 2 }, 'س = 7 ، ص = 3');

// فيزياء متوسط
addQ(catElec, 'mcq', 'medium', 'Current unit', 'ما وحدة قياس شدة التيار الكهربائي ؟', { options: [{ id: "1", text: "فولط (V)", isCorrect: false }, { id: "2", text: "أمبير (A)", isCorrect: true }, { id: "3", text: "أوم (Ω)", isCorrect: false }, { id: "4", text: "واط (W)", isCorrect: false }] }, 'الأمبير (A)');
addQ(catElec, 'matching', 'medium', 'Units', 'صل بين الكمية ووحدتها', { pairs: [{ left: "شدة التيار", right: "أمبير" }, { left: "التوتر", right: "فولط" }, { left: "المقاومة", right: "أوم" }, { left: "القدرة", right: "واط" }] }, 'التيار↔أمبير، التوتر↔فولط، المقاومة↔أوم، القدرة↔واط');
addQ(catElec, 'true_false', 'easy', 'Series', 'في التسلسل، شدة التيار ثابتة في جميع النقاط', { correctAnswer: true }, 'التيار نفسه يمر في جميع العناصر');
addQ(catElec, 'drag_drop', 'medium', 'Classify', 'صنّف إلى موصلات وعوازل', { items: [{ text: "النحاس", category: "موصلات" }, { text: "الخشب", category: "عوازل" }, { text: "الحديد", category: "موصلات" }, { text: "البلاستيك", category: "عوازل" }, { text: "الألمنيوم", category: "موصلات" }, { text: "المطاط", category: "عوازل" }], categories: ["موصلات", "عوازل"] }, 'المعادن موصلات، الخشب والبلاستيك عوازل');

// لغة عربية متوسط
addQ(catGramM, 'mcq', 'medium', 'Parse', 'ما إعراب "الكتابَ" في: قرأتُ الكتابَ ؟', { options: [{ id: "1", text: "فاعل", isCorrect: false }, { id: "2", text: "مفعول به منصوب", isCorrect: true }, { id: "3", text: "مبتدأ", isCorrect: false }, { id: "4", text: "اسم مجرور", isCorrect: false }] }, '"الكتابَ" مفعول به منصوب بالفتحة');
addQ(catGramM, 'cloze', 'medium', 'Choose', 'اختر: ذهب المعلمون ___ المدرسة', { sentence: "ذهب المعلمون ___ المدرسة", options: ["إلى", "على", "في", "من"], correctIndex: 0 }, 'حرف الجر "إلى" للوجهة');

// رياضيات ثانوي
addQ(catAnal, 'mcq', 'hard', 'Derivative', 'ما مشتقة: د(س) = 3س² + 2س - 5 ؟', { options: [{ id: "1", text: "6س + 2", isCorrect: true }, { id: "2", text: "3س + 2", isCorrect: false }, { id: "3", text: "6س² + 2", isCorrect: false }, { id: "4", text: "6س - 5", isCorrect: false }] }, 'مشتقة 3س² = 6س ، مشتقة 2س = 2 ← 6س + 2');
addQ(catAnal, 'true_false', 'hard', 'Limit', 'نهاية 1/س عندما س→∞ تساوي 0', { correctAnswer: true }, 'lim(1/x) = 0 عندما x → ∞');
addQ(catAnal, 'fill_blank', 'hard', 'Integral', 'أكمل: ∫2س dس = ___ + C', { sentence: "∫2س dس = ___ + C", answers: ["س²", "س^2", "x²", "x^2"] }, '∫2x dx = x² + C');

// فيزياء ثانوي
addQ(catMech, 'mcq', 'hard', 'Newton', 'ينص قانون نيوتن الثاني على:', { options: [{ id: "1", text: "F = m × a", isCorrect: true }, { id: "2", text: "F = m × v", isCorrect: false }, { id: "3", text: "E = m × c²", isCorrect: false }, { id: "4", text: "P = m × g", isCorrect: false }] }, 'F = m·a');
addQ(catMech, 'ordering', 'medium', 'Planets', 'رتّب الكواكب حسب بعدها عن الشمس', { items: ["المريخ", "الزهرة", "عطارد", "الأرض"], correctOrder: [2, 1, 3, 0] }, 'عطارد ← الزهرة ← الأرض ← المريخ');
addQ(catMech, 'matching', 'hard', 'Formulas', 'صل بين الكمية والعلاقة', { pairs: [{ left: "السرعة", right: "v = d/t" }, { left: "التسارع", right: "a = Δv/Δt" }, { left: "الطاقة الحركية", right: "Ec = ½mv²" }, { left: "الشغل", right: "W = F×d" }] }, 'v=d/t, a=Δv/Δt, Ec=½mv², W=F×d');

// علوم طبيعية ثانوي
addQ(catBio, 'mcq', 'medium', 'Cell', 'ما العضية المسؤولة عن التنفس الخلوي ؟', { options: [{ id: "1", text: "النواة", isCorrect: false }, { id: "2", text: "الميتوكوندريا", isCorrect: true }, { id: "3", text: "الريبوسوم", isCorrect: false }, { id: "4", text: "جهاز غولجي", isCorrect: false }] }, 'الميتوكوندريا = محطة الطاقة');
addQ(catBio, 'true_false', 'medium', 'DNA', 'الحمض النووي DNA يتواجد فقط في نواة الخلية', { correctAnswer: false }, 'DNA في النواة وكذلك في الميتوكوندريا');
addQ(catBio, 'drag_drop', 'hard', 'Classify', 'صنّف إلى حقيقيات وبدائيات النوى', { items: [{ text: "البكتيريا", category: "بدائيات النوى" }, { text: "الفطريات", category: "حقيقيات النوى" }, { text: "البكتيريا الزرقاء", category: "بدائيات النوى" }, { text: "الإنسان", category: "حقيقيات النوى" }, { text: "النباتات", category: "حقيقيات النوى" }], categories: ["حقيقيات النوى", "بدائيات النوى"] }, 'البكتيريا بدائية، الفطريات والإنسان والنباتات حقيقية');
addQ(catBio, 'matrix', 'hard', 'Matrix', 'حدد خصائص كل كائن:', { statements: ["يحتوي على جدار خلوي", "يملك نواة حقيقية", "ذاتي التغذية"], columns: ["النبات", "الحيوان"], correctAnswers: [0, 1, 0] }, 'النباتات ذاتية ولها جدار خلوي');

// Master Quiz (14 Types)
addQ(catMaster, 'mcq', 'medium', 'MCQ', 'كم عدد أضلاع الشكل السداسي؟ (اختيار من متعدد)', { options: [{ id: "1", text: "5", isCorrect: false }, { id: "2", text: "6", isCorrect: true }, { id: "3", text: "7", isCorrect: false }, { id: "4", text: "8", isCorrect: false }] }, 'السداسي = 6 أضلاع');
addQ(catMaster, 'true_false', 'easy', 'TF', 'الهمزة في كلمة "سأل" همزة وصل (صح أم خطأ)', { correctAnswer: false }, 'الهمزة في "سأل" همزة قطع');
addQ(catMaster, 'fill_blank', 'easy', 'Fill', 'أكمل الفراغ: 45 + ___ = 100', { sentence: "45 + ___ = 100", answers: ["55"] }, '100 - 45 = 55');
addQ(catMaster, 'drag_drop', 'hard', 'Drag', 'صنّف إلى حقيقيات وبدائيات النوى (سحب وإفلات للتصنيف)', { items: [{ text: "البكتيريا", category: "بدائيات النوى" }, { text: "الفطريات", category: "حقيقيات النوى" }], categories: ["حقيقيات النوى", "بدائيات النوى"] }, 'البكتيريا بدائية');
addQ(catMaster, 'ordering', 'easy', 'Order', 'رتّب الأعداد تصاعدياً (ترتيب)', { items: ["125", "89", "201", "56"], correctOrder: [3, 1, 0, 2] }, '56 ← 89 ← 125 ← 201');
addQ(catMaster, 'matching', 'medium', 'Match', 'اربط الكلمة بمرادفها (سحب وإفلات للمطابقة)', { pairs: [{ left: "سعيد", right: "مسرور" }, { left: "سريع", right: "عاجل" }] }, 'سعيد=مسرور، سريع=عاجل');
addQ(catMaster, 'short_answer', 'medium', 'Short', 'من هو مكتشف الجاذبية؟ (إجابة قصيرة)', { keywords: ["نيوتن", "إسحاق نيوتن"], minKeywords: 1 }, 'العالم الإنجليزي إسحاق نيوتن');
addQ(catMaster, 'cloze', 'medium', 'Cloze', 'اختر الكلمة المناسبة (قائمة منسدلة): ذهب المعلمون ___ المدرسة', { sentence: "ذهب المعلمون ___ المدرسة", options: ["إلى", "على", "في"], correctIndex: 0 }, 'حرف الجر "إلى" للوجهة');
addQ(catMaster, 'calculated', 'hard', 'Calc', 'احسب محيط مستطيل طوله {a} وعرضه {b} (سؤال رياضي متغير الأرقام عشوائياً)', { formula: "({a} + {b}) * 2", displayTemplate: "الطول = {a} ، العرض = {b}", variables: [{ name: "a", min: 10, max: 20 }, { name: "b", min: 1, max: 9 }], tolerance: 0 }, 'المحيط = (الطول + العرض) × 2');
addQ(catMaster, 'sentence_reorder', 'easy', 'Sentence', 'رتب الكلمات لتكوين جملة مفيدة (سحب الكلمات لتكوين جملة):', { words: ["التلميذُ", "الدرسَ", "كتبَ"], correctOrder: [2, 0, 1] }, 'كتب التلميذ الدرس');
addQ(catMaster, 'essay', 'medium', 'Essay', 'اكتب فقرة قصيرة عن فضل العلم تحتوي على كلمة "نور" (مقال حر مع تصحيح ذكي عبر الكلمات المفتاحية):', { minWords: 5, maxWords: 50, keywords: ["نور"], minKeywords: 1 }, 'تقييم معتمد على الكلمات المفتاحية');
addQ(catMaster, 'matrix', 'hard', 'Matrix', 'حدد خصائص كل كائن (شبكة اختيارات):', { statements: ["يحتوي على جدار خلوي", "يملك نواة حقيقية"], columns: ["النبات", "الحيوان"], correctAnswers: [0, 1] }, 'النباتات لها جدار خلوي');
addQ(catMaster, 'hotspot', 'medium', 'Hotspot', 'اضغط على الدائرة المعبرة عن البطين الأيسر (تحديد منطقة على الصورة):', { imageUrl: "/images/heart.png", zones: [{ x: 55, y: 70, radius: 15, label: "البطين الأيسر" }, { x: 35, y: 70, radius: 15, label: "البطين الأيمن" }], correctZone: 0 }, 'الجزء السفلي الأيسر');
addQ(catMaster, 'drag_to_image', 'medium', 'DragToImage', 'ضع المسميات على الخلية الحيوانية (السحب والإفلات على الصورة):', { imageUrl: "/images/cell.png", labels: [{ text: "النواة", correctX: 50, correctY: 50 }, { text: "غشاء الخلية", correctX: 85, correctY: 50 }] }, 'النواة في المنتصف');
// 4. Create quizzes
console.log("\n🎮 Creating quizzes...");
function findYS(lSlug: string, sSlug: string): number | null {
    const r = db.query("SELECT ys.id FROM year_subjects ys JOIN years y ON ys.year_id=y.id JOIN education_levels el ON y.level_id=el.id WHERE el.slug=? AND ys.subject_id=? LIMIT 1").get(lSlug, sSlug) as any;
    return r?.id || null;
}

const allQs = db.query("SELECT id, category_id FROM questions ORDER BY id").all() as any[];

function createQuiz(ysId: number, tId: string, title: string, tAr: string, slug: string, desc: string, diff: string, tl: number, cats: number[]) {
    if (db.query("SELECT id FROM quizzes WHERE slug=?").get(slug)) { console.log(`⏭️  ${slug} exists`); return; }
    db.run(`INSERT INTO quizzes (year_subject_id,trimester_id,title,title_ar,slug,description,difficulty,time_limit,question_count,passing_score,is_premium,is_published,shuffle_options,practice_mode,show_answers) VALUES(?,?,?,?,?,?,?,?,0,60,0,1,1,1,1)`,
        [ysId, tId, title, tAr, slug, desc, diff, tl]);
    const qzId = (db.query("SELECT last_insert_rowid() as id").get() as any).id;
    const qs = allQs.filter((q: any) => cats.includes(q.category_id));
    qs.forEach((q: any, i: number) => db.run(`INSERT INTO quiz_questions (quiz_id,question_id,"order",points) VALUES(?,?,?,2)`, [qzId, q.id, i + 1]));
    db.run("UPDATE quizzes SET question_count=? WHERE id=?", [qs.length, qzId]);
    console.log(`✅ ${tAr} (${qs.length} qs)`);
}

const pMath = findYS('primaire', 'MAT-B');
const pArb = findYS('primaire', 'ARB-B');
const mMath = findYS('moyen', 'MAT-B');
const mPhys = findYS('moyen', 'PHY-B');
const sMath = findYS('secondaire', 'MAT-SE');
const sPhys = findYS('secondaire', 'PHY-SE');
const sSci = findYS('secondaire', 'SCI-SE');

if (pMath) createQuiz(pMath, 't1', 'Primary Math', 'تمرين رياضيات - ابتدائي', 'primary-math-quiz', 'تمرين شامل في الحساب والهندسة', 'easy', 600, [catArith, catGeom]);
if (pArb) createQuiz(pArb, 't1', 'Primary Arabic', 'تمرين لغة عربية - ابتدائي', 'primary-arabic-quiz', 'تمرين في النحو والإملاء', 'easy', 600, [catGram]);
if (mMath) createQuiz(mMath, 't1', 'Middle Algebra', 'تمرين الجبر - متوسط', 'middle-algebra-quiz', 'تمرين في المعادلات والتحليل', 'medium', 900, [catAlg]);
if (mPhys) createQuiz(mPhys, 't2', 'Middle Physics', 'تمرين الفيزياء - متوسط', 'middle-physics-quiz', 'تمرين في الكهرباء والموصلات', 'medium', 600, [catElec]);
if (sMath) createQuiz(sMath, 't1', 'Secondary Analysis', 'تمرين التحليل - ثانوي', 'secondary-analysis-quiz', 'تمرين في المشتقات والتكامل', 'hard', 1200, [catAnal]);
if (sPhys) createQuiz(sPhys, 't2', 'Secondary Mechanics', 'تمرين الميكانيك - ثانوي', 'secondary-mechanics-quiz', 'تمرين في قوانين نيوتن والحركة', 'hard', 900, [catMech]);
if (sSci) {
    createQuiz(sSci, 't1', 'Secondary Biology', 'تمرين علوم طبيعية - ثانوي', 'secondary-biology-quiz', 'تمرين في الخلية والوراثة', 'medium', 600, [catBio]);
    createQuiz(sSci, 't1', 'All Question Types Master', 'تمرين شامل - 14 نوع (للتجربة)', 'master-quiz-14', 'تمرين تجريبي مميز يحتوي على جميع أنواع الأسئلة التفاعلية الأربعة عشر المتاحة في المنصة.', 'hard', 2400, [catMaster]);
}

// Summary
const fQ = (db.query("SELECT COUNT(*) as c FROM questions").get() as any).c;
const fQz = (db.query("SELECT COUNT(*) as c FROM quizzes").get() as any).c;
const fCat = (db.query("SELECT COUNT(*) as c FROM question_categories").get() as any).c;
const fL = (db.query("SELECT COUNT(*) as c FROM quiz_questions").get() as any).c;
console.log(`\n🎉 Done! Categories:${fCat} Questions:${fQ} Quizzes:${fQz} Links:${fL}`);
db.close();
