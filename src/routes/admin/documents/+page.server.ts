import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { contentDatabase, contentSchema } from '$lib/server/db/index';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    const documents = await contentDatabase.select().from(contentSchema.documents).orderBy(contentSchema.documents.id);
    const trimesters = await contentDatabase.select().from(contentSchema.trimesters).all();

    // Complex join to get readable Year-Subject names and slugs for Preview URLs
    const yearSubjectsQuery = await contentDatabase
        .select({
            id: contentSchema.yearSubjects.id,
            yearAr: contentSchema.years.nameAr,
            subjectAr: contentSchema.subjects.nameAr,
            yearSlug: contentSchema.years.slug,
            subjectSlug: contentSchema.subjects.slug,
            levelSlug: contentSchema.educationLevels.slug
        })
        .from(contentSchema.yearSubjects)
        .innerJoin(contentSchema.years, eq(contentSchema.yearSubjects.yearId, contentSchema.years.id))
        .innerJoin(contentSchema.educationLevels, eq(contentSchema.years.levelId, contentSchema.educationLevels.id))
        .innerJoin(contentSchema.subjects, eq(contentSchema.yearSubjects.subjectId, contentSchema.subjects.id))
        .all();

    return { documents, trimesters, yearSubjects: yearSubjectsQuery };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        const yearSubjectId = parseInt(formData.get('yearSubjectId') as string);
        const type = formData.get('type') as any;

        const trimesterId = formData.get('trimesterId') as string || null;
        const pdfUrl = formData.get('pdfUrl') as string || null;
        const solutionUrl = formData.get('solutionUrl') as string || null;
        const academicYear = formData.get('academicYear') as string || null;
        const source = formData.get('source') as string || null;

        if (!title || !slug || !yearSubjectId || !type) {
            return fail(400, { error: true, message: 'يرجى تعبئة الحقول الأساسية: العنوان، الرابط، المادة الفئة والنوع' });
        }

        try {
            await contentDatabase.insert(contentSchema.documents).values({
                title,
                titleAr: title,
                slug,
                yearSubjectId,
                type,
                trimesterId,
                pdfUrl,
                solutionUrl,
                year: academicYear,
                source,
                hasSolution: !!solutionUrl,
                isPublished: true
            });
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء إضافة الوثيقة' });
        }
    },
    update: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        const yearSubjectId = parseInt(formData.get('yearSubjectId') as string);
        const type = formData.get('type') as any;

        const trimesterId = formData.get('trimesterId') as string || null;
        const pdfUrl = formData.get('pdfUrl') as string || null;
        const solutionUrl = formData.get('solutionUrl') as string || null;
        const academicYear = formData.get('academicYear') as string || null;
        const source = formData.get('source') as string || null;

        if (!id || !title || !slug || !yearSubjectId || !type) {
            return fail(400, { error: true, message: 'يرجى تعبئة الحقول الأساسية' });
        }

        try {
            await contentDatabase.update(contentSchema.documents)
                .set({
                    title,
                    titleAr: title,
                    slug,
                    yearSubjectId,
                    type,
                    trimesterId,
                    pdfUrl,
                    solutionUrl,
                    year: academicYear,
                    source,
                    hasSolution: !!solutionUrl,
                })
                .where(eq(contentSchema.documents.id, id));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء التعديل' });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = parseInt(formData.get('id') as string);
        if (!id) return fail(400, { error: true, message: 'معرف الوثيقة مفقود' });

        try {
            await contentDatabase.delete(contentSchema.documents).where(eq(contentSchema.documents.id, id));
            return { success: true };
        } catch (err) {
            return fail(500, { error: true, message: 'حدث خطأ أثناء الحذف' });
        }
    }
};
