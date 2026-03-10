import { error } from '@sveltejs/kit';
import { contentDatabase } from '$lib/server/db';
import { questionCategories } from '$lib/server/db/schema-content';

export async function load({ locals }) {
    if (!locals.user || !['superadmin', 'admin'].includes(locals.user.role)) {
        throw error(403, 'Unauthorized');
    }

    try {
        const query = await contentDatabase.select().from(questionCategories);

        // Build tree in memory
        const tree: any[] = [];
        const map = new Map();

        // Initialize
        for (const cat of query) {
            map.set(cat.id, { ...cat, children: [] });
        }

        // Build tree
        for (const cat of query) {
            if (cat.parentId) {
                const parent = map.get(cat.parentId);
                if (parent) {
                    parent.children.push(map.get(cat.id));
                } else {
                    tree.push(map.get(cat.id)); // Orphan fallback
                }
            } else {
                tree.push(map.get(cat.id));
            }
        }

        return {
            categories: query, // flat
            tree // hierarchical
        };
    } catch (e) {
        console.error('Error loading categories:', e);
        throw error(500, 'Failed to load categories');
    }
}
