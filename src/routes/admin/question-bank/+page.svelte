<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Database,
		Plus,
		Edit,
		Trash2,
		Search,
		Filter,
		Eye,
		X,
		CheckCircle,
		XCircle,
		Download,
		Upload,
		Copy
	} from 'lucide-svelte';

	import MCQ from '$lib/components/questions/MCQ.svelte';
	import TrueFalse from '$lib/components/questions/TrueFalse.svelte';
	import Ordering from '$lib/components/questions/Ordering.svelte';
	import DragDrop from '$lib/components/questions/DragDrop.svelte';
	import Matching from '$lib/components/questions/Matching.svelte';
	import FillBlank from '$lib/components/questions/FillBlank.svelte';
	import ShortAnswer from '$lib/components/questions/ShortAnswer.svelte';
	import Cloze from '$lib/components/questions/Cloze.svelte';
	import Calculated from '$lib/components/questions/Calculated.svelte';
	import SentenceReorder from '$lib/components/questions/SentenceReorder.svelte';
	import Hotspot from '$lib/components/questions/Hotspot.svelte';
	import DragToImage from '$lib/components/questions/DragToImage.svelte';
	import Matrix from '$lib/components/questions/Matrix.svelte';
	import Essay from '$lib/components/questions/Essay.svelte';

	let questions = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedType = $state('all');
	let selectedDifficulty = $state('all');

	// Preview state
	let previewQuestion = $state<any>(null);
	let previewAnswer = $state<any>(null);
	let previewResult = $state<boolean | null>(null);

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

	async function duplicateQuestion(q: any) {
		try {
			const res = await fetch('/api/admin/question-bank', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					categoryId: q.categoryId,
					type: q.type,
					difficulty: q.difficulty,
					questionText: q.questionText + ' (نسخة)',
					questionTextAr: (q.questionTextAr || '') + ' (نسخة)',
					questionData:
						typeof q.questionData === 'string' ? q.questionData : JSON.stringify(q.questionData),
					explanation: q.explanation
				})
			});
			if (res.ok) await loadQuestions();
		} catch (e) {
			console.error('Failed to duplicate', e);
		}
	}

	async function exportQuestions() {
		const res = await fetch('/api/admin/question-bank/export');
		const data = await res.json();
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `question-bank-export-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	let fileInput: HTMLInputElement;
	async function importQuestions(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			const res = await fetch('/api/admin/question-bank/import', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			const result = await res.json();
			if (res.ok) {
				alert(
					`تم استيراد ${result.importedQuestions} سؤال و ${result.importedCategories} تصنيف بنجاح!`
				);
				await loadQuestions();
			} else {
				alert('خطأ في الاستيراد: ' + result.error);
			}
		} catch (e: any) {
			alert('خطأ في قراءة الملف: ' + e.message);
		}
		target.value = '';
	}

	function openPreview(q: any) {
		previewQuestion = q;
		previewAnswer = null;
		previewResult = null;
	}

	function closePreview() {
		previewQuestion = null;
		previewAnswer = null;
		previewResult = null;
	}

	function onAnswer(answer: any) {
		previewAnswer = answer;
	}

	function checkPreviewAnswer() {
		if (!previewQuestion) return;

		const qd =
			typeof previewQuestion.questionData === 'string'
				? JSON.parse(previewQuestion.questionData)
				: previewQuestion.questionData;

		const answer = previewAnswer;

		switch (previewQuestion.type) {
			case 'mcq': {
				const correctIdx = qd.correctIndexes
					? qd.correctIndexes
					: (qd.options || [])
							.map((opt: any, i: number) => (typeof opt === 'object' && opt.isCorrect ? i : -1))
							.filter((i: number) => i >= 0);
				previewResult = JSON.stringify(answer?.selectedIndexes) === JSON.stringify(correctIdx);
				break;
			}
			case 'true_false':
				previewResult = answer?.value === qd.correctAnswer;
				break;
			case 'ordering':
				if (!answer?.order) {
					previewResult = false;
					break;
				}
				const correctItems = qd.correctOrder.map((idx: number) => qd.items[idx]);
				previewResult = JSON.stringify(answer.order) === JSON.stringify(correctItems);
				break;
			case 'drag_drop':
				if (!answer?.assignments) {
					previewResult = false;
					break;
				}
				previewResult = qd.items.every(
					(item: any) => answer.assignments[item.text] === item.category
				);
				break;
			case 'matching':
				if (!answer?.matches) {
					previewResult = false;
					break;
				}
				previewResult = Object.entries(answer.matches).every(
					([left, right]) => Number(left) === Number(right)
				);
				break;
			case 'fill_blank':
				if (!answer?.text) {
					previewResult = false;
					break;
				}
				previewResult = qd.answers.some(
					(a: string) => a.toLowerCase().trim() === answer.text.toLowerCase().trim()
				);
				break;
			case 'short_answer':
				if (!answer?.text) {
					previewResult = false;
					break;
				}
				const matchCount = qd.keywords.filter((kw: string) => answer.text.includes(kw)).length;
				previewResult = matchCount >= (qd.minKeywords || 1);
				break;
			case 'cloze':
				previewResult = answer?.selectedIndex === qd.correctIndex;
				break;
			default:
				previewResult = false;
		}
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
			<button
				onclick={exportQuestions}
				class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
			>
				<Download size={16} /> تصدير
			</button>
			<button
				onclick={() => fileInput?.click()}
				class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/10"
			>
				<Upload size={16} /> استيراد
			</button>
			<input
				type="file"
				accept=".json"
				bind:this={fileInput}
				onchange={importQuestions}
				class="hidden"
			/>
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
							<td class="max-w-[12rem] px-4 py-4 font-mono text-xs text-emerald-400">
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
				<!-- Interactive Component -->
				<div class="min-h-[300px] rounded-xl border border-white/10 bg-black/20 p-6">
					{#if previewQuestion.type === 'mcq'}
						<MCQ
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'true_false'}
						<TrueFalse
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'ordering'}
						<Ordering
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'drag_drop'}
						<DragDrop
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'matching'}
						<Matching
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'fill_blank'}
						<FillBlank
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'short_answer'}
						<ShortAnswer
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'cloze'}
						<Cloze
							data={typeof previewQuestion.questionData === 'string'
								? JSON.parse(previewQuestion.questionData)
								: previewQuestion.questionData}
							{onAnswer}
						/>
					{:else if previewQuestion.type === 'calculated'}
						<Calculated data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else if previewQuestion.type === 'sentence_reorder'}
						<SentenceReorder data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else if previewQuestion.type === 'hotspot'}
						<Hotspot data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else if previewQuestion.type === 'drag_to_image'}
						<DragToImage data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else if previewQuestion.type === 'matrix'}
						<Matrix data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else if previewQuestion.type === 'essay'}
						<Essay data={typeof previewQuestion.questionData === 'string' ? JSON.parse(previewQuestion.questionData) : previewQuestion.questionData} {onAnswer} />
					{:else}
						<div class="p-8 text-center text-white/50">
							هذا النوع من الأسئلة غير مدعوم في المعاينة التفاعلية بعد.
						</div>
					{/if}
				</div>

				<!-- Validation Actions -->
				<div class="flex items-center justify-between border-t border-white/10 pt-4">
					{#if previewResult !== null}
						<div
							class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold {previewResult
								? 'bg-emerald-500/10 text-emerald-400'
								: 'bg-red-500/10 text-red-400'}"
						>
							{#if previewResult}
								<CheckCircle size={20} /> إجابة صحيحة
							{:else}
								<XCircle size={20} /> إجابة خاطئة
							{/if}
						</div>
					{:else}
						<div></div>
					{/if}

					<div class="flex items-center gap-3">
						{#if previewResult !== null}
							<button
								onclick={() => {
									previewAnswer = null;
									previewResult = null;
								}}
								class="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
							>
								إعادة المحاولة
							</button>
						{:else}
							<button
								onclick={checkPreviewAnswer}
								disabled={previewAnswer === null}
								class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
							>
								تحقق من الإجابة
							</button>
						{/if}
					</div>
				</div>

				{#if previewQuestion.explanation && previewResult !== null}
					<div class="relative mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
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
