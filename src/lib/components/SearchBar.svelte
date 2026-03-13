<script lang="ts">
	import { Search, X, FileText, FileEdit, BookOpen, Loader2, Brain } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);
	let query = $state('');
	let results = $state<any[]>([]);
	let isLoading = $state(false);
	let selectedIndex = $state(-1);
	let inputRef = $state<HTMLInputElement | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout>;

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل',
		quiz: 'تمرين تفاعلي'
	};

	function open() {
		isOpen = true;
		query = '';
		results = [];
		selectedIndex = -1;
		setTimeout(() => inputRef?.focus(), 100);
	}

	function close() {
		isOpen = false;
		query = '';
		results = [];
	}

	async function search(q: string) {
		if (q.length < 2) {
			results = [];
			return;
		}
		isLoading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
			const data = await res.json();
			results = data.results;
			selectedIndex = -1;
		} catch (e) {
			results = [];
		} finally {
			isLoading = false;
		}
	}

	function onInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => search(query), 250);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (e.key === 'Enter' && selectedIndex >= 0) {
			e.preventDefault();
			navigateTo(results[selectedIndex]);
		} else if (e.key === 'Escape') {
			close();
		}
	}

	function navigateTo(doc: any) {
		close();
		if (doc.type === 'quiz') {
			goto(`/quizzes/${doc.slug}`);
		} else {
			goto(`/${doc.level_slug}/${doc.year_slug}/${doc.subject_slug}`);
		}
	}

	// Global keyboard shortcut Ctrl+K
	function onGlobalKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			if (isOpen) close();
			else open();
		}
	}
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<!-- Search Trigger Button -->
<button
	onclick={open}
	class="text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg border border-black/5 bg-black/5 px-3 py-1.5 text-sm transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
	title="بحث (Ctrl+K)"
>
	<Search size={16} />
	<span class="hidden sm:inline">بحث...</span>
	<kbd
		class="bg-muted text-muted-foreground hidden rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline"
		>Ctrl+K</kbd
	>
</button>

<!-- Search Modal -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-100 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div
			class="bg-card w-full max-w-lg overflow-hidden rounded-xl border border-black/5 shadow-2xl dark:border-white/10"
		>
			<!-- Search Input -->
			<div class="flex items-center gap-3 border-b border-black/5 px-4 py-3 dark:border-white/10">
				<Search size={20} class="text-muted-foreground shrink-0" />
				<input
					bind:this={inputRef}
					bind:value={query}
					oninput={onInput}
					onkeydown={onKeydown}
					type="text"
					placeholder="ابحث عن فروض، اختبارات، تمارين تفاعلية..."
					class="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-base outline-none"
				/>
				{#if isLoading}
					<Loader2 size={18} class="text-muted-foreground shrink-0 animate-spin" />
				{:else if query.length > 0}
					<button
						onclick={() => {
							query = '';
							results = [];
							inputRef?.focus();
						}}
						class="text-muted-foreground hover:text-foreground p-1 transition-colors"
						title="مسح البحث"
					>
						<X size={18} />
					</button>
				{/if}

				<!-- Persistent Close Button -->
				<button
					onclick={close}
					class="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 transition-colors hover:bg-red-500/20"
					title="إغلاق (Esc)"
				>
					<X size={18} class="text-red-500" />
				</button>
			</div>

			<!-- Results -->
			<div class="max-h-[50vh] overflow-y-auto">
				{#if results.length > 0}
					{#each results as doc, i}
						<button
							onclick={() => navigateTo(doc)}
							class="flex w-full items-start gap-3 px-4 py-3 text-right transition-colors {i ===
							selectedIndex
								? 'bg-primary/10 text-primary'
								: 'hover:bg-black/5 dark:hover:bg-white/5'}"
						>
							<div
								class="text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5"
							>
								{#if doc.type === 'exam'}
									<FileText size={16} />
								{:else if doc.type === 'test'}
									<FileEdit size={16} />
								{:else if doc.type === 'quiz'}
									<Brain size={16} />
								{:else}
									<BookOpen size={16} />
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="truncate text-sm font-bold">{doc.title_ar || doc.title}</span>
									<span class="badge-{doc.type} shrink-0 rounded border px-1.5 py-0.5 text-[10px]">
										{typeLabels[doc.type] || doc.type}
									</span>
								</div>
								<div class="text-muted-foreground mt-0.5 text-xs">
									{doc.level_name} · {doc.year_name} · {doc.subject_name}
								</div>
							</div>
						</button>
					{/each}
				{:else if query.length >= 2 && !isLoading}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">
						لا توجد نتائج لـ "{query}"
					</div>
				{:else if query.length === 0}
					<div class="text-muted-foreground px-4 py-8 text-center text-sm">
						اكتب كلمتين على الأقل للبحث
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="text-muted-foreground flex items-center justify-between border-t border-black/5 px-4 py-2 text-xs dark:border-white/10"
			>
				<span>↑↓ للتنقل · Enter للفتح · Esc للإغلاق</span>
			</div>
		</div>
	</div>
{/if}
