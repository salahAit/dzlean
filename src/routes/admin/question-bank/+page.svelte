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

	import MCQ from '$lib/modules/QuizBuilder/components/player/questions/MCQ.svelte';
	import TrueFalse from '$lib/modules/QuizBuilder/components/player/questions/TrueFalse.svelte';
	import Ordering from '$lib/modules/QuizBuilder/components/player/questions/Ordering.svelte';
	import DragDrop from '$lib/modules/QuizBuilder/components/player/questions/DragDrop.svelte';
	import Matching from '$lib/modules/QuizBuilder/components/player/questions/Matching.svelte';
	import FillBlank from '$lib/modules/QuizBuilder/components/player/questions/FillBlank.svelte';
	import ShortAnswer from '$lib/modules/QuizBuilder/components/player/questions/ShortAnswer.svelte';
	import Cloze from '$lib/modules/QuizBuilder/components/player/questions/Cloze.svelte';
	import Calculated from '$lib/modules/QuizBuilder/components/player/questions/Calculated.svelte';
	import SentenceReorder from '$lib/modules/QuizBuilder/components/player/questions/SentenceReorder.svelte';
	import Hotspot from '$lib/modules/QuizBuilder/components/player/questions/Hotspot.svelte';
	import DragToImage from '$lib/modules/QuizBuilder/components/player/questions/DragToImage.svelte';
	import Matrix from '$lib/modules/QuizBuilder/components/player/questions/Matrix.svelte';
	import Essay from '$lib/modules/QuizBuilder/components/player/questions/Essay.svelte';
	import { QUESTION_TYPES, getQuestionType } from '$lib/modules/QuizBuilder'; // Added new import
	import QuestionPreviewModal from '$lib/admin/components/QuestionPreviewModal.svelte';
	import Pagination from '$lib/admin/components/Pagination.svelte';

	let questions = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedType = $state('all');
	let selectedDifficulty = $state('all');

	// Pagination state
	let currentPage = $state(1);
	const pageSize = 10;

	// Preview state
	let previewQuestion = $state<any>(null);
	let previewOpen = $state(false);

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
		previewOpen = true;
	}

	function closePreview() {
		previewOpen = false;
		previewQuestion = null;
	}

	let filteredQuestions = $derived(
		questions.filter((q) => {
			const matchesSearch =
				(q.questionText || '').includes(searchQuery) ||
				(q.questionTextAr || '').includes(searchQuery);
			const matchesType = selectedType === 'all' || q.type === selectedType;
			const matchesDifficulty = selectedDifficulty === 'all' || (q.difficulty || 'medium') === selectedDifficulty;
			return matchesSearch && matchesType && matchesDifficulty;
		})
	);

	let stats = $derived.by(() => {
		let easy = 0;
		let medium = 0;
		let hard = 0;
		for (const q of filteredQuestions) {
			const diff = q.difficulty || 'medium';
			if (diff === 'easy') easy++;
			else if (diff === 'hard') hard++;
			else medium++;
		}
		return { total: filteredQuestions.length, easy, medium, hard };
	});

	let paginatedQuestions = $derived(
		filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	// Reset pagination on search or filter
	$effect(() => {
		if (searchQuery !== undefined || selectedType !== undefined || selectedDifficulty !== undefined) {
			currentPage = 1;
		}
	});
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-3 text-2xl font-bold">
			<Database size={28} class="text-emerald-500" /> بنك الأسئلة الشامل
		</h1>
		<div class="flex items-center gap-3">
			<a
				href="/admin/question-bank/categories"
				class="flex items-center rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-muted"
			>
				إدارة التصنيفات
			</a>
			<button
				onclick={exportQuestions}
				class="flex items-center gap-2 rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-muted"
			>
				<Download size={16} /> تصدير
			</button>
			<button
				onclick={() => fileInput?.click()}
				class="flex items-center gap-2 rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-muted"
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
				class="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-foreground shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:text-white"
			>
				<Plus size={18} /> إضافة سؤال جديد
			</a>
		</div>
	</div>

	<!-- Stats Dashboard -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-2 text-emerald-500">
				<Database size={20} />
				<span class="font-bold text-sm">إجمالي النتائج</span>
			</div>
			<p class="text-3xl font-black text-foreground mt-1">
				{stats.total} 
				{#if questions.length > 0 && stats.total !== questions.length}
					<span class="text-sm font-normal text-muted-foreground mr-1 truncate">من أصل {questions.length}</span>
				{/if}
			</p>
		</div>
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-2 text-blue-500">
				<div class="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
				<span class="font-bold text-sm">أسئلة سهلة</span>
			</div>
			<p class="text-3xl font-black text-foreground mt-1">{stats.easy}</p>
		</div>
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-2 text-amber-500">
				<div class="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
				<span class="font-bold text-sm">أسئلة متوسطة</span>
			</div>
			<p class="text-3xl font-black text-foreground mt-1">{stats.medium}</p>
		</div>
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-2 text-red-500">
				<div class="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
				<span class="font-bold text-sm">أسئلة صعبة</span>
			</div>
			<p class="text-3xl font-black text-foreground mt-1">{stats.hard}</p>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="flex flex-col gap-4 md:flex-row">
		<div class="relative flex-1">
			<Search class="absolute top-1/2 right-4 -translate-y-1/2 text-foreground/40" size={18} />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="ابحث في نص السؤال..."
				class="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm py-3 pr-12 pl-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:ring-1 focus:ring-primary"
			/>
		</div>
		<div class="flex gap-4">
			<div class="relative">
				<Filter class="absolute top-1/2 right-4 -translate-y-1/2 text-foreground/40" size={16} />
				<select
					bind:value={selectedType}
					class="w-48 appearance-none rounded-xl border border-border bg-card text-card-foreground shadow-sm py-3 pr-12 pl-4 text-sm font-medium transition-colors outline-none hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary focus:ring-1 focus:ring-primary"
				>
					<option value="all" class="bg-background">كل الأنواع</option>
					{#each QUESTION_TYPES as qt}
						<option value={qt.id} class="bg-background">{qt.name}</option>
					{/each}
				</select>
			</div>
			<select
				bind:value={selectedDifficulty}
				class="w-40 rounded-xl border border-border bg-card text-card-foreground shadow-sm px-4 py-3 text-sm font-medium transition-colors outline-none hover:bg-muted focus:border-primary focus:ring-1 focus:ring-primary focus:ring-1 focus:ring-primary"
			>
				<option value="all" class="bg-background">كل المستويات</option>
				<option value="easy" class="bg-background">سهل</option>
				<option value="medium" class="bg-background">متوسط</option>
				<option value="hard" class="bg-background">صعب</option>
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
		<div class="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-1">
			<table class="w-full border-collapse text-right">
				<thead class="border-b border-border bg-card text-card-foreground shadow-sm text-sm font-medium text-foreground/60">
					<tr>
						<th class="p-4">التصنيف</th>
						<th class="p-4">نص السؤال</th>
						<th class="p-4">النوع</th>
						<th class="p-4">الصعوبة</th>
						<th class="p-4 text-left">إجراءات</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each paginatedQuestions as q}
						{@const qType = getQuestionType(q.type)}
						<tr class="transition-colors hover:bg-muted/50">
							<td class="max-w-[12rem] px-4 py-4 font-mono text-xs text-emerald-400">
								{#if q.categoryName}
									{q.categoryName}
								{:else}
									<span class="truncate text-foreground/30">غير مصنف</span>
								{/if}
							</td>
							<td class="p-4">
								<p class="line-clamp-2 max-w-lg font-medium text-foreground/90">
									{q.questionTextAr || q.questionText}
								</p>
							</td>
							<td class="p-4">
								<span
									class="inline-flex items-center gap-1.5 rounded-md bg-muted/30 px-2.5 py-1 text-xs font-semibold {qType.color} {qType.border} border"
								>
									{#if qType.icon}
										{@const IconIcon = qType.icon}
										<IconIcon size={14} />
									{/if}
									{qType.name}
								</span>
							</td>
							<td class="p-4">
								<span class="rounded bg-muted px-2.5 py-1 text-xs text-foreground/60"
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
										class="rounded-lg bg-card text-card-foreground shadow-sm p-2 text-foreground transition-colors hover:bg-muted hover:text-white"
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
							<td colspan="5" class="p-8 text-center text-muted-foreground">لا توجد أسئلة مطابقة</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
		{#if filteredQuestions.length > 0}
			<Pagination totalItems={filteredQuestions.length} {pageSize} bind:currentPage />
		{/if}
	{/if}
</div>

<QuestionPreviewModal bind:isOpen={previewOpen} question={previewQuestion} />

