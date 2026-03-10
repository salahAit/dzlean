import { json } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questionCategories } from '$lib/server/db/schema-content';
import { eq } from 'drizzle-orm';

// Get all question categories
export async function GET({ locals }) {
    if (!locals.user || !['superadmin', 'admin', 'editor'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const categories = await contentDatabase.select().from(questionCategories);

        // Build tree in memory
        const tree: any[] = [];
        const map = new Map();

        // 1. Initialize map
        for (const cat of categories) {
            map.set(cat.id, { ...cat, children: [] });
        }

        // 2. Build tree hierarchy
        for (const cat of categories) {
            if (cat.parentId) {
                const parent = map.get(cat.parentId);
                if (parent) {
                    parent.children.push(map.get(cat.id));
                } else {
                    // Orphan fallback
                    tree.push(map.get(cat.id));
                }
            } else {
                tree.push(map.get(cat.id));
            }
        }

        return json({
            success: true,
            categories, // flat list for simple lookups
            tree       // hierarchical tree for UI
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// Create a new category
export async function POST({ request, locals }) {
    if (!locals.user || !['superadmin', 'admin'].includes(locals.user.role)) {
        return json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const data = await request.json();

        const newCategory = await contentDatabase
            .insert(questionCategories)
            .values({
                name: data.name,
                description: data.description || null,
                parentId: data.parentId || null,
                yearSubjectId: data.yearSubjectId || null
            })
            .returning();

        return json({ success: true, category: newCategory[0] });
    } catch (error) {
        console.error('Error creating category:', error);
        return json({ error: 'Failed to create category' }, { status: 500 });
    }
}
