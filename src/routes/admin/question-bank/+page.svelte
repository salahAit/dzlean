<script lang="ts">
	import { onMount } from 'svelte';
	import { Database, Plus, Edit, Trash2, Search, Filter, Eye, X } from 'lucide-svelte';

	let questions = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedType = $state('all');
	let selectedDifficulty = $state('all');

	// Preview state
	let previewQuestion = $state<any>(null);

	onMount(async () => {
		await loadQuestions();
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

	async function deleteQuestion(id: number) {
		if (confirm('هل أنت متأكد من حذف هذا السؤال نهائياً من بنك الأسئلة؟')) {
			const res = await fetch(`/api/admin/question-bank/${id}`, { method: 'DELETE' });
			if (res.ok) await loadQuestions();
		}
	}

	function openPreview(q: any) {
		previewQuestion = q;
	}

	function closePreview() {
		previewQuestion = null;
	}

	let filteredQuestions = $derived(
		questions.filter((q) => {
			const matchesSearch =
				(q.questionText || '').includes(searchQuery) ||
				(q.questionTextAr || '').includes(searchQuery);
			const matchesType = selectedType === 'all' || q.type === selectedType;
			const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
			return matchesSearch && matchesType && matchesDifficulty;
		})
	);

	const typeLabels: Record<string, string> = {
		mcq: 'اختيار من متعدد',
		true_false: 'صح أو خطأ',
		ordering: 'ترتيب متسلسل',
		drag_drop: 'تصنيف (سحب وإفلات)',
		matching: 'ربط',
		fill_blank: 'أكمل الفراغ',
		short_answer: 'إجابة قصيرة',
		cloze: 'اختيار من القائمة'
	};
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-3 text-2xl font-bold">
			<Database size={28} class="text-emerald-500" /> بنك الأسئلة الشامل
		</h1>
		<div class="flex items-center gap-3">
			<a
				href="/admin/question-bank/categories"
				class="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
			>
				إدارة التصنيفات
			</a>
			<a
				href="/admin/question-bank/new"
				class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
			>
				<Plus size={18} /> إضافة سؤال جديد
			</a>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="mb-6 flex flex-col gap-4 md:flex-row">
		<div class="relative flex-1">
			<Search class="absolute top-1/2 right-4 -translate-y-1/2 text-white/40" size={18} />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="ابحث في نص السؤال..."
				class="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-4 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
			/>
		</div>
		<div class="flex gap-4">
			<div class="relative">
				<Filter class="absolute top-1/2 right-4 -translate-y-1/2 text-white/40" size={16} />
				<select
					bind:value={selectedType}
					class="w-48 appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-4 text-sm font-medium transition-colors outline-none hover:bg-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
				>
					<option value="all" class="bg-[#1a1b26]">كل الأنواع</option>
					{#each Object.entries(typeLabels) as [val, label]}
						<option value={val} class="bg-[#1a1b26]">{label}</option>
					{/each}
				</select>
			</div>
			<select
				bind:value={selectedDifficulty}
				class="w-40 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-colors outline-none hover:bg-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
			>
				<option value="all" class="bg-[#1a1b26]">كل المستويات</option>
				<option value="easy" class="bg-[#1a1b26]">سهل</option>
				<option value="medium" class="bg-[#1a1b26]">متوسط</option>
				<option value="hard" class="bg-[#1a1b26]">صعب</option>
			</select>
		</div>
	</div>

	{#if loading}
		<div class="flex h-32 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1">
			<table class="w-full border-collapse text-right">
				<thead class="border-b border-white/10 bg-white/5 text-sm font-medium text-white/60">
					<tr>
						<th class="p-4">التصنيف</th>
						<th class="p-4">نص السؤال</th>
						<th class="p-4">النوع</th>
						<th class="p-4">الصعوبة</th>
						<th class="p-4 text-left">إجراءات</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each filteredQuestions as q}
						<tr class="transition-colors hover:bg-white/5">
							<td class="w-48 p-4 font-mono text-sm text-emerald-400">
								{#if q.categoryName}
									{q.categoryName}
								{:else}
									<span class="truncate text-white/30">غير مصنف</span>
								{/if}
							</td>
							<td class="p-4">
								<p class="line-clamp-2 max-w-lg font-medium text-white/90">
									{q.questionTextAr || q.questionText}
								</p>
							</td>
							<td class="p-4">
								<span
									class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400"
								>
									{typeLabels[q.type] || q.type}
								</span>
							</td>
							<td class="p-4">
								<span class="rounded bg-white/10 px-2.5 py-1 text-xs text-white/60"
									>{q.difficulty || 'medium'}</span
								>
							</td>
							<td class="p-4 text-left">
								<div class="flex items-center justify-end gap-2">
									<button
										onclick={() => openPreview(q)}
										class="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 transition-colors hover:bg-emerald-500/20"
										title="معاينة"
									>
										<Eye size={18} />
									</button>
									<a
										href={`/admin/question-bank/${q.id}/edit`}
										class="rounded-lg bg-white/5 p-2 text-white transition-colors hover:bg-white/10 hover:text-white"
										title="تعديل"
									>
										<Edit size={18} />
									</a>
									<button
										onclick={() => deleteQuestion(q.id)}
										class="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
										title="حذف"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if filteredQuestions.length === 0}
						<tr>
							<td colspan="5" class="p-8 text-center text-white/50">لا توجد أسئلة مطابقة</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if previewQuestion}
	<!-- Preview Modal -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
		onclick={closePreview}
		role="presentation"
	>
		<div
			class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a] p-8 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<button
				onclick={closePreview}
				class="absolute top-4 left-4 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
			>
				<X size={20} />
			</button>

			<div class="mb-6 border-b border-white/10 pb-4">
				<h2 class="flex items-center gap-2 text-2xl font-bold">
					<Eye class="text-emerald-500" /> معاينة سريعة للسؤال
				</h2>
				<div class="mt-2 flex gap-2">
					<span
						class="inline-flex items-center gap-1 rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300"
					>
						نوع السؤال: {typeLabels[previewQuestion.type] || previewQuestion.type}
					</span>
					<span class="rounded bg-white/10 px-2.5 py-1 text-xs text-white/60">
						الصعوبة: {previewQuestion.difficulty}
					</span>
				</div>
			</div>

			<div class="space-y-6">
				{#if previewQuestion.questionTextAr}
					<div>
						<h3 class="mb-1 text-sm font-semibold text-white/50">النص بالعربية:</h3>
						<p class="text-xl font-medium whitespace-pre-wrap text-white">
							{previewQuestion.questionTextAr}
						</p>
					</div>
				{/if}

				{#if previewQuestion.questionText}
					<div dir="ltr">
						<h3 class="mb-1 text-right text-sm font-semibold text-white/50">نص اللغة الأجنبية:</h3>
						<p class="text-left text-xl font-medium whitespace-pre-wrap text-white">
							{previewQuestion.questionText}
						</p>
					</div>
				{/if}

				<div
					class="relative overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-relaxed text-yellow-300/80"
				>
					<div class="absolute top-2 right-4 text-xs font-bold text-white/20 select-none">
						بيانات السؤال (JSON)
					</div>
					<pre>{JSON.stringify(JSON.parse(previewQuestion.questionData || '{}'), null, 2)}</pre>
				</div>

				{#if previewQuestion.explanation}
					<div class="relative rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
						<div class="absolute top-2 right-4 text-xs font-bold text-blue-500/40 select-none">
							شرح / تلميح
						</div>
						<p class="mt-4 whitespace-pre-wrap text-blue-200">{previewQuestion.explanation}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
