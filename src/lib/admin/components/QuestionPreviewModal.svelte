<script lang="ts">
	import { X, CheckCircle, XCircle, Eye } from 'lucide-svelte';
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
	import { getQuestionType } from '$lib/modules/QuizBuilder';

	let { isOpen = $bindable(false), question } = $props<{
		isOpen: boolean;
		question: any;
	}>();

	let answer = $state<any>(null);
	let result = $state<boolean | null>(null);

	let qType = $derived(question ? getQuestionType(question.type) : null);

	let parsedData = $derived(
		typeof question?.questionData === 'string'
			? (() => { try { return JSON.parse(question.questionData); } catch { return {}; } })()
			: (question?.questionData || {})
	);

	function onAnswer(val: any) {
		answer = val;
		result = null;
	}

	function close() {
		isOpen = false;
		answer = null;
		result = null;
	}

	$effect(() => {
		if (question) {
			answer = null;
			result = null;
		}
	});

	function checkAnswer() {
		if (!question) return;
		const qd = parsedData;
		const ans = answer;

		switch (question.type) {
			case 'mcq': {
				const correctIdx = qd.correctIndexes
					? qd.correctIndexes
					: qd.correctIndices
						? qd.correctIndices
						: (qd.options || [])
								.map((opt: any, i: number) => (typeof opt === 'object' && opt.isCorrect ? i : -1))
								.filter((i: number) => i >= 0);
				result = JSON.stringify(ans?.selectedIndexes?.slice().sort()) === JSON.stringify(correctIdx.slice().sort());
				break;
			}
			case 'true_false':
				result = ans?.selected === qd.correctAnswer || ans?.value === qd.correctAnswer;
				break;
			case 'ordering': {
				if (!ans?.order) { result = false; break; }
				const correctItems = qd.correctOrder
					? qd.correctOrder.map((idx: number) => qd.items[idx])
					: qd.items;
				result = JSON.stringify(ans.order) === JSON.stringify(correctItems);
				break;
			}
			case 'drag_drop': {
				if (!ans?.assignments) { result = false; break; }
				result = (qd.items || []).every(
					(item: any) => ans.assignments[item.text] === item.category
				);
				break;
			}
			case 'matching': {
				if (!ans?.matches) { result = false; break; }
				result = Object.entries(ans.matches).every(
					([left, right]) => Number(left) === Number(right)
				);
				break;
			}
			case 'fill_blank': {
				if (!ans?.text) { result = false; break; }
				result = (qd.answers || []).some(
					(a: string) => a.toLowerCase().trim() === ans.text.toLowerCase().trim()
				);
				break;
			}
			case 'short_answer': {
				if (!ans?.text) { result = false; break; }
				const matchCount = (qd.keywords || []).filter((kw: string) => ans.text.includes(kw)).length;
				result = matchCount >= (qd.minKeywords || 1);
				break;
			}
			case 'cloze':
				result = ans?.selectedIndex === qd.correctIndex;
				break;
			case 'calculated': {
				if (!ans?.value && ans?.value !== 0) { result = false; break; }
				const vars: Record<string, number> = {};
				for (const v of (qd.variables || [])) {
					vars[v.name] = Math.floor(Math.random() * (v.max - v.min + 1)) + v.min;
				}
				try {
					const expr = (qd.formula || '').replace(/\{(\w+)\}/g, (_: string, k: string) => String(vars[k] ?? 0));
					const expected = new Function(`return ${expr}`)();
					result = Math.abs(Number(ans.value) - expected) <= (qd.tolerance || 0);
				} catch { result = false; }
				break;
			}
			case 'sentence_reorder':
				if (!ans?.order) { result = false; break; }
				result = JSON.stringify(ans.order) === JSON.stringify(qd.correctOrder);
				break;
			case 'hotspot':
				result = ans?.selectedZone === qd.correctZone;
				break;
			case 'drag_to_image': {
				if (!ans?.placements) { result = false; break; }
				const labels = qd.labels || [];
				result = labels.every((lbl: any, i: number) => {
					const p = ans.placements[i];
					if (!p) return false;
					return Math.abs(p.x - lbl.correctX) <= 10 && Math.abs(p.y - lbl.correctY) <= 10;
				});
				break;
			}
			case 'matrix': {
				if (!ans?.selections) { result = false; break; }
				const correct = qd.correctAnswers || [];
				result = correct.every((c: number, i: number) => ans.selections[i] === c);
				break;
			}
			case 'essay':
				result = true; // manual grading
				break;
			default:
				result = false;
		}
	}
</script>

