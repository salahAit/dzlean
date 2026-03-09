import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { contentDatabase, contentSchema } from '$lib/server/db/index';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const subjects = await contentDatabase.select().from(contentSchema.subjects).all();
    return { subjects };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const nameAr = formData.get('nameAr') as string;
        const nameFr = formData.get('nameFr') as string;
        const slug = formData.get('slug') as string;
        const icon = formData.get('icon') as string;
        const color = formData.get('color') as string;

        if (!id || !name || !nameAr || !nameFr || !slug) {
            return fail(400, { error: true, message: 'يرجى تعبئة جميع الحقول المطلوبة' });
        }

        try {
            await contentDatabase.insert(contentSchema.subjects).values({
                id,
                name,
                nameAr,
                nameFr,
                slug,
                icon: icon || null,
                color: color || null
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
        const icon = formData.get('icon') as string;
        const color = formData.get('color') as string;

        if (!originalId || !id || !name || !nameAr || !nameFr || !slug) {
            return fail(400, { error: true, message: 'يرجى تعبئة جميع الحقول المطلوبة' });
        }

        try {
            await contentDatabase.update(contentSchema.subjects)
                .set({
                    id,
                    name,
                    nameAr,
                    nameFr,
                    slug,
                    icon: icon || null,
                    color: color || null
                })
                .where(eq(contentSchema.subjects.id, originalId));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء التعديل. قد يكون المعرف أو الرابط موجوداً مسبقاً.' });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        if (!id) return fail(400, { error: true, message: 'معرف المادة مفقود' });

        try {
            await contentDatabase.delete(contentSchema.subjects).where(eq(contentSchema.subjects.id, id));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'لا يمكن حذف المادة لاحتوائها على بيانات مرتبطة' });
        }
    }
};
