import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../src/lib/server/db/schema-content';

const sqlite = new Database('data/content.db');
const db = drizzle(sqlite, { schema });

async function seed() {
    console.log('Seeding question categories and questions...');

    // Create root categories
    const mathCat = await db.insert(schema.questionCategories).values({
        name: 'الرياضيات',
        description: 'أسئلة مادة الرياضيات بمختلف فروعها'
    }).returning();

    const arabicCat = await db.insert(schema.questionCategories).values({
        name: 'اللغة العربية',
        description: 'أسئلة مادة اللغة العربية'
    }).returning();

    // Create sub categories
    const algebraCat = await db.insert(schema.questionCategories).values({
        name: 'الجبر',
        parentId: mathCat[0].id
    }).returning();

    const grammarCat = await db.insert(schema.questionCategories).values({
        name: 'القواعد',
        parentId: arabicCat[0].id
    }).returning();

    // Seed questions
    await db.insert(schema.questions).values([
        {
            categoryId: algebraCat[0].id,
            type: 'mcq',
            difficulty: 'easy',
            questionText: 'What is 5 x 5?',
            questionTextAr: 'ما هو حاصل ضرب 5 في 5؟',
            questionData: JSON.stringify({
                options: [
                    { id: '1', text: '10', isCorrect: false },
                    { id: '2', text: '25', isCorrect: true },
                    { id: '3', text: '20', isCorrect: false },
                    { id: '4', text: '15', isCorrect: false }
                ]
            }),
            explanation: '5 ضرب 5 يساوي 25.'
        },
        {
            categoryId: algebraCat[0].id,
            type: 'true_false',
            difficulty: 'medium',
            questionText: 'Is x + 2 = 5 means x = 3?',
            questionTextAr: 'هل المعادلة س + 2 = 5 تعني أن س = 3؟',
            questionData: JSON.stringify({
                correctAnswer: true
            }),
            explanation: 'بطرح 2 من الطرفين نجد أن س = 3'
        },
        {
            categoryId: grammarCat[0].id,
            type: 'mcq',
            difficulty: 'easy',
            questionText: 'Identify the subject in: The boy ate the apple.',
            questionTextAr: 'حدد الفاعل في الجملة: أكل الولد التفاحة.',
            questionData: JSON.stringify({
                options: [
                    { id: '1', text: 'أكل', isCorrect: false },
                    { id: '2', text: 'الولد', isCorrect: true },
                    { id: '3', text: 'التفاحة', isCorrect: false }
                ]
            }),
            explanation: 'الفاعل هو من قام بالفعل، وهو الولد.'
        }
    ]);

    console.log('Seed completed successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
