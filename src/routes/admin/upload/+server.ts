import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'static', 'uploads', 'documents');

export const POST: RequestHandler = async ({ request, locals }) => {
    // Auth check
    if (!locals.user) {
        throw error(401, 'غير مصرح');
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
        throw error(400, 'لم يتم تحديد ملف');
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
        throw error(400, 'يُسمح فقط بملفات PDF');
    }

    // Validate file size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        throw error(400, 'حجم الملف يتجاوز 20 ميجابايت');
    }

    // Generate unique filename
    const ext = path.extname(file.name) || '.pdf';
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/documents/${uniqueName}`;

    return json({
        url: publicUrl,
        filename: file.name,
        size: file.size
    });
};
