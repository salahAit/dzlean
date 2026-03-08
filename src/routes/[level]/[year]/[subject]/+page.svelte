<script lang="ts">
	let { data }: { data: any } = $props();

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل'
	};

	const typeIcons: Record<string, string> = {
		exam: '📋',
		test: '📝',
		lesson: '📖',
		summary: '📌',
		exercise: '✏️',
		solution: '✅'
	};

	// Group documents by trimester
	function getDocsByTrimester(trimId: string | null) {
		return data.documents.filter((d: any) => d.trimester_id === trimId);
	}

	// Get documents without trimester (summaries, general lessons)
	function getGeneralDocs() {
		return data.documents.filter((d: any) => !d.trimester_id);
	}
</script>

<svelte:head>
	<title>{data.subject.name_ar} - {data.year.name_ar} - DzLearn</title>
	<meta name="description" content="فروض واختبارات {data.subject.name_ar} - {data.year.name_ar}" />
</svelte:head>

<!-- Breadcrumb -->
<div class="border-b border-white/10 bg-white/[0.02]">
	<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
		<nav class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
			<a href="/" class="hover:text-foreground transition-colors">الرئيسية</a>
			<span class="opacity-50">/</span>
			<a href="/{data.level.slug}" class="hover:text-foreground transition-colors"
				>{data.level.name_ar}</a
			>
			<span class="opacity-50">/</span>
			<a href="/{data.level.slug}/{data.year.slug}" class="hover:text-foreground transition-colors"
				>{data.year.name_ar}</a
			>
			<span class="opacity-50">/</span>
			<span class="text-foreground font-semibold">{data.subject.name_ar}</span>
		</nav>
	</div>
</div>

<!-- Subject Header -->
<section class="hero-gradient py-10 lg:py-14">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-center gap-5">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
				style="background: {data.subject.color}20; border: 1px solid {data.subject.color}40"
			>
				{data.subject.icon}
			</div>
			<div class="text-center sm:text-right">
				<h1 class="text-3xl font-extrabold lg:text-4xl">{data.subject.name_ar}</h1>
				<p class="text-muted-foreground">{data.year.name_ar} • {data.subject.name_fr}</p>
			</div>
		</div>

		<!-- Quick stats -->
		<div class="mt-6 flex justify-center gap-6">
			<div class="text-center">
				<div class="text-xl font-bold">{data.documents.length}</div>
				<div class="text-muted-foreground text-xs">وثيقة</div>
			</div>
			<div class="text-center">
				<div class="text-xl font-bold text-red-400">
					{data.documents.filter((d: any) => d.type === 'exam').length}
				</div>
				<div class="text-muted-foreground text-xs">اختبار</div>
			</div>
			<div class="text-center">
				<div class="text-xl font-bold text-orange-400">
					{data.documents.filter((d: any) => d.type === 'test').length}
				</div>
				<div class="text-muted-foreground text-xs">فرض</div>
			</div>
		</div>
	</div>
</section>

<!-- Documents Content -->
<section class="py-10 lg:py-14">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Documents by Trimester -->
		{#each data.trimesters as trimester}
			{@const docs = getDocsByTrimester(trimester.id)}
			{#if docs.length > 0}
				<div class="mb-10">
					<div class="mb-5 flex items-center gap-3">
						<div class="h-8 w-1 rounded-full" style="background: {data.subject.color}"></div>
						<h2 class="text-xl font-bold">{trimester.name_ar}</h2>
						<span class="text-muted-foreground text-sm">({trimester.name_fr})</span>
						<span class="text-muted-foreground rounded-full bg-white/5 px-2 py-1 text-xs"
							>{docs.length}</span
						>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each docs as doc}
							<div class="glass-card p-5 transition-all duration-300 hover:scale-[1.01]">
								<div class="flex items-start gap-3">
									<span class="text-xl">{typeIcons[doc.type] || '📄'}</span>
									<div class="min-w-0 flex-1">
										<div class="mb-2 flex flex-wrap items-center gap-2">
											<span class="rounded-full border px-2 py-0.5 text-xs badge-{doc.type}">
												{typeLabels[doc.type] || doc.type}
											</span>
											{#if doc.has_solution}
												<span
													class="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400"
												>
													مع الحل ✅
												</span>
											{/if}
										</div>
										<h3 class="text-sm leading-relaxed font-semibold">
											{doc.title_ar || doc.title}
										</h3>
										{#if doc.source}
											<p class="text-muted-foreground mt-2 text-xs">{doc.source}</p>
										{/if}
										{#if doc.academic_year}
											<p class="text-muted-foreground text-xs">📅 {doc.academic_year}</p>
										{/if}
									</div>
								</div>

								{#if doc.pdf_url}
									<div class="mt-4 border-t border-white/5 pt-3">
										<a
											href={doc.pdf_url}
											target="_blank"
											class="text-primary hover:text-primary-foreground inline-flex items-center gap-2 text-sm transition-colors"
										>
											📥 تحميل PDF
										</a>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}

		<!-- General Documents (no trimester) -->
		{#if getGeneralDocs().length > 0}
			{@const generalDocs = getGeneralDocs()}
			<div class="mb-10">
				<div class="mb-5 flex items-center gap-3">
					<div class="h-8 w-1 rounded-full bg-emerald-500"></div>
					<h2 class="text-xl font-bold">دروس وملخصات عامة</h2>
					<span class="text-muted-foreground rounded-full bg-white/5 px-2 py-1 text-xs"
						>{generalDocs.length}</span
					>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each generalDocs as doc}
						<div class="glass-card p-5 transition-all duration-300 hover:scale-[1.01]">
							<div class="flex items-start gap-3">
								<span class="text-xl">{typeIcons[doc.type] || '📄'}</span>
								<div class="min-w-0 flex-1">
									<div class="mb-2 flex items-center gap-2">
										<span class="rounded-full border px-2 py-0.5 text-xs badge-{doc.type}">
											{typeLabels[doc.type] || doc.type}
										</span>
									</div>
									<h3 class="text-sm leading-relaxed font-semibold">{doc.title_ar || doc.title}</h3>
									{#if doc.source}
										<p class="text-muted-foreground mt-2 text-xs">{doc.source}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if data.documents.length === 0}
			<div class="py-16 text-center">
				<div class="mb-4 text-6xl">📭</div>
				<h3 class="mb-2 text-xl font-bold">لا توجد وثائق بعد</h3>
				<p class="text-muted-foreground">سيتم إضافة فروض واختبارات قريباً لهذه المادة</p>
			</div>
		{/if}
	</div>
</section>
