/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install: cache all static assets and force the waiting service worker to become the active service worker
self.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(
		addFilesToCache().then(() => {
			// Skip waiting ensures the new service worker activates immediately
			return self.skipWaiting();
		})
	);
});

// Activate: claim clients and remove old caches
self.addEventListener('activate', (event) => {
	async function deleteOldCachesAndClaim() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
		// Claim clients ensures the service worker controls all open pages immediately
		await self.clients.claim();
	}
	event.waitUntil(deleteOldCachesAndClaim());
});

// Fetch: Stale-While-Revalidate strategy for better auto-updating
self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	// Don't intercept API requests or extension requests
	const url = new URL(event.request.url);
	if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) return;

	async function respond() {
		const cache = await caches.open(CACHE);

		// Serve build files and static assets from cache FIRST (Fast response)
		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) {
				// In the background, fetch the latest version and update the cache (Stale-While-Revalidate)
				event.waitUntil(
					fetch(event.request).then((networkResponse) => {
						if (networkResponse.ok) {
							cache.put(event.request, networkResponse.clone());
						}
					}).catch(() => {
						// Offline, ignore fetch error
					})
				);
				return cachedResponse;
			}
		}

		// For dynamic pages/content: Network First, fallback to cache
		try {
			const response = await fetch(event.request);
			if (response.status === 200 && url.origin === self.location.origin) {
				// We only cache valid local responses
				event.waitUntil(cache.put(event.request, response.clone()));
			}
			return response;
		} catch (err) {
			// If network fails (Offline), try the cache
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) {
				return cachedResponse;
			}
			// If neither network nor cache has the resource, return a generic offline error
			throw err;
		}
	}

	event.respondWith(respond());
});

// Listen for message from clients to force an update
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
