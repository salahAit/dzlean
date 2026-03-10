<script lang="ts">
	import { onMount } from 'svelte';
	import { getBookmarkedIds, toggleBookmark, isBookmarked } from '$lib/stores/bookmarks.svelte';
	import { BookmarkX, Bookmark, FileText, Loader2, Inbox } from 'lucide-svelte';

	let docs = $state<any[]>([]);
	let isLoading = $state(true);

	onMount(async () => {
		const ids = getBookmarkedIds();
		if (ids.length === 0) {
			isLoading = false;
			return;
		}

		try {
			const res = await fetch(`/api/bookmarks?ids=${ids.join(',')}`);
			const data = await res.json();
			docs = data.documents;
		} catch (e) {
			console.error('Failed to load bookmarks', e);
		} finally {
			isLoading = false;
		}
	});

	function removeBookmark(docId: number) {
		toggleBookmark(docId);
		docs = docs.filter((d) => d.id !== docId);
	}

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل'
	};
</script>

<svelte:head>
	<title>المفضلة - SujetStore</title>
	<meta name="description" content="الوثائق المحفوظة في المفضلة" />
</svelte:head>

<section class="py-10 lg:py-14">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10"
			>
				<Bookmark size={32} class="text-amber-500" />
			</div>
			<h1 class="text-3xl font-extrabold">المفضلة</h1>
			<p class="text-muted-foreground mt-2">الوثائق التي قمت بحفظها للمراجعة لاحقاً</p>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center py-16">
				<Loader2 size={32} class="text-muted-foreground animate-spin" />
			</div>
		{:else if docs.length === 0}
			<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
				<Inbox size={48} class="mb-4 opacity-50" />
				<h3 class="mb-2 text-xl font-bold">لا توجد وثائق محفوظة</h3>
				<p class="text-sm">اضغط على أيقونة 🔖 بجانب أي وثيقة لحفظها هنا</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each docs as doc}
					<div
						class="bg-card flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all hover:bg-white/5 sm:flex-row sm:items-center"
					>
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex items-center gap-2">
								<h3 class="truncate font-bold">{doc.title_ar || doc.title}</h3>
								<span class="badge-{doc.type} shrink-0 rounded border px-1.5 py-0.5 text-[10px]">
									{typeLabels[doc.type] || doc.type}
								</span>
							</div>
							<div class="text-muted-foreground text-xs">
								{doc.level_name} · {doc.year_name} · {doc.subject_name}
							</div>
						</div>

						<div class="flex items-center gap-2">
							<a
								href="/{doc.level_slug}/{doc.year_slug}/{doc.subject_slug}"
								class="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-blue-700"
							>
								<FileText size={14} /> فتح المادة
							</a>
							<button
								onclick={() => removeBookmark(doc.id)}
								class="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition-all hover:bg-red-500/20"
								title="إزالة من المفضلة"
							>
								<BookmarkX size={14} /> إزالة
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
