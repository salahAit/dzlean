import { contentDatabase } from '../src/lib/server/db';
import { questionCategories, questions } from '../src/lib/server/db/schema-content';
import { sql } from 'drizzle-orm';

async function updateCategories() {
    console.log('Resetting question categories...');

    try {
        // Insert category 1 first so we can assign orphans to it
        await contentDatabase.insert(questionCategories)
            .values({ id: 1, name: 'بنك الأسئلة الشامل (عام)', description: 'أسئلة عامة لجميع المستويات', parentId: null })
            .onConflictDoUpdate({ target: questionCategories.id, set: { name: 'بنك الأسئلة الشامل (عام)' } });

        // Link all existing questions to the general category instead of null
        await contentDatabase.update(questions).set({ categoryId: 1 });
        
        // Delete all categories except 1
        await contentDatabase.delete(questionCategories).where(sql`id != 1`);

        const newCategories = [
            
            { id: 2, name: 'التعليم الابتدائي', description: 'أسئلة المرحلة الابتدائية', parentId: 1 },
            { id: 3, name: 'السنة الخامسة ابتدائي (شهادة)', description: 'أسئلة امتحانات نهاية المرحلة', parentId: 2 },
            
            { id: 4, name: 'التعليم المتوسط', description: 'أسئلة المرحلة المتوسطة', parentId: 1 },
            { id: 5, name: 'السنة الرابعة متوسط (BEM)', description: 'أسئلة شهادة التعليم المتوسط', parentId: 4 },
            
            { id: 6, name: 'التعليم الثانوي', description: 'أسئلة المرحلة الثانوية', parentId: 1 },
            { id: 7, name: 'السنة الثالثة ثانوي (BAC)', description: 'أسئلة البكالوريا لجميع الشعب', parentId: 6 },
            
            { id: 8, name: 'مواد علمية (رياضيات، فيزياء، علوم)', description: 'أسئلة المواد العلمية والتقنية', parentId: 1 },
            { id: 9, name: 'مواد أدبية (عربية، فلسفة، تاريخ)', description: 'أسئلة المواد الأدبية والانسانية', parentId: 1 },
            { id: 10, name: 'لغات أجنبية (فرنسية، إنجليزية)', description: 'أسئلة اللغات الحية', parentId: 1 },

            { id: 11, name: 'تصنيف حسب العائلة البرمجية تقنيا', description: 'أسئلة مصنفة حسب طريقة التقييم', parentId: null },
            { id: 12, name: 'أسئلة الصح و الخطأ / خيارات (MCQ)', description: 'أسئلة ذات خيارات متعددة', parentId: 11 },
            { id: 13, name: 'أسئلة سحب وإفلات (تفاعلية)', description: 'أسئلة تفاعلية بالسحب والتصنيف', parentId: 11 },
            { id: 14, name: 'أسئلة مقالية وإنشاء (Essay)', description: 'أسئلة تتطلب كتابة نصوص', parentId: 11 },
            { id: 15, name: 'أسئلة صور (تحديد مناطق وسحب)', description: 'أسئلة Hotspot و DragToImage', parentId: 11 },
            { id: 16, name: 'أسئلة رياضية متقدمة (Calculated)', description: 'أسئلة حسابية متغيرة بدوال عشوائية', parentId: 11 }
        ];

        for (const cat of newCategories) {
            await contentDatabase.insert(questionCategories).values(cat);
        }

        console.log('Categories successfully updated to align with educational hierarchy and question types!');
    } catch (e) {
        console.error('Error updating categories: ', e);
    }
}

updateCategories().catch(console.error);
