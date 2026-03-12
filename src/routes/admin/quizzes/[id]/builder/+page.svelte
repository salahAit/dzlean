<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		ArrowRight,
		Plus,
		GripVertical,
		Trash2,
		Edit2,
		AlertCircle,
		Save,
		Brain,
		Upload
	} from 'lucide-svelte';
	import { onMount, tick } from 'svelte';
	import QuestionForm from './QuestionForm.svelte'; // The dynamic wrapper we will create
	import QuestionBankModal from './QuestionBankModal.svelte';
	import { QUESTION_TYPES, getQuestionType } from '$lib/admin/questionTypes';

	let quizId = $derived(page.params.id);
	let quiz = $state<any>(null);
	let questions = $state<any[]>([]);

	let loadingData = $state(true);
	let error = $state('');

	// Builder State
	let showTypeSelector = $state(false);
	let showBankModal = $state(false);
	let editingQuestion = $state<any>(null); // null = not editing, {} = new question
	let jsonFileInput = $state<HTMLInputElement | null>(null);

	onMount(async () => {
		await loadQuiz();
	});

	async function loadQuiz() {
		try {
			loadingData = true;
			const res = await fetch(`/api/admin/quizzes/${quizId}`);
			if (res.ok) {
				const data = await res.json();
				quiz = data;
				questions = data.questions || [];
			} else {
				error = 'التمرين غير موجود';
			}
		} catch (e) {
			error = 'خطأ في جلب البيانات';
		} finally {
			loadingData = false;
		}
	}

	function startAdding(typeId: string) {
		editingQuestion = {
			type: typeId,
			questionText: '',
			questionTextAr: '',
			questionData: getDefaultDataForType(typeId),
			explanation: '',
			points: 1
		};
		showTypeSelector = false;
	}

	function getDefaultDataForType(type: string) {
		switch (type) {
			case 'mcq':
				return { options: [], correctIndices: [] };
			case 'true_false':
				return { correctAnswer: true };
			case 'ordering':
				return { items: [] };
			case 'drag_drop':
				return { categories: [], items: [] };
			case 'matching':
				return { pairs: [] };
			case 'fill_blank':
				return { acceptedAnswers: [] };
			case 'short_answer':
				return { acceptedKeywords: [] };
			case 'cloze':
				return { options: [] };
			case 'calculated':
				return { formula: '', displayTemplate: '', variables: [], tolerance: 0 };
			case 'sentence_reorder':
				return { words: [], correctOrder: [] };
			case 'hotspot':
				return { imageUrl: '', zones: [], correctZone: 0 };
			case 'drag_to_image':
				return { imageUrl: '', labels: [] };
			case 'matrix':
				return { statements: [], columns: ['صحيح', 'خطأ'], correctAnswers: [] };
			case 'essay':
				return { minWords: 0, maxWords: 0, keywords: [] };
			default:
				return {};
		}
	}

	async function saveQuestion(savedData: any) {
		const isNew = !savedData.id;
		const method = isNew ? 'POST' : 'PUT';
		const url = isNew
			? `/api/admin/quizzes/${quizId}/questions`
			: `/api/admin/quizzes/${quizId}/questions/${savedData.id}`;

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(savedData)
			});

			if (res.ok) {
				editingQuestion = null;
				await loadQuiz(); // reload to get new IDs/orders
			} else {
				alert('حدث خطأ أثناء حفظ السؤال');
			}
		} catch (e) {
			alert('حدث خطأ في الاتصال');
		}
	}

	async function deleteQuestion(id: number) {
		if (confirm('هل أنت متأكد من إزالة هذا السؤال من هذا التمرين؟ (السؤال سيبقى في بنك الأسئلة)')) {
			await fetch(`/api/admin/quizzes/${quizId}/questions/${id}`, { method: 'DELETE' });
			await loadQuiz();
		}
	}

	// --- Simple Drag and Drop Reordering (HTML5) ---
	let draggedIndex = $state<number | null>(null);

	function dragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function dragOver(event: DragEvent, index: number) {
		event.preventDefault(); // Necessary to allow dropping
	}

	async function drop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		// Reorder local array
		const item = questions[draggedIndex];
		questions.splice(draggedIndex, 1);
		questions.splice(dropIndex, 0, item);

		// Update "order" property locally based on new index
		questions.forEach((q, i) => {
			q.order = i;
		});
		questions = [...questions]; // trigger reactivity
		draggedIndex = null;

		// Save to backend
		const payload = questions.map((q) => ({ id: q.id, order: q.order }));
		fetch(`/api/admin/quizzes/${quizId}/questions`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orders: payload })
		});
	}

	async function importJSON(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		try {
			const text = await file.text();
			const data = JSON.parse(text);
			const questionsArr = Array.isArray(data) ? data : (data.questions || []);
			if (questionsArr.length === 0) {
				alert('لم يتم العثور على أسئلة في الملف');
				return;
			}
			let imported = 0;
			for (const q of questionsArr) {
				const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: q.type || 'mcq',
						questionText: q.questionText || q.question_text || '',
						questionTextAr: q.questionTextAr || q.question_text_ar || '',
						questionData: typeof q.questionData === 'string' ? q.questionData : JSON.stringify(q.questionData || q.question_data || {}),
						explanation: q.explanation || '',
						points: q.points || 1
					})
				});
				if (res.ok) imported++;
			}
			alert(`تم استيراد ${imported} سؤال بنجاح!`);
			await loadQuiz();
		} catch (e: any) {
			alert('خطأ في قراءة الملف: ' + e.message);
		}
		target.value = '';
	}
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<!-- Header -->
	<div
		class="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex items-center gap-4">
			<a href="/admin/quizzes" class="text-muted-foreground transition-colors hover:text-white">
				<ArrowRight size={24} />
			</a>
			<div>
				<h1 class="text-2xl font-bold">بناء الأسئلة</h1>
				{#if quiz}
					<p class="text-sm text-muted-foreground">{quiz.titleAr} • {questions.length} أسئلة</p>
				{/if}
			</div>
		</div>
		<div class="flex gap-3">
			<button
				onclick={() => jsonFileInput?.click()}
				class="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-bold text-purple-400 transition-all hover:bg-purple-500/20"
				disabled={editingQuestion !== null}
			>
				<Upload size={18} /> استيراد JSON
			</button>
			<input
				type="file"
				accept=".json"
				bind:this={jsonFileInput}
				onchange={importJSON}
				class="hidden"
			/>
			<button
				onclick={() => (showBankModal = true)}
				class="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
				disabled={editingQuestion !== null}
			>
				استيراد من البنك
			</button>
			<button
				onclick={() => (showTypeSelector = true)}
				class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-foreground shadow-lg transition-all hover:bg-blue-700"
				disabled={editingQuestion !== null}
			>
				<Plus size={18} /> سؤال جديد
			</button>
		</div>
	</div>

	<QuestionBankModal
		bind:isOpen={showBankModal}
		quizId={Number(quizId)}
		onImportSuccess={loadQuiz}
	/>

	{#if error}
		<div class="rounded-lg bg-red-500/10 p-4 text-red-400">{error}</div>
	{/if}

	<!-- Editor View -->
	{#if editingQuestion}
		<div class="relative rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
			<button
				class="absolute top-4 left-4 text-muted-foreground hover:text-white"
				onclick={() => (editingQuestion = null)}>إلغاء</button
			>
			<h2 class="mb-6 flex items-center gap-2 text-xl font-bold">
				<span class="rounded bg-blue-500/20 px-2 text-sm text-blue-400">
					{QUESTION_TYPES.find((t) => t.id === editingQuestion.type)?.name}
				</span>
				{editingQuestion.id ? 'تعديل السؤال' : 'سؤال جديد'}
			</h2>

			<QuestionForm
				question={editingQuestion}
				onSave={saveQuestion}
				onCancel={() => (editingQuestion = null)}
			/>
		</div>
	{/if}

	<!-- Type Selector Modal -->
	{#if showTypeSelector && !editingQuestion}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onclick={() => (showTypeSelector = false)}
			onkeydown={(e) => e.key === 'Escape' && (showTypeSelector = false)}
			role="button"
			tabindex="0"
		>
			<div
				class="w-full max-w-2xl rounded-2xl border border-border bg-slate-900 p-6 shadow-2xl"
				onclick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<h2 class="mb-4 text-center text-xl font-bold">اختر نوع السؤال</h2>
				<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
					{#each QUESTION_TYPES as type}
						{@const IconComp = type.icon}
						<button
							onclick={() => startAdding(type.id)}
							class="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-4 transition-all hover:border-blue-500 hover:bg-muted"
						>
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full {type.bg} {type.color}"
							>
								<IconComp size={24} />
							</div>
							<span class="text-sm font-semibold">{type.name}</span>
						</button>
					{/each}
				</div>
				<button
					onclick={() => (showTypeSelector = false)}
					class="mt-6 w-full rounded-xl bg-card text-card-foreground shadow-sm py-3 text-center text-sm font-bold text-foreground/80 hover:bg-muted"
					>إلغاء</button
				>
			</div>
		</div>
	{/if}

	<!-- Question List -->
	{#if !loadingData && questions.length > 0}
		<div class="space-y-3">
			{#each questions as q, index}
				{@const qType = QUESTION_TYPES.find((t) => t.id === q.type)}
				<div
					draggable="true"
					ondragstart={(e) => dragStart(e, index)}
					ondragover={(e) => dragOver(e, index)}
					ondrop={(e) => drop(e, index)}
					class="group flex items-center gap-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-4 transition-all hover:border-border {draggedIndex ===
					index
						? 'border-dashed opacity-50'
						: ''}"
				>
					<!-- Drag handle -->
					<div class="cursor-grab text-foreground/30 hover:text-white/60 active:cursor-grabbing">
						<GripVertical size={20} />
					</div>

					<div
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded {qType?.bg || 'bg-muted'} {qType?.color || 'text-muted-foreground'}"
						title={qType?.name}
					>
						{#if qType?.icon}
							{@const IconIcon = qType.icon}
							<IconIcon size={16} />
						{:else}
							<span class="text-xs font-bold">{index + 1}</span>
						{/if}
					</div>

					<div class="flex-1 overflow-hidden">
						<p class="truncate font-semibold text-foreground">
							{q.questionTextAr || 'صورة/سؤال بدون نص'}
						</p>
						<p class="mt-1 text-xs text-muted-foreground">
							نوع: {QUESTION_TYPES.find((t) => t.id === q.type)?.name} • النقاط: {q.points}
						</p>
					</div>

					<!-- Actions -->
					<div class="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
						<button
							onclick={() => (editingQuestion = JSON.parse(JSON.stringify(q)))}
							class="rounded-lg bg-card text-card-foreground shadow-sm p-2 transition-colors hover:bg-muted"
							title="تعديل"
						>
							<Edit2 size={16} />
						</button>
						<button
							onclick={() => deleteQuestion(q.id)}
							class="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
							title="حذف"
						>
							<Trash2 size={16} />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{:else if !loadingData && questions.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-muted-foreground"
		>
			<Brain size={48} class="mb-4 opacity-50" />
			<p>لا توجد أسئلة في هذا التمرين بعد.</p>
			<button onclick={() => (showTypeSelector = true)} class="mt-4 text-blue-400 hover:underline"
				>أضف السؤال الأول</button
			>
		</div>
	{/if}
</div>
