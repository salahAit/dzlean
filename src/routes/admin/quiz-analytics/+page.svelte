<script lang="ts">
	import {
		BarChart3,
		Brain,
		Users,
		TrendingUp,
		Clock,
		Trophy,
		Target,
		Percent,
		ArrowLeft
	} from 'lucide-svelte';
	import { onMount } from 'svelte';

	let stats = $state<any>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/quiz-analytics');
			stats = await res.json();
		} catch (e) {
			console.error(e);
		}
		loading = false;
	});
</script>

<svelte:head>
	<title>إحصائيات التمارين - SujetStore</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-3 text-2xl font-extrabold sm:text-3xl">
				<BarChart3 size={28} class="text-purple-400" /> إحصائيات التمارين
			</h1>
			<p class="text-muted-foreground mt-1">تحليل أداء الطلاب في التمارين التفاعلية</p>
		</div>
		<a
			href="/admin"
			class="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
		>
			<ArrowLeft size={16} /> العودة
		</a>
	</div>

	{#if loading}
		<div class="py-20 text-center">
			<div
				class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"
			></div>
			<p class="text-muted-foreground mt-4">جاري التحميل...</p>
		</div>
	{:else if stats}
		<!-- Overview Cards -->
		<div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
			<div class="bg-card rounded-xl border p-5 shadow-sm">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400"
					>
						<Users size={20} />
					</div>
					<div>
						<p class="text-2xl font-extrabold">{stats.overview.totalAttempts}</p>
						<p class="text-muted-foreground text-xs">إجمالي المحاولات</p>
					</div>
				</div>
			</div>
			<div class="bg-card rounded-xl border p-5 shadow-sm">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"
					>
						<Percent size={20} />
					</div>
					<div>
						<p class="text-2xl font-extrabold">{stats.overview.avgScore}%</p>
						<p class="text-muted-foreground text-xs">متوسط النتائج</p>
					</div>
				</div>
			</div>
			<div class="bg-card rounded-xl border p-5 shadow-sm">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
					>
						<Brain size={20} />
					</div>
					<div>
						<p class="text-2xl font-extrabold">{stats.overview.totalQuizzes}</p>
						<p class="text-muted-foreground text-xs">تمارين منشورة</p>
					</div>
				</div>
			</div>
			<div class="bg-card rounded-xl border p-5 shadow-sm">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"
					>
						<Target size={20} />
					</div>
					<div>
						<p class="text-2xl font-extrabold">{stats.overview.totalQuestions}</p>
						<p class="text-muted-foreground text-xs">سؤال في البنك</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Score Distribution -->
		{#if stats.distribution.length > 0}
			<div class="bg-card mb-8 rounded-xl border p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-bold">
					<TrendingUp size={20} class="text-purple-400" /> توزيع الدرجات
				</h2>
				<div class="space-y-3">
					{#each stats.distribution as item}
						{@const maxCount = Math.max(...stats.distribution.map((d: any) => d.count))}
						<div class="flex items-center gap-3">
							<span class="w-32 shrink-0 text-left text-sm font-medium">{item.range}</span>
							<div class="bg-muted h-6 flex-1 overflow-hidden rounded-full">
								<div
									class="flex h-full items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 px-2 text-xs font-bold text-white transition-all duration-500"
									style="width: {Math.max(8, (item.count / maxCount) * 100)}%"
								>
									{item.count}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Per-Quiz Stats Table -->
		{#if stats.quizStats.length > 0}
			<div class="bg-card mb-8 overflow-hidden rounded-xl border shadow-sm">
				<div class="border-b p-4">
					<h2 class="flex items-center gap-2 text-lg font-bold">
						<Trophy size={20} class="text-amber-400" /> أداء كل تمرين
					</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="bg-muted/50 text-muted-foreground text-xs">
							<tr>
								<th class="px-4 py-3 text-right font-semibold">التمرين</th>
								<th class="px-4 py-3 text-center font-semibold">المحاولات</th>
								<th class="px-4 py-3 text-center font-semibold">المتوسط</th>
								<th class="px-4 py-3 text-center font-semibold">الأعلى</th>
								<th class="px-4 py-3 text-center font-semibold">نسبة النجاح</th>
								<th class="px-4 py-3 text-center font-semibold">متوسط الوقت</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.quizStats as quiz}
								<tr class="border-t border-white/5 transition hover:bg-white/5">
									<td class="px-4 py-3 font-semibold">{quiz.title}</td>
									<td class="px-4 py-3 text-center">{quiz.attempts}</td>
									<td class="px-4 py-3 text-center">
										<span
											class="rounded-full px-2 py-0.5 text-xs font-bold {quiz.avg_score >= 60
												? 'bg-emerald-500/10 text-emerald-400'
												: 'bg-red-500/10 text-red-400'}"
										>
											{quiz.avg_score}%
										</span>
									</td>
									<td class="px-4 py-3 text-center text-emerald-400">{quiz.best_score}%</td>
									<td class="px-4 py-3 text-center">
										<span
											class="rounded-full px-2 py-0.5 text-xs font-bold {quiz.passRate >= 50
												? 'bg-emerald-500/10 text-emerald-400'
												: 'bg-amber-500/10 text-amber-400'}"
										>
											{quiz.passRate}%
										</span>
									</td>
									<td class="text-muted-foreground px-4 py-3 text-center">
										<Clock size={12} class="-mt-0.5 inline" />
										{Math.floor(quiz.avg_time / 60)}:{String(quiz.avg_time % 60).padStart(2, '0')}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Recent Attempts -->
		{#if stats.recentAttempts.length > 0}
			<div class="bg-card overflow-hidden rounded-xl border shadow-sm">
				<div class="border-b p-4">
					<h2 class="flex items-center gap-2 text-lg font-bold">
						<Clock size={20} class="text-blue-400" /> آخر المحاولات
					</h2>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead class="bg-muted/50 text-muted-foreground text-xs">
							<tr>
								<th class="px-4 py-3 text-right font-semibold">التمرين</th>
								<th class="px-4 py-3 text-center font-semibold">النتيجة</th>
								<th class="px-4 py-3 text-center font-semibold">الوقت</th>
								<th class="px-4 py-3 text-center font-semibold">التاريخ</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recentAttempts as attempt}
								<tr class="border-t border-white/5 transition hover:bg-white/5">
									<td class="px-4 py-3 font-medium">{attempt.quizTitle}</td>
									<td class="px-4 py-3 text-center">
										<span
											class="rounded-full px-2 py-0.5 text-xs font-bold {attempt.percentage >= 60
												? 'bg-emerald-500/10 text-emerald-400'
												: 'bg-red-500/10 text-red-400'}"
										>
											{Math.round(attempt.percentage)}%
										</span>
									</td>
									<td class="text-muted-foreground px-4 py-3 text-center">
										{Math.floor(attempt.time_taken / 60)}:{String(attempt.time_taken % 60).padStart(
											2,
											'0'
										)}
									</td>
									<td class="text-muted-foreground px-4 py-3 text-center text-xs">
										{attempt.attempt_date || '—'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		{#if stats.overview.totalAttempts === 0}
			<div class="py-16 text-center">
				<BarChart3 size={48} class="mx-auto mb-4 text-purple-400 opacity-40" />
				<h3 class="text-lg font-bold">لا توجد بيانات بعد</h3>
				<p class="text-muted-foreground text-sm">ستظهر الإحصائيات عندما يبدأ الطلاب بحل التمارين</p>
			</div>
		{/if}
	{/if}
</div>
