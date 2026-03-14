<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Save, ArrowRight, AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let questionId = $derived($page.params.id);

	import { QuestionForm } from '$lib/modules/QuizBuilder';
	import { QUESTION_TYPES } from '$lib/modules/QuizBuilder';

	let categoryId = $state<number | null>(null);
	let difficulty = $state('medium');

	let draftQuestion = $state({
		type: 'mcq',
		questionText: '',
		questionTextAr: '',
		explanation: '',
		points: 1,
		questionData: {}
	});

	let categories = $state<any[]>([]);
	let loadingData = $state(true);
	let saving = $state(false);
	let error = $state('');

	// Helper to flatten tree into indented list for the select dropdown
	function flattenTree(treeNodes: any[], prefix = ''): any[] {
		let result: any[] = [];
		for (const node of treeNodes) {
			result.push({ id: node.id, name: prefix + node.name });
			if (node.children && node.children.length > 0) {
				result = result.concat(flattenTree(node.children, prefix + '\u00A0\u00A0\u00A0\u00A0'));
			}
		}
		return result;
	}

	onMount(async () => {
		try {
			const [metaRes, qRes] = await Promise.all([
				fetch('/api/admin/question-categories'),
				fetch(`/api/admin/question-bank/${questionId}`)
			]);

			if (metaRes.ok) {
				const data = await metaRes.json();
				categories = flattenTree(data.tree || []);
			}

			if (qRes.ok) {
				const q = await qRes.json();
				categoryId = q.categoryId;
				difficulty = q.difficulty;
				draftQuestion.type = q.type;
				draftQuestion.questionText = q.questionText || '';
				draftQuestion.questionTextAr = q.questionTextAr || '';
				draftQuestion.explanation = q.explanation || '';
				draftQuestion.points = q.points || 1;
				try {
					draftQuestion.questionData = typeof q.questionData === 'string' ? JSON.parse(q.questionData) : (q.questionData || {});
				} catch {
					draftQuestion.questionData = {};
				}
			} else {
				error = 'لم يتم العثور على السؤال';
			}
		} finally {
			loadingData = false;
		}
	});

	// Handle type switches carefully. If type switches, we might want to clear Data, but since we just loaded it, we only clear if user manually changes it.
	let initialLoadDone = $state(false);
	$effect(() => {
		if (!loadingData && !initialLoadDone) {
			initialLoadDone = true;
		} else if (initialLoadDone && draftQuestion.type) {
			// User manually changed type, DO NOT reset data to prevent accidental data loss on edit
		}
	});

	async function save() {
		if (!draftQuestion.questionTextAr || !categoryId || !draftQuestion.type) {
			error = 'الرجاء ملء جميع الحقول المطلوبة';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch(`/api/admin/question-bank/${questionId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					categoryId,
					difficulty,
					type: draftQuestion.type,
					questionText: draftQuestion.questionText,
					questionTextAr: draftQuestion.questionTextAr,
					questionData: JSON.stringify(draftQuestion.questionData),
					explanation: draftQuestion.explanation,
					points: draftQuestion.points
				})
			});

			if (res.ok) {
				goto(`/admin/question-bank`);
			} else {
				const data = await res.json();
				error = data.error || 'حدث خطأ أثناء الحفظ';
			}
		} catch (e: any) {
			error = e.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="flex items-center gap-4 border-b border-border pb-4">
		<a
			href="/admin/question-bank"
			class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card text-card-foreground shadow-sm hover:text-white"
		>
			<ArrowRight size={24} />
		</a>
		<h1 class="text-2xl font-bold text-emerald-400">تعديل السؤال</h1>
	</div>

	{#if error}
		<div class="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 font-semibold text-red-400">
			<AlertCircle size={20} />
			{error}
		</div>
	{/if}

	{#if loadingData}
		<div class="flex h-32 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-3">
			<div class="space-y-6 md:col-span-1">
				<div class="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6">
					<h3 class="mb-4 font-bold text-foreground/80">تصنيف السؤال</h3>
					<div class="space-y-4">
						<div class="space-y-2">
							<label for="categoryId" class="text-sm font-semibold text-muted-foreground">تحديد التصنيف (Category) *</label>
							<select
								id="categoryId"
								bind:value={categoryId}
								class="w-full rounded-xl border border-border bg-background p-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							>
								{#if categories.length === 0}
									<option class="bg-background" value={null} disabled
										>لا توجد تصنيفات، يرجى إنشاء واحد أولاً</option
									>
								{/if}
								{#each categories as cat}
									<option class="bg-background" value={cat.id}>{cat.name}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<label for="difficulty" class="text-sm font-semibold text-muted-foreground">مستوى الصعوبة</label>
							<select
								id="difficulty"
								bind:value={difficulty}
								class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							>
								<option class="bg-background" value="easy">سهل (Easy)</option>
								<option class="bg-background" value="medium">متوسط (Medium)</option>
								<option class="bg-background" value="hard">صعب (Hard)</option>
							</select>
						</div>

					</div>
				</div>
				<!-- Render a small saving overlay box if saving -->
				{#if saving}
					<div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-emerald-400 font-bold">
						جاري الحفظ...
					</div>
				{/if}
			</div>

			<div class="space-y-6 md:col-span-2">
				<div class="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6">
					<div class="mb-6 space-y-2 border-b border-border pb-6">
						<label for="questionType" class="text-lg font-bold text-emerald-400">تحديد نوع السؤال</label>
						<select
							id="questionType"
							bind:value={draftQuestion.type}
							class="w-full rounded-xl border border-emerald-500/30 bg-background p-4 font-bold text-foreground shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
						>
							{#each QUESTION_TYPES as qt}
								<option class="bg-background font-semibold" value={qt.id}>{qt.name}</option>
							{/each}
						</select>
					</div>

					<QuestionForm 
						bind:question={draftQuestion} 
						onSave={save} 
						onCancel={() => goto('/admin/question-bank')} 
					/>
				</div>
			</div>
		</div>
	{/if}
</div>
