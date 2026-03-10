<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { Search, Plus, Check, X, Database } from 'lucide-svelte';

	let {
		isOpen = $bindable(false),
		quizId,
		onImportSuccess
	} = $props<{
		isOpen: boolean;
		quizId: number;
		onImportSuccess: () => void;
	}>();

	let questions = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedQuestions = $state<Set<number>>(new Set());
	let importing = $state(false);

	onMount(async () => {
		if (isOpen) await loadQuestions();
	});

	// Reload if opened again
	$effect(() => {
		if (isOpen && questions.length === 0) {
			loadQuestions();
		}
	});

	async function loadQuestions() {
		loading = true;
		try {
			const res = await fetch('/api/admin/question-bank');
			if (res.ok) {
				const data = await res.json();
				questions = data.questions;
			}
		} finally {
			loading = false;
		}
	}

	let filteredQuestions = $derived(
		questions.filter((q) => {
			const searchPattern = searchQuery.toLowerCase();
			return (
				(q.questionText || '').toLowerCase().includes(searchPattern) ||
				(q.questionTextAr || '').toLowerCase().includes(searchPattern)
			);
		})
	);

	function toggleSelection(id: number) {
		if (selectedQuestions.has(id)) {
			selectedQuestions.delete(id);
		} else {
			selectedQuestions.add(id);
		}
		selectedQuestions = new Set(selectedQuestions); // trigger reactivity
	}

	async function importSelected() {
		if (selectedQuestions.size === 0) return;
		importing = true;

		try {
			// Import sequentially or parallel. Sequential is safer for ordering.
			for (const qId of Array.from(selectedQuestions)) {
				await fetch(`/api/admin/quizzes/${quizId}/questions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ questionId: qId, points: 1 })
				});
			}
			selectedQuestions.clear();
			isOpen = false;
			onImportSuccess();
		} catch (e) {
			alert('حدث خطأ أثناء الاستيراد');
		} finally {
			importing = false;
		}
	}

	const typeLabels: Record<string, string> = {
		mcq: 'اختيار من متعدد',
		true_false: 'صح أو خطأ',
		ordering: 'ترتيب متسلسل',
		drag_drop: 'تصنيف',
		matching: 'ربط',
		fill_blank: 'أكمل الفراغ',
		short_answer: 'إجابة قصيرة',
		cloze: 'اختيار من القائمة'
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="flex h-full max-h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-white/10 p-6">
				<div class="flex items-center gap-3">
					<Database class="text-emerald-500" size={24} />
					<h2 class="text-xl font-bold">استيراد من بنك الأسئلة الشامل</h2>
				</div>
				<button
					onclick={() => (isOpen = false)}
					class="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Search -->
			<div class="border-b border-white/10 p-4">
				<div class="relative max-w-lg">
					<Search class="absolute top-1/2 right-4 -translate-y-1/2 text-white/40" size={18} />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="البحث في نص السؤال..."
						class="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
					/>
				</div>
			</div>

			<!-- List -->
			<div class="flex-1 overflow-y-auto p-4">
				{#if loading}
					<div class="flex h-32 items-center justify-center">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"
						></div>
					</div>
				{:else if filteredQuestions.length === 0}
					<div class="flex h-32 flex-col items-center justify-center text-white/50">
						<p>لا توجد أسئلة مطابقة للبحث.</p>
					</div>
				{:else}
					<div class="grid gap-3">
						{#each filteredQuestions as q}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								class="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:bg-white/5 {selectedQuestions.has(
									q.id
								)
									? 'border-emerald-500 bg-emerald-500/10'
									: 'border-white/10'}"
								onclick={() => toggleSelection(q.id)}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start gap-4">
									<div
										class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border {selectedQuestions.has(
											q.id
										)
											? 'border-emerald-500 bg-emerald-500 text-white'
											: 'border-white/30 bg-transparent text-transparent'}"
									>
										<Check size={14} />
									</div>
									<div>
										<p class="line-clamp-2 max-w-2xl font-semibold text-white/90">
											{q.questionTextAr || q.questionText}
										</p>
										<p class="mt-1 flex items-center gap-2 text-xs text-white/50">
											<span class="rounded bg-white/10 px-2 py-0.5"
												>{typeLabels[q.type] || q.type}</span
											>
											<span class="opacity-50">•</span>
											<span
												class={q.difficulty === 'hard'
													? 'text-red-400'
													: q.difficulty === 'medium'
														? 'text-amber-400'
														: 'text-emerald-400'}
											>
												{q.difficulty === 'hard'
													? 'صعب'
													: q.difficulty === 'easy'
														? 'سهل'
														: 'متوسط'}
											</span>
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer Actions -->
			<div class="flex items-center justify-between border-t border-white/10 bg-black/20 p-6">
				<p class="text-sm font-semibold text-white/60">
					تم تحديد <span class="text-emerald-400">{selectedQuestions.size}</span> عناصر
				</p>
				<div class="flex gap-3">
					<button
						onclick={() => (isOpen = false)}
						class="rounded-xl bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
					>
						إلغاء
					</button>
					<button
						onclick={importSelected}
						disabled={selectedQuestions.size === 0 || importing}
						class="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 disabled:opacity-50"
					>
						{#if importing}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							جاري الاستيراد...
						{:else}
							<Plus size={18} /> استيراد الأسئلة
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
