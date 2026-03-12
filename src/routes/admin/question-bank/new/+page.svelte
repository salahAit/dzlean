<script lang="ts">
	import { goto } from '$app/navigation';
	import { Save, ArrowRight, AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import QuestionForm from '$lib/admin/components/question-forms/QuestionForm.svelte';
	import { QUESTION_TYPES } from '$lib/admin/questionTypes';

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

	// Reset question data when type changes
	$effect(() => {
		if (draftQuestion.type) {
			draftQuestion.questionData = {};
		}
	});

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
			class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card text-card-foreground shadow-sm hover:text-white"
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
						<label class="text-sm font-semibold text-muted-foreground">تحديد التصنيف (Category) *</label>
						<select
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
						<label class="text-sm font-semibold text-muted-foreground">مستوى الصعوبة</label>
						<select
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
			<div class="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6">
				<div class="mb-6 space-y-2 border-b border-border pb-6">
					<label class="text-lg font-bold text-emerald-400">تحديد نوع السؤال</label>
					<select
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
</div>
