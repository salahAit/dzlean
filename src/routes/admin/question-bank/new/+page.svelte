<script lang="ts">
	import { goto } from '$app/navigation';
	import { Save, ArrowRight, AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import { QuestionForm } from '$lib/modules/QuizBuilder';
	import { QUESTION_TYPES, getDefaultDataForType } from '$lib/modules/QuizBuilder';

	let categoryId = $state<number | null>(null);
	let difficulty = $state('medium');

	let draftQuestion = $state<any>(null);
	let showTypeSelector = $state(true);

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
			const res = await fetch('/api/admin/question-categories');
			if (res.ok) {
				const data = await res.json();
				categories = flattenTree(data.tree || []);
				if (categories.length > 0) categoryId = categories[0].id;
			}
		} finally {
			loadingData = false;
		}
	});

	// Helper to start adding a specific question type
	function startAdding(typeId: string) {
		draftQuestion = {
			type: typeId,
			questionText: '',
			questionTextAr: '',
			questionData: getDefaultDataForType(typeId),
			explanation: '',
			points: 1
		};
		showTypeSelector = false;
	}

	async function save() {
		if (!draftQuestion.questionTextAr || !categoryId || !draftQuestion.type) {
			error = 'الرجاء تحديد التصنيف وملء نص السؤال المطلوبة';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch('/api/admin/question-bank', {
				method: 'POST',
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
			class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card shadow-sm hover:text-white"
		>
			<ArrowRight size={24} />
		</a>
		<h1 class="text-2xl font-bold text-emerald-400">بنك الأسئلة - إضافة سؤال جديد</h1>
	</div>

	{#if error}
		<div class="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 font-semibold text-red-400">
			<AlertCircle size={20} />
			{error}
		</div>
	{/if}

	<div class="grid gap-6 md:grid-cols-3">
		<!-- Sidebar meta -->
		<div class="space-y-6 md:col-span-1">
			<div class="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6">
				<h3 class="mb-4 font-bold text-foreground/80">تصنيف السؤال</h3>
				<div class="space-y-4">
					<div class="space-y-2">
						<label for="category-select" class="text-sm font-semibold text-muted-foreground">تحديد التصنيف (Category) *</label>
						<select
							id="category-select"
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
						<label for="difficulty-select" class="text-sm font-semibold text-muted-foreground">مستوى الصعوبة</label>
						<select
							id="difficulty-select"
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

		<!-- Main question builder -->
		<div class="space-y-6 md:col-span-2">
			{#if showTypeSelector && !draftQuestion}
				<div class="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<h2 class="mb-4 text-center text-xl font-bold text-emerald-400">اختر نوع السؤال</h2>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
						{#each QUESTION_TYPES as type}
							{@const IconComp = type.icon}
							<button
								onclick={() => startAdding(type.id)}
								class="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:border-blue-500 hover:bg-muted text-foreground"
							>
								<div class="flex h-12 w-12 items-center justify-center rounded-full {type.bg} {type.color}">
									<IconComp size={24} />
								</div>
								<span class="text-sm font-semibold">{type.name}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			{#if draftQuestion}
				<div class="relative rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
					<button
						class="absolute top-4 left-4 text-muted-foreground hover:text-white"
						onclick={() => { draftQuestion = null; showTypeSelector = true; }}
					>
						تغيير النوع
					</button>
					<h2 class="mb-6 flex items-center gap-2 text-xl font-bold">
						<span class="rounded bg-blue-500/20 px-2 text-sm text-blue-400">
							{QUESTION_TYPES.find((t) => t.id === draftQuestion.type)?.name}
						</span>
						سؤال جديد
					</h2>

					<QuestionForm 
						bind:question={draftQuestion} 
						onSave={save} 
						onCancel={() => goto('/admin/question-bank')} 
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
