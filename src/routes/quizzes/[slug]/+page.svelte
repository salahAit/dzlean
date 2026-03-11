<script lang="ts">
	import {
		ChevronLeft,
		ChevronRight,
		Clock,
		Brain,
		Trophy,
		CheckCircle,
		XCircle,
		RotateCcw,
		AlertTriangle,
		Zap,
		BookOpen,
		Share2,
		Eye,
		EyeOff
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
	import { onMount, onDestroy } from 'svelte';

	let { data }: { data: any } = $props();

	let quiz = $derived(data.quiz);
	let rawQuestions = $derived(data.questions || []);

	// Shuffle questions' MCQ options if enabled
	let questions = $derived.by(() => {
		if (!quiz?.shuffleOptions) return rawQuestions;
		return rawQuestions.map((q: any) => {
			if (q.type !== 'mcq' || !q.questionData?.options) return q;
			const opts = [...q.questionData.options];
			// Fisher-Yates shuffle
			for (let i = opts.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[opts[i], opts[j]] = [opts[j], opts[i]];
			}
			return { ...q, questionData: { ...q.questionData, options: opts } };
		});
	});

	// Mode: 'choose' | 'exam' | 'practice'
	let mode = $state<'choose' | 'exam' | 'practice'>('choose');

	// State
	let currentIndex = $state(0);
	let answers = $state<Record<number, any>>({});
	let submitted = $state(false);
	let results = $state<{ score: number; total: number; details: any[] } | null>(null);
	let startTime = $state(Date.now());
	let elapsed = $state(0);
	let timerInterval: any;
	let autoSubmitted = $state(false);
	let showReview = $state(false);
	let copied = $state(false);

	// Practice mode state
	let practiceChecked = $state<Record<number, boolean>>({});
	let practiceResults = $state<Record<number, boolean>>({});

	let currentQuestion = $derived(questions[currentIndex]);
	let progress = $derived(((currentIndex + 1) / questions.length) * 100);
	let allAnswered = $derived(Object.keys(answers).length === questions.length);
	let percentage = $derived(results ? Math.round((results.score / results.total) * 100) : 0);
	let passed = $derived(percentage >= (quiz?.passingScore || 60));

	// Smart timer
	let hasTimeLimit = $derived(quiz?.timeLimit && quiz.timeLimit > 0);
	let remaining = $derived(hasTimeLimit ? Math.max(0, quiz.timeLimit - elapsed) : 0);
	let timerPercentage = $derived(hasTimeLimit ? (remaining / quiz.timeLimit) * 100 : 100);
	let timerColor = $derived(
		timerPercentage > 50
			? 'text-emerald-400'
			: timerPercentage > 20
				? 'text-amber-400'
				: 'text-red-400'
	);
	let timerBarColor = $derived(
		timerPercentage > 50 ? 'bg-emerald-500' : timerPercentage > 20 ? 'bg-amber-500' : 'bg-red-500'
	);
	let timerUrgent = $derived(hasTimeLimit && remaining <= 30 && remaining > 0);

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

	function startQuiz(selectedMode: 'exam' | 'practice') {
		mode = selectedMode;
		startTime = Date.now();
		elapsed = 0;
		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
			// Auto-submit when time is up (exam mode only)
			if (hasTimeLimit && remaining <= 0 && mode === 'exam' && !submitted) {
				autoSubmitted = true;
				submit();
			}
		}, 1000);
	}

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

	function getCorrectAnswer(question: any): string {
		const qd = question.questionData;
		switch (question.type) {
			case 'mcq': {
				const opts = qd.options || [];
				if (qd.correctIndexes) {
					return qd.correctIndexes
						.map((i: number) => (typeof opts[i] === 'string' ? opts[i] : opts[i]?.text))
						.join(', ');
				}
				const correct = opts.filter((o: any) => typeof o === 'object' && o.isCorrect);
				return correct.map((o: any) => o.text).join(', ');
			}
			case 'true_false':
				return qd.correctAnswer ? 'صحيح ✓' : 'خطأ ✗';
			case 'fill_blank':
				return qd.answers?.join(' أو ') || '';
			case 'ordering':
				return qd.correctOrder?.map((i: number) => qd.items?.[i]).join(' → ') || '';
			case 'short_answer':
				return qd.keywords?.join(', ') || '';
			case 'cloze':
				return qd.options?.[qd.correctIndex] || '';
			default:
				return '';
		}
	}

	function getUserAnswer(question: any, answer: any): string {
		if (!answer) return 'لم تتم الإجابة';
		const qd = question.questionData;
		switch (question.type) {
			case 'mcq': {
				const opts = qd.options || [];
				if (answer.selectedIndexes) {
					return answer.selectedIndexes
						.map((i: number) => (typeof opts[i] === 'string' ? opts[i] : opts[i]?.text))
						.join(', ');
				}
				return 'لم تتم الإجابة';
			}
			case 'true_false':
				return answer.value === true
					? 'صحيح ✓'
					: answer.value === false
						? 'خطأ ✗'
						: 'لم تتم الإجابة';
			case 'fill_blank':
			case 'short_answer':
				return answer.text || 'لم تتم الإجابة';
			case 'ordering':
				return answer.order?.join(' → ') || 'لم تتم الإجابة';
			case 'cloze':
				return qd.options?.[answer.selectedIndex] || 'لم تتم الإجابة';
			default:
				return JSON.stringify(answer);
		}
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

	// Practice mode: check current question
	function checkPractice() {
		const q = currentQuestion;
		const answer = answers[q.id];
		const correct = checkAnswer(q, answer);
		practiceChecked = { ...practiceChecked, [q.id]: true };
		practiceResults = { ...practiceResults, [q.id]: correct };
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
				points: correct ? q.points : 0,
				correctAnswer: getCorrectAnswer(q),
				userAnswer: getUserAnswer(q, answer)
			};
		});

		const score = details.reduce((sum: number, d: any) => sum + d.points, 0);
		const total = questions.reduce((sum: number, q: any) => sum + q.points, 0);
		const pct = Math.round((score / total) * 100);

		results = { score, total, details };
		submitted = true;

		// Only save in exam mode
		if (mode === 'exam') {
			fetch(`/api/quizzes/${quiz.id}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quizId: quiz.id,
					score,
					totalPoints: total,
					percentage: pct,
					timeTaken: elapsed,
					details
				})
			}).catch((err) => console.error('Failed to submit quiz attempt:', err));
		}
	}

	function restart() {
		currentIndex = 0;
		answers = {};
		submitted = false;
		results = null;
		autoSubmitted = false;
		showReview = false;
		practiceChecked = {};
		practiceResults = {};
		startTime = Date.now();
		elapsed = 0;
		timerInterval = setInterval(() => {
			elapsed = Math.floor((Date.now() - startTime) / 1000);
			if (hasTimeLimit && remaining <= 0 && mode === 'exam' && !submitted) {
				autoSubmitted = true;
				submit();
			}
		}, 1000);
	}

	function copyLink() {
		try {
			navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}
</script>

<svelte:head>
	<title>{quiz.titleAr || quiz.title} - SujetStore</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
	{#if mode === 'choose'}
		<!-- Mode Selection Screen -->
		<div class="py-10 text-center">
			<div
				class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 dark:bg-purple-500/20"
			>
				<Brain size={40} class="text-purple-600 dark:text-purple-400" />
			</div>
			<h1 class="mb-2 text-2xl font-extrabold sm:text-3xl">{quiz.titleAr || quiz.title}</h1>
			{#if quiz.description}
				<p class="text-muted-foreground mx-auto mb-6 max-w-md">{quiz.description}</p>
			{/if}

			<div class="text-muted-foreground mb-8 flex flex-wrap justify-center gap-4 text-sm">
				<span class="flex items-center gap-1"><Brain size={16} /> {questions.length} سؤال</span>
				{#if hasTimeLimit}
					<span class="flex items-center gap-1"
						><Clock size={16} /> {Math.floor(quiz.timeLimit / 60)} دقيقة</span
					>
				{/if}
				<span class="flex items-center gap-1"
					><Trophy size={16} /> {quiz.passingScore || 60}% للنجاح</span
				>
			</div>

			<div class="mx-auto flex max-w-sm flex-col gap-3">
				<!-- Exam Mode -->
				<button
					onclick={() => startQuiz('exam')}
					class="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-purple-600/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
				>
					<Trophy size={22} class="transition-transform group-hover:scale-110" />
					وضع الامتحان
				</button>
				<p class="text-muted-foreground -mt-1 text-xs">
					يتم حفظ النتيجة • مؤقت {hasTimeLimit ? 'محدود' : 'غير محدود'}
				</p>

				<!-- Practice Mode -->
				<button
					onclick={() => startQuiz('practice')}
					class="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-4 text-lg font-bold text-emerald-600 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/20 dark:text-emerald-400"
				>
					<BookOpen size={22} class="transition-transform group-hover:scale-110" />
					وضع التدريب
				</button>
				<p class="text-muted-foreground -mt-1 text-xs">تحقق فوري لكل سؤال • بدون حفظ النتيجة</p>
			</div>

			<!-- Share -->
			<button
				onclick={copyLink}
				class="text-muted-foreground hover:text-foreground relative mt-8 inline-flex items-center gap-2 text-sm transition-colors"
			>
				{#if copied}
					<span
						class="animate-in fade-in slide-in-from-bottom-2 absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-lg"
					>
						تم النسخ بنجاح!
					</span>
				{/if}
				<Share2 size={16} />
				{copied ? 'تم النسخ!' : 'نسخ رابط التمرين'}
			</button>
		</div>
	{:else if !submitted}
		<!-- Quiz Header -->
		<div class="mb-4">
			<div class="flex items-center justify-between">
				<h1 class="text-lg font-bold sm:text-xl">{quiz.titleAr || quiz.title}</h1>
				{#if mode === 'practice'}
					<span
						class="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
					>
						<BookOpen size={12} class="-mt-0.5 mr-1 inline" /> وضع التدريب
					</span>
				{/if}
			</div>
			<div class="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
				<span class="flex items-center gap-1"><Brain size={16} /> {questions.length} سؤال</span>
				{#if hasTimeLimit && mode === 'exam'}
					<span
						class="flex items-center gap-1 {timerColor} {timerUrgent
							? 'animate-pulse font-bold'
							: ''}"
					>
						<Clock size={16} />
						{formatTime(remaining)}
					</span>
				{:else}
					<span class="flex items-center gap-1"><Clock size={16} /> {formatTime(elapsed)}</span>
				{/if}
			</div>
		</div>

		<!-- Timer Bar (when time limited) -->
		{#if hasTimeLimit && mode === 'exam'}
			<div class="mb-4">
				<div class="bg-muted h-1.5 overflow-hidden rounded-full">
					<div
						class="{timerBarColor} h-full rounded-full transition-all duration-1000"
						style="width: {timerPercentage}%"
					></div>
				</div>
			</div>
		{/if}

		<!-- Progress Bar -->
		<div class="mb-4">
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
					class="h-7 w-7 rounded-full text-[11px] font-bold transition-all
						{currentIndex === i
						? 'scale-110 bg-purple-500 text-white shadow-md'
						: practiceChecked[q.id]
							? practiceResults[q.id]
								? 'bg-emerald-500/30 text-emerald-300'
								: 'bg-red-500/30 text-red-300'
							: answers[q.id]
								? 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
								: 'text-muted-foreground bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'}"
				>
					{i + 1}
				</button>
			{/each}
		</div>

		<!-- Question Card -->
		{#if currentQuestion}
			{#key currentQuestion.id}
				<div class="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
					<div class="mb-4 flex items-center justify-between">
						<span
							class="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400"
						>
							{typeLabels[currentQuestion.type] || currentQuestion.type}
						</span>
						<span class="text-muted-foreground text-xs">{currentQuestion.points} نقطة</span>
					</div>

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
					{:else if currentQuestion.type === 'calculated'}
						<Calculated data={currentQuestion.questionData} {onAnswer} />
					{:else if currentQuestion.type === 'sentence_reorder'}
						<SentenceReorder data={currentQuestion.questionData} {onAnswer} />
					{:else if currentQuestion.type === 'hotspot'}
						<Hotspot data={currentQuestion.questionData} {onAnswer} />
					{:else if currentQuestion.type === 'drag_to_image'}
						<DragToImage data={currentQuestion.questionData} {onAnswer} />
					{:else if currentQuestion.type === 'matrix'}
						<Matrix data={currentQuestion.questionData} {onAnswer} />
					{:else if currentQuestion.type === 'essay'}
						<Essay data={currentQuestion.questionData} {onAnswer} />
					{/if}

					<!-- Practice Mode: Instant Check Button -->
					{#if mode === 'practice' && answers[currentQuestion.id] && !practiceChecked[currentQuestion.id]}
						<button
							onclick={checkPractice}
							class="mt-6 w-full rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
						>
							<Zap size={18} class="-mt-0.5 mr-1 inline" /> تحقق من الإجابة
						</button>
					{/if}

					<!-- Practice Mode: Result Feedback -->
					{#if mode === 'practice' && practiceChecked[currentQuestion.id]}
						<div
							class="mt-6 rounded-xl border p-4 {practiceResults[currentQuestion.id]
								? 'border-emerald-500/30 bg-emerald-500/10'
								: 'border-red-500/30 bg-red-500/10'}"
						>
							<div
								class="flex items-center gap-2 font-bold {practiceResults[currentQuestion.id]
									? 'text-emerald-600 dark:text-emerald-400'
									: 'text-red-600 dark:text-red-400'}"
							>
								{#if practiceResults[currentQuestion.id]}
									<CheckCircle size={20} /> إجابة صحيحة! 🎉
								{:else}
									<XCircle size={20} /> إجابة خاطئة
								{/if}
							</div>
							{#if !practiceResults[currentQuestion.id]}
								<p class="mt-2 text-sm">
									<span class="font-semibold text-emerald-600 dark:text-emerald-400"
										>الإجابة الصحيحة:</span
									>
									{getCorrectAnswer(currentQuestion)}
								</p>
							{/if}
							{#if currentQuestion.explanation}
								<p
									class="mt-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300"
								>
									💡 <span class="font-semibold">شرح:</span>
									{currentQuestion.explanation}
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/key}

			<!-- Navigation -->
			<div class="mt-6 flex items-center justify-between">
				<button
					onclick={prev}
					disabled={currentIndex === 0}
					class="flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
				>
					<ChevronRight size={18} /> السابق
				</button>

				{#if currentIndex === questions.length - 1 && mode === 'exam'}
					<button
						onclick={submit}
						disabled={!allAnswered}
						class="rounded-xl bg-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 disabled:opacity-50"
					>
						<Trophy size={18} class="-mt-0.5 mr-1 inline" /> إرسال الإجابات
					</button>
				{:else if currentIndex === questions.length - 1 && mode === 'practice'}
					<button
						onclick={submit}
						class="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
					>
						<Trophy size={18} class="-mt-0.5 mr-1 inline" /> عرض النتيجة النهائية
					</button>
				{:else}
					<button
						onclick={next}
						class="flex items-center gap-1 rounded-lg bg-purple-500/10 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-500/20 dark:bg-purple-600/20 dark:text-purple-300 dark:hover:bg-purple-600/30"
					>
						التالي <ChevronLeft size={18} />
					</button>
				{/if}
			</div>
		{/if}
	{:else if results}
		<!-- Results Page -->
		<div class="text-center">
			{#if autoSubmitted}
				<div
					class="mb-6 flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-amber-400"
				>
					<AlertTriangle size={20} /> انتهى الوقت! تم إرسال إجاباتك تلقائياً.
				</div>
			{/if}

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
						class="text-black/5 dark:text-white/10"
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
					<p
						class="text-4xl font-extrabold {passed
							? 'text-emerald-600 dark:text-emerald-400'
							: 'text-red-600 dark:text-red-400'}"
					>
						{percentage}%
					</p>
					<p class="text-muted-foreground text-sm">{results.score}/{results.total}</p>
				</div>
			</div>

			<h2 class="mb-2 text-2xl font-bold">
				{passed ? '🎉 أحسنت!' : '💪 حاول مرة أخرى'}
			</h2>
			<p class="text-muted-foreground mb-2">الوقت: {formatTime(elapsed)}</p>
			{#if mode === 'practice'}
				<p class="mb-4 text-sm text-emerald-600 dark:text-emerald-400">
					وضع التدريب — لم يتم حفظ النتيجة
				</p>
			{/if}
			<p class="text-muted-foreground mb-6">
				{passed ? 'لقد اجتزت التمرين بنجاح!' : `تحتاج ${quiz.passingScore || 60}% للنجاح`}
			</p>

			<!-- Toggle Review -->
			<button
				onclick={() => (showReview = !showReview)}
				class="mb-6 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-6 py-2.5 text-sm font-bold transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
			>
				{#if showReview}
					<EyeOff size={16} /> إخفاء مراجعة الإجابات
				{:else}
					<Eye size={16} /> مراجعة الإجابات المفصّلة
				{/if}
			</button>

			<!-- Detailed Answer Review -->
			{#if showReview}
				<div class="mb-8 space-y-4 text-right">
					{#each results.details as detail, i}
						<div
							class="bg-card overflow-hidden rounded-xl border {detail.correct
								? 'border-emerald-500/20'
								: 'border-red-500/20'}"
						>
							<div class="flex items-start gap-3 p-4">
								<div class="mt-0.5 shrink-0">
									{#if detail.correct}
										<CheckCircle size={20} class="text-emerald-500" />
									{:else}
										<XCircle size={20} class="text-red-500" />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="font-semibold">
										{i + 1}. {detail.question.questionTextAr || detail.question.questionText}
									</p>
									<span class="text-muted-foreground text-xs">
										{typeLabels[detail.question.type]} • {detail.points}/{detail.question.points} نقطة
									</span>

									<!-- User Answer vs Correct Answer -->
									<div class="mt-3 space-y-2">
										<div
											class="flex items-start gap-2 rounded-lg {detail.correct
												? 'bg-emerald-500/5'
												: 'bg-red-500/5'} p-2"
										>
											<span
												class="shrink-0 text-xs font-bold {detail.correct
													? 'text-emerald-400'
													: 'text-red-400'}">إجابتك:</span
											>
											<span class="text-sm {detail.correct ? 'text-emerald-300' : 'text-red-300'}"
												>{detail.userAnswer}</span
											>
										</div>
										{#if !detail.correct}
											<div class="flex items-start gap-2 rounded-lg bg-emerald-500/5 p-2">
												<span class="shrink-0 text-xs font-bold text-emerald-400">الصحيحة:</span>
												<span class="text-sm text-emerald-300">{detail.correctAnswer}</span>
											</div>
										{/if}
									</div>

									<!-- Explanation (always shown) -->
									{#if detail.question.explanation}
										<p class="mt-2 rounded-lg bg-amber-500/10 p-2 text-sm text-amber-300">
											💡 {detail.question.explanation}
										</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex flex-wrap justify-center gap-3">
				<button
					onclick={restart}
					class="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-purple-700"
				>
					<RotateCcw size={18} /> إعادة المحاولة
				</button>
				<button
					onclick={copyLink}
					class="relative flex items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-6 py-3 font-bold transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
				>
					{#if copied}
						<span
							class="animate-in fade-in slide-in-from-bottom-2 absolute -top-12 left-1/2 -translate-x-1/2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-lg"
						>
							تم النسخ بنجاح!
						</span>
					{/if}
					<Share2 size={18} />
					{copied ? 'تم النسخ!' : 'مشاركة'}
				</button>
				<a
					href="/quizzes"
					class="flex items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-6 py-3 font-bold transition-all hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
				>
					تمارين أخرى
				</a>
			</div>
		</div>
	{/if}
</div>
