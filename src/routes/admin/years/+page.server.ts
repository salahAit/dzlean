import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { contentDatabase, contentSchema } from '$lib/server/db/index';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const years = await contentDatabase.select().from(contentSchema.years).all();
    const levels = await contentDatabase.select().from(contentSchema.educationLevels).all();

    return { years, levels };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const nameAr = formData.get('nameAr') as string;
        const nameFr = formData.get('nameFr') as string;
        const slug = formData.get('slug') as string;
        const levelId = formData.get('levelId') as string;

        if (!id || !name || !nameAr || !nameFr || !slug || !levelId) {
            return fail(400, { error: true, message: 'يرجى تعبئة جميع الحقول المطلوبة' });
        }

        try {
            await contentDatabase.insert(contentSchema.years).values({
                id,
                levelId,
                name,
                nameAr,
                nameFr,
                slug,
                order: 0
            });
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء الإضافة. قد يكون المعرف أو الرابط موجوداً مسبقاً.' });
        }
    },
    update: async ({ request }) => {
        const formData = await request.formData();
        const originalId = formData.get('originalId') as string;
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const nameAr = formData.get('nameAr') as string;
        const nameFr = formData.get('nameFr') as string;
        const slug = formData.get('slug') as string;
        const levelId = formData.get('levelId') as string;

        if (!originalId || !id || !name || !nameAr || !nameFr || !slug || !levelId) {
            return fail(400, { error: true, message: 'يرجى تعبئة جميع الحقول المطلوبة' });
        }

        try {
            await contentDatabase.update(contentSchema.years)
                .set({
                    id,
                    levelId,
                    name,
                    nameAr,
                    nameFr,
                    slug
                })
                .where(eq(contentSchema.years.id, originalId));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء التعديل. قد يكون المعرف أو الرابط موجوداً مسبقاً.' });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        if (!id) return fail(400, { error: true, message: 'معرف السنة مفقود' });

        try {
            await contentDatabase.delete(contentSchema.years).where(eq(contentSchema.years.id, id));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'لا يمكن حذف السنة لاحتوائها على بيانات مرتبطة' });
        }
    }
};
