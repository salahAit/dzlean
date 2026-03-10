import { browser } from '$app/environment';

const STORAGE_KEY = 'bookmarked_docs';

function loadBookmarks(): Set<number> {
    if (!browser) return new Set();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return new Set(JSON.parse(stored));
    } catch (e) { }
    return new Set();
}

let bookmarks = $state<Set<number>>(loadBookmarks());

function save() {
    if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
    }
}

export function toggleBookmark(docId: number) {
    const next = new Set(bookmarks);
    if (next.has(docId)) {
        next.delete(docId);
    } else {
        next.add(docId);
    }
    bookmarks = next;
    save();
}

export function isBookmarked(docId: number): boolean {
    return bookmarks.has(docId);
}

export function getBookmarkedIds(): number[] {
    return [...bookmarks];
}

export function getBookmarkCount(): number {
    return bookmarks.size;
}
