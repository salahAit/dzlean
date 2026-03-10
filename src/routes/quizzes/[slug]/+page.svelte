<script lang="ts">
	import {
		ChevronLeft,
		ChevronRight,
		Clock,
		Brain,
		Trophy,
		CheckCircle,
		XCircle,
		RotateCcw
	} from 'lucide-svelte';
	import MCQ from '$lib/components/questions/MCQ.svelte';
	import TrueFalse from '$lib/components/questions/TrueFalse.svelte';
	import Ordering from '$lib/components/questions/Ordering.svelte';
	import DragDrop from '$lib/components/questions/DragDrop.svelte';
	import Matching from '$lib/components/questions/Matching.svelte';
	import FillBlank from '$lib/components/questions/FillBlank.svelte';
	import ShortAnswer from '$lib/components/questions/ShortAnswer.svelte';
	import Cloze from '$lib/components/questions/Cloze.svelte';
	import { onMount, onDestroy } from 'svelte';

	let { data }: { data: any } = $props();

	let quiz = $derived(data.quiz);
	let questions = $derived(data.questions || []);

	// State
	let currentIndex = $state(0);
	let answers = $state<Record<number, any>>({});
	let submitted = $state(false);
	let results = $state<{ score: number; total: number; details: any[] } | null>(null);
	let startTime = $state(Date.now());
	let elapsed = $state(0);
	let timerInterval: any;

	let currentQuestion = $derived(questions[currentIndex]);
	let progress = $derived(((currentIndex + 1) / questions.length) * 100);
	let allAnswered = $derived(Object.keys(answers).length === questions.length);
	let percentage = $derived(results ? Math.round((results.score / results.total) * 100) : 0);
	let passed = $derived(percentage >= (quiz?.passingScore || 60));

	const typeLabels: Record<string, string> = {
		mcq: 'اختيار متعدد',
		true_false: 'صحيح / خطأ',
		ordering: 'ترتيب',
		drag_drop: 'سحب وإفلات',
		matching: 'ربط',
		fill_blank: 'ملء فراغ',
		short_answer: 'إجابة قصيرة',
		cloze: 'اختيار من قائمة'
	};

	onMount(() => {
		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function onAnswer(answer: any) {
		answers = { ...answers, [currentQuestion.id]: answer };
	}

	function next() {
		if (currentIndex < questions.length - 1) currentIndex++;
	}

	function prev() {
		if (currentIndex > 0) currentIndex--;
	}

	function goTo(i: number) {
		currentIndex = i;
	}

	function checkAnswer(question: any, answer: any): boolean {
		const qd = question.questionData;
		switch (question.type) {
			case 'mcq': {
				const correctIdx = qd.correctIndexes
					? qd.correctIndexes
					: (qd.options || [])
							.map((opt: any, i: number) => (typeof opt === 'object' && opt.isCorrect ? i : -1))
							.filter((i: number) => i >= 0);
				return JSON.stringify(answer?.selectedIndexes) === JSON.stringify(correctIdx);
			}
			case 'true_false':
				return answer?.value === qd.correctAnswer;
			case 'ordering':
				if (!answer?.order) return false;
				const correctItems = qd.correctOrder.map((idx: number) => qd.items[idx]);
				return JSON.stringify(answer.order) === JSON.stringify(correctItems);
			case 'drag_drop':
				if (!answer?.assignments) return false;
				return qd.items.every((item: any) => answer.assignments[item.text] === item.category);
			case 'matching':
				if (!answer?.matches) return false;
				return Object.entries(answer.matches).every(
					([left, right]) => Number(left) === Number(right)
				);
			case 'fill_blank':
				if (!answer?.text) return false;
				return qd.answers.some(
					(a: string) => a.toLowerCase().trim() === answer.text.toLowerCase().trim()
				);
			case 'short_answer':
				if (!answer?.text) return false;
				const matchCount = qd.keywords.filter((kw: string) => answer.text.includes(kw)).length;
				return matchCount >= (qd.minKeywords || 1);
			case 'cloze':
				return answer?.selectedIndex === qd.correctIndex;
			default:
				return false;
		}
	}

	function submit() {
		clearInterval(timerInterval);
		const details = questions.map((q: any) => {
			const answer = answers[q.id];
			const correct = checkAnswer(q, answer);
			return {
				question: q,
				answer,
				correct,
				points: correct ? q.points : 0
			};
		});

		const score = details.reduce((sum: number, d: any) => sum + d.points, 0);
		const total = questions.reduce((sum: number, q: any) => sum + q.points, 0);

		const percentage = Math.round((score / total) * 100);

		results = { score, total, details };
		submitted = true;

		// Submit to API
		fetch(`/api/quizzes/${quiz.id}/submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				quizId: quiz.id,
				score,
				totalPoints: total,
				percentage,
				timeTaken: elapsed,
				details
			})
		}).catch((err) => console.error('Failed to submit quiz attempt:', err));

		// Also track view stat
		fetch('/api/stats', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ docId: quiz.id, action: 'view' })
		}).catch(() => {});
	}

	function restart() {
		currentIndex = 0;
		answers = {};
		submitted = false;
		results = null;
		startTime = Date.now();
		elapsed = 0;
		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
		}, 1000);
	}
</script>

<svelte:head>
	<title>{quiz.titleAr || quiz.title} - SujetStore</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
	{#if !submitted}
		<!-- Quiz Header -->
		<div class="mb-6">
			<h1 class="text-xl font-bold sm:text-2xl">{quiz.titleAr || quiz.title}</h1>
			<div class="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
				<span class="flex items-center gap-1"><Brain size={16} /> {questions.length} سؤال</span>
				<span class="flex items-center gap-1"><Clock size={16} /> {formatTime(elapsed)}</span>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="mb-6">
			<div class="bg-muted h-2 overflow-hidden rounded-full">
				<div
					class="h-full rounded-full bg-purple-500 transition-all duration-500"
					style="width: {progress}%"
				></div>
			</div>
			<p class="text-muted-foreground mt-1 text-center text-xs">
				السؤال {currentIndex + 1} من {questions.length}
			</p>
		</div>

		<!-- Question Dots -->
		<div class="mb-6 flex flex-wrap justify-center gap-1.5">
			{#each questions as q, i}
				<button
					onclick={() => goTo(i)}
					class="h-7 w-7 rounded-full text-[11px] font-bold transition-all {currentIndex === i
						? 'scale-110 bg-purple-500 text-white shadow-md'
						: answers[q.id]
							? 'bg-purple-500/20 text-purple-300'
							: 'text-muted-foreground bg-white/10 hover:bg-white/20'}"
				>
					{i + 1}
				</button>
			{/each}
		</div>

		<!-- Question Card -->
		{#if currentQuestion}
			<div class="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
				<!-- Question Type Badge -->
				<div class="mb-4 flex items-center justify-between">
					<span
						class="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-400"
					>
						{typeLabels[currentQuestion.type] || currentQuestion.type}
					</span>
					<span class="text-muted-foreground text-xs">{currentQuestion.points} نقطة</span>
				</div>

				<!-- Question Text -->
				<h2 class="mb-6 text-lg font-bold sm:text-xl">
					{currentQuestion.questionTextAr || currentQuestion.questionText}
				</h2>

				<!-- Dynamic Question Component -->
				{#if currentQuestion.type === 'mcq'}
					<MCQ data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'true_false'}
					<TrueFalse data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'ordering'}
					<Ordering data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'drag_drop'}
					<DragDrop data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'matching'}
					<Matching data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'fill_blank'}
					<FillBlank data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'short_answer'}
					<ShortAnswer data={currentQuestion.questionData} {onAnswer} />
				{:else if currentQuestion.type === 'cloze'}
					<Cloze data={currentQuestion.questionData} {onAnswer} />
				{/if}
			</div>

			<!-- Navigation -->
			<div class="mt-6 flex items-center justify-between">
				<button
					onclick={prev}
					disabled={currentIndex === 0}
					class="flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 disabled:opacity-30"
				>
					<ChevronRight size={18} /> السابق
				</button>

				{#if currentIndex === questions.length - 1}
					<button
						onclick={submit}
						disabled={!allAnswered}
						class="rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 disabled:opacity-50"
					>
						<Trophy size={18} class="-mt-0.5 mr-1 inline" /> إرسال الإجابات
					</button>
				{:else}
					<button
						onclick={next}
						class="flex items-center gap-1 rounded-lg bg-purple-600/20 px-4 py-2.5 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-600/30"
					>
						التالي <ChevronLeft size={18} />
					</button>
				{/if}
			</div>
		{/if}
	{:else if results}
		<!-- Results Page -->
		<div class="text-center">
			<!-- Score Circle -->
			<div class="relative mx-auto mb-6 flex h-40 w-40 items-center justify-center">
				<svg class="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
					<circle
						cx="60"
						cy="60"
						r="54"
						fill="none"
						stroke="currentColor"
						stroke-width="8"
						class="text-white/10"
					/>
					<circle
						cx="60"
						cy="60"
						r="54"
						fill="none"
						stroke-width="8"
						stroke-dasharray={2 * Math.PI * 54}
						stroke-dashoffset={2 * Math.PI * 54 * (1 - percentage / 100)}
						stroke-linecap="round"
						class="{passed ? 'text-emerald-500' : 'text-red-500'} transition-all duration-1000"
					/>
				</svg>
				<div>
					<p class="text-4xl font-extrabold {passed ? 'text-emerald-400' : 'text-red-400'}">
						{percentage}%
					</p>
					<p class="text-muted-foreground text-sm">{results.score}/{results.total}</p>
				</div>
			</div>

			<h2 class="mb-2 text-2xl font-bold">
				{passed ? '🎉 أحسنت!' : '💪 حاول مرة أخرى'}
			</h2>
			<p class="text-muted-foreground mb-2">
				الوقت: {formatTime(elapsed)}
			</p>
			<p class="text-muted-foreground mb-8">
				{passed ? 'لقد اجتزت التمرين بنجاح!' : `تحتاج ${quiz.passingScore || 60}% للنجاح`}
			</p>

			<!-- Answer Review -->
			<div class="mb-8 space-y-3 text-right">
				<h3 class="text-lg font-bold">مراجعة الإجابات</h3>
				{#each results.details as detail, i}
					<div
						class="bg-card rounded-xl border p-4 {detail.correct
							? 'border-emerald-500/20'
							: 'border-red-500/20'}"
					>
						<div class="flex items-start gap-3">
							<div class="mt-0.5 shrink-0">
								{#if detail.correct}
									<CheckCircle size={20} class="text-emerald-500" />
								{:else}
									<XCircle size={20} class="text-red-500" />
								{/if}
							</div>
							<div>
								<p class="font-semibold">
									{i + 1}. {detail.question.questionTextAr || detail.question.questionText}
								</p>
								<span class="text-muted-foreground text-xs">
									{typeLabels[detail.question.type]} • {detail.points}/{detail.question.points} نقطة
								</span>
								{#if detail.question.explanation && !detail.correct}
									<p class="mt-2 rounded-lg bg-amber-500/10 p-2 text-sm text-amber-300">
										💡 {detail.question.explanation}
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Actions -->
			<div class="flex justify-center gap-3">
				<button
					onclick={restart}
					class="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-purple-700"
				>
					<RotateCcw size={18} /> إعادة المحاولة
				</button>
				<a
					href="/quizzes"
					class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold transition-all hover:bg-white/10"
				>
					تمارين أخرى
				</a>
			</div>
		</div>
	{/if}
</div>
