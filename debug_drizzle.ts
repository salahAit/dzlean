import { contentDatabase } from './src/lib/server/db';
import { questions } from './src/lib/server/db/schema-content';

const q = await contentDatabase.select().from(questions).limit(1);
console.log("Type of questionData:", typeof q[0].questionData);
console.log("questionData:", JSON.stringify(q[0].questionData, null, 2));
process.exit(0);
