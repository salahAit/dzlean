import { Database } from "bun:sqlite";
const db = new Database("data/content.db");

const questions = db.query("SELECT id, type, question_data FROM questions WHERE type IN ('hotspot', 'drag_to_image')").all() as any[];
let count = 0;
for (const q of questions) {
    const data = JSON.parse(q.question_data);
    let updated = false;
    if (data.imageUrl && data.imageUrl.includes('wikimedia')) {
        if (q.type === 'hotspot') {
            data.imageUrl = '/images/heart.png';
            updated = true;
        }
        if (q.type === 'drag_to_image') {
            data.imageUrl = '/images/cell.png';
            updated = true;
        }
    }
    if (updated) {
        db.query("UPDATE questions SET question_data = ? WHERE id = ?").run(JSON.stringify(data), q.id);
        console.log(`✅ Updated image for question ${q.id} (${q.type})`);
        count++;
    }
}
console.log(`Migration complete. Updated ${count} questions.`);