{#if isOpen && question}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
		onclick={close}
		onkeydown={(e) => { if (e.key === 'Escape') close(); }}
		role="button"
		tabindex="0"
	>
		<div
			class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<!-- Header -->
			<div class="sticky top-0 z-10 border-b border-border bg-background/95 p-5 backdrop-blur">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-xl font-bold">
						<Eye class="text-emerald-500" size={22} />
						<span>معاينة السؤال</span>
					</h2>
					<button
						onclick={close}
						class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<X size={20} />
					</button>
				</div>
				<!-- Badges -->
				<div class="mt-3 flex flex-wrap gap-2">
					{#if qType}
						<span class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold {qType.color} {qType.border} {qType.bg}">
							{#if qType.icon}
								{@const QIcon = qType.icon}
								<QIcon size={12} />
							{/if}
							{qType.name}
						</span>
					{/if}
					{#if question.difficulty}
						<span class="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground/60">
							{question.difficulty === 'easy' ? 'سهل' : question.difficulty === 'medium' ? 'متوسط' : 'صعب'}
						</span>
					{/if}
				</div>
			</div>

			<!-- Body -->
			<div class="space-y-5 p-6">
				<!-- Question Text -->
				<h3 class="text-base font-bold leading-relaxed sm:text-lg">
					{question.questionTextAr || question.questionText || 'بدون نص'}
				</h3>

				<!-- Interactive Component -->
				<div class="min-h-[200px] rounded-xl border border-border bg-card p-5 shadow-sm">
					{#if question.type === 'mcq'}
						<MCQ data={parsedData} {onAnswer} />
					{:else if question.type === 'true_false'}
						<TrueFalse data={parsedData} {onAnswer} />
					{:else if question.type === 'ordering'}
						<Ordering data={parsedData} {onAnswer} />
					{:else if question.type === 'drag_drop'}
						<DragDrop data={parsedData} {onAnswer} />
					{:else if question.type === 'matching'}
						<Matching data={parsedData} {onAnswer} />
					{:else if question.type === 'fill_blank'}
						<FillBlank data={parsedData} {onAnswer} />
					{:else if question.type === 'short_answer'}
						<ShortAnswer data={parsedData} {onAnswer} />
					{:else if question.type === 'cloze'}
						<Cloze data={parsedData} {onAnswer} />
					{:else if question.type === 'calculated'}
						<Calculated data={parsedData} {onAnswer} />
					{:else if question.type === 'sentence_reorder'}
						<SentenceReorder data={parsedData} {onAnswer} />
					{:else if question.type === 'hotspot'}
						<Hotspot data={parsedData} {onAnswer} />
					{:else if question.type === 'drag_to_image'}
						<DragToImage data={parsedData} {onAnswer} />
					{:else if question.type === 'matrix'}
						<Matrix data={parsedData} {onAnswer} />
					{:else if question.type === 'essay'}
						<Essay data={parsedData} {onAnswer} />
					{:else}
						<div class="py-8 text-center text-muted-foreground">
							هذا النوع من الأسئلة غير مدعوم في المعاينة التفاعلية بعد.
						</div>
					{/if}
				</div>

				<!-- Actions Bar -->
				<div class="flex items-center justify-between border-t border-border pt-4">
					<!-- Result Badge -->
					{#if result !== null}
						<div class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold {result ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}">
							{#if result}
								<CheckCircle size={20} />
								{question.type === 'essay' ? 'تم الإرسال (يحتاج مراجعة يدوية)' : 'إجابة صحيحة!'}
							{:else}
								<XCircle size={20} />
								إجابة خاطئة
							{/if}
						</div>
					{:else}
						<div></div>
					{/if}

					<!-- Buttons -->
					<div class="flex items-center gap-3">
						{#if result !== null}
							<button
								onclick={() => { answer = null; result = null; }}
								class="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-muted"
							>
								إعادة المحاولة
							</button>
						{:else}
							<button
								onclick={checkAnswer}
								disabled={answer === null}
								class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
							>
								تحقق من الإجابة
							</button>
						{/if}
					</div>
				</div>

				<!-- Explanation (shown after checking) -->
				{#if question.explanation && result !== null}
					<div class="relative rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
						<div class="absolute top-2 right-4 select-none text-xs font-bold text-blue-500/40">
							شرح / تلميح
						</div>
						<p class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-blue-200">{question.explanation}</p>
					</div>
				{/if}

				<!-- Close button -->
				<button onclick={close} class="w-full rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
					إغلاق
				</button>
			</div>
		</div>
	</div>
{/if}
