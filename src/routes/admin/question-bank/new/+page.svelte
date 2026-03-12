<script lang="ts">
	import { goto } from '$app/navigation';
	import { Save, ArrowRight, AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';

	// The form components
	import MCQForm from '../../quizzes/[id]/builder/forms/MCQForm.svelte';
	import TrueFalseForm from '../../quizzes/[id]/builder/forms/TrueFalseForm.svelte';
	import OrderingForm from '../../quizzes/[id]/builder/forms/OrderingForm.svelte';
	import DragDropForm from '../../quizzes/[id]/builder/forms/DragDropForm.svelte';
	import MatchingForm from '../../quizzes/[id]/builder/forms/MatchingForm.svelte';
	import FillBlankForm from '../../quizzes/[id]/builder/forms/FillBlankForm.svelte';
	import ShortAnswerForm from '../../quizzes/[id]/builder/forms/ShortAnswerForm.svelte';
	import ClozeForm from '../../quizzes/[id]/builder/forms/ClozeForm.svelte';

	let type = $state('mcq');
	let difficulty = $state('medium');
	let questionText = $state('');
	let questionTextAr = $state('');
	let explanation = $state('');
	let questionData = $state<any>({});

	let categoryId = $state<number | null>(null);

	// Context options
	let categories = $state<any[]>([]);
	let loadingData = $state(true);
	let saving = $state(false);
	let error = $state('');

	const typeLabels: Record<string, string> = {
		mcq: 'اختيار من متعدد',
		true_false: 'صح أو خطأ',
		ordering: 'ترتيب متسلسل',
		drag_drop: 'تصنيف (سحب وإفلات)',
		matching: 'ربط',
		fill_blank: 'أكمل الفراغ',
		short_answer: 'إجابة قصيرة',
		cloze: 'اختيار من القائمة المنزلقة'
	};

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
		if (type) {
			questionData = {};
		}
	});

	async function save() {
		if (!questionText || !questionTextAr || !categoryId || !type) {
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
					type,
					difficulty,
					questionText,
					questionTextAr,
					questionData: JSON.stringify(questionData),
					explanation
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

					<div class="mt-6 space-y-2 border-t border-border pt-4">
						<label class="text-sm font-semibold text-muted-foreground">تلميح أو شرح (اختياري)</label>
						<textarea
							bind:value={explanation}
							rows="4"
							placeholder="شرح يظهر للطالب بعد الإجابة..."
							class="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
						></textarea>
					</div>
				</div>
			</div>
		</div>

		<!-- Main question builder -->
		<div class="space-y-6 md:col-span-2">
			<div class="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6">
				<h3 class="mb-4 font-bold text-foreground/80">محتوى السؤال</h3>

				<div class="space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<label class="text-sm font-semibold text-muted-foreground">نص السؤال (بالعربية) *</label>
							<textarea
								bind:value={questionTextAr}
								rows="3"
								placeholder="ما هي عاصمة الجزائر؟"
								class="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							></textarea>
						</div>
						<div class="space-y-2">
							<label class="text-sm font-semibold text-muted-foreground">نص السؤال (لغة أجنبية) *</label>
							<textarea
								bind:value={questionText}
								dir="ltr"
								rows="3"
								placeholder="What is the capital of Algeria?"
								class="w-full resize-none rounded-xl border border-border bg-background p-3 text-left text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
							></textarea>
						</div>
					</div>

					<div class="space-y-2 border-t border-border pt-4">
						<label class="text-sm font-semibold text-muted-foreground">نوع السؤال والمحتوى الديناميكي</label
						>
						<select
							bind:value={type}
							class="w-full rounded-xl border border-emerald-500/30 bg-background p-4 text-emerald-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
						>
							{#each Object.entries(typeLabels) as [val, label]}
								<option class="bg-background" value={val}>{label}</option>
							{/each}
						</select>
					</div>

					<!-- Dynamic Form Injection -->
					<div class="mt-4 rounded-xl border border-border bg-background p-6 shadow-inner">
						{#if type === 'mcq'}
							<MCQForm bind:data={questionData} />
						{:else if type === 'true_false'}
							<TrueFalseForm bind:data={questionData} />
						{:else if type === 'ordering'}
							<OrderingForm bind:data={questionData} />
						{:else if type === 'drag_drop'}
							<DragDropForm bind:data={questionData} />
						{:else if type === 'matching'}
							<MatchingForm bind:data={questionData} />
						{:else if type === 'fill_blank'}
							<FillBlankForm bind:data={questionData} />
						{:else if type === 'short_answer'}
							<ShortAnswerForm bind:data={questionData} />
						{:else if type === 'cloze'}
							<ClozeForm bind:data={questionData} />
						{/if}
					</div>
				</div>
			</div>

			<div class="flex justify-end pt-4">
				<button
					onclick={save}
					disabled={saving || loadingData}
					class="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-bold text-foreground shadow-lg transition-all hover:bg-emerald-700 disabled:opacity-50"
				>
					{#if saving}
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						جاري الحفظ...
					{:else}
						<Save size={18} /> حفظ السؤال في البنك
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
