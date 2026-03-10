<script lang="ts">
	import { onMount } from 'svelte';
	import { BarChart3, TrendingUp, BookOpen, CheckCircle, Inbox } from 'lucide-svelte';

	let { data }: { data: any } = $props();
	let visitedDocs = $state<Set<string>>(new Set());
	let mounted = $state(false);

	onMount(() => {
		const stored = localStorage.getItem('visited_docs');
		if (stored) {
			try {
				visitedDocs = new Set(JSON.parse(stored));
			} catch (e) {}
		}
		mounted = true;
	});

	// Calculate progress per subject
	let progressData = $derived.by(() => {
		if (!mounted || !data?.subjects) return [];

		return data.subjects
			.map((sub: any) => {
				const totalDocs = sub.doc_count;
				if (totalDocs === 0) return null;

				// Count unique doc IDs visited (both exam and solution count as 1)
				const visitedCount = sub.doc_ids
					? sub.doc_ids.split(',').filter((id: string) => {
							return visitedDocs.has(`${id}-exam`) || visitedDocs.has(`${id}-solution`);
						}).length
					: 0;

				const percentage = Math.round((visitedCount / totalDocs) * 100);

				return {
					...sub,
					totalDocs,
					visitedCount,
					percentage
				};
			})
			.filter(Boolean);
	});

	let totalVisited = $derived(
		progressData.reduce((sum: number, s: any) => sum + s.visitedCount, 0)
	);
	let totalDocs = $derived(progressData.reduce((sum: number, s: any) => sum + s.totalDocs, 0));
	let overallPercentage = $derived(
		totalDocs > 0 ? Math.round((totalVisited / totalDocs) * 100) : 0
	);
</script>

<svelte:head>
	<title>تقدمي - SujetStore</title>
	<meta name="description" content="تتبع تقدمك في مراجعة الوثائق التعليمية" />
</svelte:head>

<section class="py-10 lg:py-14">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10"
			>
				<BarChart3 size={32} class="text-blue-500" />
			</div>
			<h1 class="text-3xl font-extrabold">تقدمي</h1>
			<p class="text-muted-foreground mt-2">تتبع تقدمك في مراجعة الوثائق التعليمية</p>
		</div>

		{#if !mounted}
			<div class="flex items-center justify-center py-16">
				<div class="text-muted-foreground animate-pulse">جاري التحميل...</div>
			</div>
		{:else}
			<!-- Overall Stats -->
			<div class="bg-card mb-8 rounded-xl border p-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-lg font-bold">
						<TrendingUp size={20} class="text-blue-500" />
						التقدم العام
					</h2>
					<span class="text-2xl font-extrabold text-blue-500">{overallPercentage}%</span>
				</div>
				<div class="bg-muted h-3 overflow-hidden rounded-full">
					<div
						class="h-full rounded-full bg-linear-to-l from-blue-500 to-blue-600 transition-all duration-500"
						style="width: {overallPercentage}%"
					></div>
				</div>
				<p class="text-muted-foreground mt-2 text-sm">
					{totalVisited} من {totalDocs} وثيقة تم الاطلاع عليها
				</p>
			</div>

			<!-- Per-Subject Progress -->
			{#if progressData.length > 0}
				<div class="flex flex-col gap-3">
					{#each progressData as sub}
						<div class="bg-card rounded-xl border p-4 transition-all hover:bg-white/5">
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-lg"
										style="background: {sub.subject_color}20"
									>
										<BookOpen size={18} style="color: {sub.subject_color}" />
									</div>
									<div>
										<h3 class="font-bold">{sub.subject_name}</h3>
										<p class="text-muted-foreground text-xs">
											{sub.level_name} · {sub.year_name}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									{#if sub.percentage === 100}
										<CheckCircle size={18} class="text-emerald-500" />
									{/if}
									<span
										class="text-lg font-extrabold {sub.percentage === 100
											? 'text-emerald-500'
											: sub.percentage > 50
												? 'text-blue-500'
												: 'text-muted-foreground'}"
									>
										{sub.percentage}%
									</span>
								</div>
							</div>
							<div class="bg-muted h-2 overflow-hidden rounded-full">
								<div
									class="h-full rounded-full transition-all duration-500 {sub.percentage === 100
										? 'bg-emerald-500'
										: 'bg-blue-500'}"
									style="width: {sub.percentage}%"
								></div>
							</div>
							<p class="text-muted-foreground mt-1.5 text-xs">
								{sub.visitedCount} / {sub.totalDocs}
							</p>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
					<Inbox size={48} class="mb-4 opacity-50" />
					<h3 class="mb-2 text-xl font-bold">لم تبدأ بعد</h3>
					<p class="text-sm">ابدأ بتصفح الوثائق لتتبع تقدمك هنا</p>
				</div>
			{/if}
		{/if}
	</div>
</section>
