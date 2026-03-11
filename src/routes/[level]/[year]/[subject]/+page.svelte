<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Printer,
		Download,
		FileText,
		CheckCircle,
		Calendar,
		GraduationCap,
		FileEdit,
		BookOpen,
		Bookmark,
		PenTool,
		Inbox,
		Filter,
		SlidersHorizontal,
		X,
		Gamepad2,
		Star,
		PlusCircle,
		FilePlus2
	} from 'lucide-svelte';
	import DynamicIcon from '$lib/components/DynamicIcon.svelte';
	import { toggleBookmark, isBookmarked } from '$lib/stores/bookmarks.svelte';

	let { data }: { data: any } = $props();

	// Modal State
	let selectedDoc = $state<any>(null);
	let activeTab = $state<'exam' | 'solution'>('exam');
	let isFullscreen = $state(false);

	let activeTrimesterTab = $state<string>('t1');

	// Admin Editing Mode
	let isEditingMode = $state(false);

	// Auto-select the first tab with docs on initial load (only for subject mode)
	$effect(() => {
		if (data?.mode === 'subject' && activeTrimesterTab === 't1') {
			const firstTrimester = data.trimesters?.[0];
			if (firstTrimester) {
				activeTrimesterTab = firstTrimester.id;
			}
		}
	});

	// Filter state
	let filterType = $state('all');
	let filterSource = $state('all');
	let filterYear = $state('all');
	let filterHasSolution = $state(false);

	// Combine documents and quizzes into a single activities array (only for subject mode)
	let allActivities = $derived(
		data.mode === 'subject'
			? [
					...data.documents.map((d: any) => ({ ...d, _itemType: 'document' })),
					...data.quizzes.map((q: any) => ({ ...q, _itemType: 'quiz', type: 'interactive_quiz' }))
				]
			: []
	);

	// Reactive filtered documents
	let filteredDocs = $derived.by(() => {
		// Include docs for the active trimester + null-trimester docs (lessons/summaries)
		let docs = allActivities.filter(
			(d: any) =>
				d.trimester_id === activeTrimesterTab ||
				d.trimester_id === null ||
				d.trimesterId === activeTrimesterTab ||
				d.trimesterId === null
		);

		if (filterType !== 'all') {
			if (filterType === 'lesson_summary') {
				docs = docs.filter((d: any) => d.type === 'lesson' || d.type === 'summary');
			} else {
				docs = docs.filter((d: any) => d.type === filterType);
			}
		}

		if (filterSource !== 'all') {
			docs = docs.filter((d: any) => d.source === filterSource);
		}

		if (filterYear !== 'all') {
			docs = docs.filter((d: any) => d.academic_year === filterYear);
		}

		if (filterHasSolution) {
			docs = docs.filter((d: any) => d.has_solution);
		}

		return docs;
	});

	$effect(() => {
		if (data) {
			const hasCurrentTabDocs = getDocsByTrimester(activeTrimesterTab).length > 0;

			if (!hasCurrentTabDocs) {
				const firstTrimWithDocs = data.trimesters.find(
					(t: any) => getDocsByTrimester(t.id).length > 0
				);
				if (firstTrimWithDocs) {
					activeTrimesterTab = firstTrimWithDocs.id;
				}
			}
		}
	});

	// Track visited docs
	let visitedDocs = $state<Set<string>>(new Set());

	onMount(() => {
		const stored = localStorage.getItem('visited_docs');
		if (stored) {
			try {
				visitedDocs = new Set(JSON.parse(stored));
			} catch (e) {}
		}
	});

	function openDoc(doc: any, tab: 'exam' | 'solution') {
		selectedDoc = doc;
		activeTab = tab;
		isFullscreen = true;

		const docKey = `${doc.id}-${tab}`;
		const newVisited = new Set(visitedDocs);
		if (!newVisited.has(docKey)) {
			newVisited.add(docKey);
			visitedDocs = newVisited;
			localStorage.setItem('visited_docs', JSON.stringify([...newVisited]));
		}
	}

	function closeDoc() {
		selectedDoc = null;
		isFullscreen = false;
	}

	function printDoc(url: string) {
		const iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		iframe.src = url;
		document.body.appendChild(iframe);

		iframe.onload = () => {
			setTimeout(() => {
				iframe.contentWindow?.print();
			}, 500);
		};
	}

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل',
		interactive_quiz: 'تمرين تفاعلي'
	};

	// Group documents by trimester (includes null-trimester docs like lessons/summaries)
	function getDocsByTrimester(trimId: string | null) {
		return allActivities.filter(
			(d: any) =>
				d.trimester_id === trimId ||
				d.trimester_id === null ||
				d.trimesterId === trimId ||
				d.trimesterId === null
		);
	}
</script>

<svelte:head>
	{#if data.mode === 'stream'}
		<title>{data.stream.name_ar} - {data.year.name_ar} - SujetStore</title>
		<meta
			name="description"
			content="فروض واختبارات شعبة {data.stream.name_ar} - {data.year.name_ar}"
		/>
	{:else}
		<title>{data.subject.name_ar} - {data.year.name_ar} - SujetStore</title>
		<meta
			name="description"
			content="فروض واختبارات {data.subject.name_ar} - {data.year.name_ar}"
		/>
		<meta property="og:title" content="{data.subject.name_ar} - {data.year.name_ar} - SujetStore" />
		<meta
			property="og:description"
			content="فروض واختبارات {data.subject.name_ar} - {data.year
				.name_ar} | بنك الفروض والاختبارات الجزائرية"
		/>
		<meta property="og:type" content="website" />
	{/if}
</svelte:head>

<!-- Breadcrumb and Admin Tools -->
<div class="border-b border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
	<div
		class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
	>
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
			<span class="text-foreground font-semibold">
				{data.mode === 'stream' ? data.stream.name_ar : data.subject.name_ar}
			</span>
		</nav>

		{#if data.user && data.user.role === 'admin' && data.mode === 'subject'}
			<div
				class="flex items-center gap-3 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 shadow-inner"
			>
				<span class="text-sm font-bold text-indigo-400">وضع التحرير (للمدير)</span>
				<button
					type="button"
					role="switch"
					aria-label="تفعيل وضع التحرير"
					aria-checked={isEditingMode}
					onclick={() => (isEditingMode = !isEditingMode)}
					class="focus:ring-ring focus:ring-offset-background relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none {isEditingMode
						? 'bg-indigo-500'
						: 'bg-white/10'}"
				>
					<span
						class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 {isEditingMode
							? '-translate-x-5'
							: 'translate-x-0.5'}"
					></span>
				</button>
			</div>
		{/if}
	</div>
</div>

{#if data.mode === 'stream'}
	<!-- Stream Header -->
	<section class="hero-gradient relative overflow-hidden py-10 lg:py-14">
		<div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
			<div class="text-muted-foreground mb-3 inline-flex items-center gap-2 text-sm">
				<span class="flex items-center"><GraduationCap size={16} /></span>
				<span>{data.year.name_ar}</span>
			</div>
			<h1 class="mb-2 text-3xl font-extrabold lg:text-4xl">{data.stream.name_ar}</h1>
			<p class="text-muted-foreground">{data.stream.name_fr}</p>
		</div>
	</section>

	<!-- Stream Subjects Grid -->
	<section class="py-12 lg:py-16">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<h2 class="mb-8 text-center text-2xl font-bold">المواد الدراسية</h2>

			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.subjects as subject}
					<a
						href="/{data.level.slug}/{data.year.slug}/{subject.slug}"
						class="glass-card group block border-black/5 dark:border-white/10"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
								style="background: {subject.color}20; border: 1px solid {subject.color}40; color: {subject.color}"
							>
								<DynamicIcon name={subject.icon} size={28} />
							</div>

							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between gap-2">
									<h3 class="group-hover:text-primary truncate text-lg font-bold transition-colors">
										{subject.name_ar}
									</h3>
									<div
										class="flex items-center gap-1.5 rounded-lg bg-black/5 px-2 py-1 dark:bg-white/5"
									>
										<span class="text-sm font-bold" style="color: {subject.color}"
											>{subject.docCount}</span
										>
										<span class="text-muted-foreground text-[10px]">وثيقة</span>
									</div>
								</div>
								<p class="text-muted-foreground text-sm">{subject.name_fr}</p>
							</div>
						</div>

						{#if subject.coefficient}
							<div class="text-muted-foreground mt-3 text-xs">
								المعامل: <span class="text-foreground font-bold">{subject.coefficient}</span>
							</div>
						{/if}
					</a>
				{/each}
			</div>

			{#if data.subjects.length === 0}
				<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
					<Inbox size={48} class="mb-4 opacity-50" />
					<p class="text-xl">لا توجد مواد مسجلة لهذه الشعبة</p>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<!-- Subject Header -->
	<section class="hero-gradient relative overflow-hidden py-10 lg:py-14">
		{#if isEditingMode}
			<div
				class="pointer-events-none absolute inset-0 m-4 animate-pulse rounded-xl border-4 border-dashed border-indigo-500/30"
			></div>
		{/if}
		<div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-center gap-5">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
					style="background: {data.subject.color}20; border: 1px solid {data.subject.color}40"
				>
					<DynamicIcon name={data.subject.icon} size={32} />
				</div>
				<div class="text-center sm:text-right">
					<h1 class="text-3xl font-extrabold lg:text-4xl">{data.subject.name_ar}</h1>
					<p class="text-muted-foreground">{data.year.name_ar}</p>
				</div>
			</div>

			<!-- Quick stats -->
			<div class="mt-6 flex justify-center gap-6">
				<div class="text-center">
					<div class="text-xl font-bold">{data.documents.length}</div>
					<div class="text-muted-foreground text-xs">وثيقة</div>
				</div>
				<div class="text-center">
					<div class="text-xl font-bold text-emerald-400">{data.quizzes.length}</div>
					<div class="text-muted-foreground text-xs">تمرين تفاعلي</div>
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
	<section class="py-10 lg:py-14 {isEditingMode ? 'bg-indigo-950/20' : ''}">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			{#if allActivities.length === 0 && !isEditingMode}
				<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
					<Inbox size={48} class="mb-4 opacity-50" />
					<h3 class="mb-2 text-xl font-bold">لا توجد وثائق بعد</h3>
					<p>سيتم إضافة فروض واختبارات قريباً لهذه المادة</p>
				</div>
			{:else}
				<!-- Tabs Navigation -->
				<div class="mb-6 flex w-full justify-center overflow-x-auto">
					<div
						class="bg-muted text-muted-foreground inline-flex h-12 items-center justify-center rounded-lg p-1"
					>
						{#each data.trimesters as trimester}
							<button
								onclick={() => (activeTrimesterTab = trimester.id)}
								class="ring-offset-background focus-visible:ring-ring inline-flex min-w-24 items-center justify-center rounded-md px-6 py-2 text-sm font-bold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 {activeTrimesterTab ===
								trimester.id
									? 'bg-background text-foreground shadow-sm'
									: 'hover:text-foreground'}"
							>
								الفصل {trimester.id.replace('t', '')}
							</button>
						{/each}
					</div>
				</div>

				<!-- Filter Bar -->
				<div
					class="bg-card text-card-foreground mb-6 ml-0 flex flex-col gap-3 rounded-xl border border-black/5 p-4 shadow-sm sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 dark:border-white/10"
				>
					<div class="text-muted-foreground mb-1 flex items-center gap-2 sm:mb-0">
						<SlidersHorizontal size={18} class="opacity-70" />
						<span class="text-sm font-semibold">فلترة:</span>
					</div>

					<!-- Type Filter -->
					<select
						bind:value={filterType}
						class="bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
					>
						<option value="all">النوع: الكل</option>
						<option value="test">فرض</option>
						<option value="exam">اختبار</option>
						<option value="lesson_summary">درس / ملخص</option>
					</select>

					<!-- Source Filter -->
					<select
						bind:value={filterSource}
						class="bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
					>
						<option value="all">المصدر: الكل</option>
						<option value="رسمي">رسمي</option>
						<option value="مقترح">مقترح</option>
					</select>

					<!-- Year Filter -->
					<select
						bind:value={filterYear}
						class="bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring w-full rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
					>
						<option value="all">السنة: الكل</option>
						<option value="2024">2024</option>
						<option value="2023">2023</option>
						<option value="2022">2022</option>
					</select>

					<!-- Has Solution Toggle -->
					<label
						class="mt-2 flex w-full cursor-pointer items-center justify-between gap-2 border-t pt-3 sm:mt-0 sm:mr-auto sm:w-auto sm:border-0 sm:pt-0"
					>
						<span class="text-muted-foreground text-sm font-medium">مع التصحيح فقط</span>
						<button
							type="button"
							role="switch"
							aria-checked={filterHasSolution}
							aria-label="فلترة الوثائق مع التصحيح"
							onclick={() => (filterHasSolution = !filterHasSolution)}
							class="focus:ring-ring focus:ring-offset-background relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none {filterHasSolution
								? 'bg-emerald-500'
								: 'bg-slate-300 dark:bg-white/10'}"
						>
							<span
								class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 {filterHasSolution
									? '-translate-x-4'
									: 'translate-x-1'}"
							></span>
						</button>
					</label>
				</div>

				<!-- Active Tab Content -->
				<div class="flex flex-col gap-3">
					{#each filteredDocs as doc}
						{@render docRow(doc, data.subject.color)}
					{:else}
						<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
							<Filter size={48} class="mb-4 opacity-40" />
							<h3 class="mb-2 text-lg font-bold">لا توجد نتائج</h3>
							<p class="text-sm">لا توجد وثائق مطابقة للفلاتر المحددة في هذا الفصل</p>
						</div>
					{/each}

					{#if isEditingMode}
						<div
							class="mt-8 flex flex-col justify-center gap-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-6 shadow-sm sm:flex-row"
						>
							<!-- Add Interactive Quiz -->
							<a
								href={`/admin/quizzes/new?ysId=${data.yearSubject.id}&tId=${activeTrimesterTab === 'null' ? '' : activeTrimesterTab}`}
								class="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 font-bold text-emerald-400 shadow-sm transition-all hover:bg-emerald-500/20 hover:shadow-md sm:flex-none"
							>
								<PlusCircle size={20} class="transition-transform group-hover:rotate-90" /> أضف تمريناً
								تفاعلياً
							</a>
							<!-- Add Document -->
							<a
								href={`/admin/documents?add=true&ysId=${data.yearSubject.id}&tId=${activeTrimesterTab === 'null' ? '' : activeTrimesterTab}`}
								class="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-6 py-3 font-bold text-blue-400 shadow-sm transition-all hover:bg-blue-500/20 hover:shadow-md sm:flex-none"
							>
								<FilePlus2 size={20} class="transition-transform group-hover:rotate-90" /> أضف وثيقة أو
								موضوع
							</a>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</section>

	{#snippet docRow(doc: any, accentColor: string)}
		<div
			class="glass-card group flex flex-col justify-between gap-4 border-r-4 border-black/5 p-4 transition-all duration-300 hover:bg-black/5 sm:flex-row sm:items-center dark:border-white/10 dark:hover:bg-white/5"
			style="border-right-color: {doc._itemType === 'quiz' ? '#10b981' : accentColor}"
		>
			<div class="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
				<div
					class="text-primary/70 group-hover:bg-primary/10 group-hover:text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/5 transition-colors dark:bg-white/5"
				>
					{#if doc._itemType === 'quiz'}
						<Gamepad2 size={24} class="text-emerald-400" />
					{:else if doc.type === 'exam'}
						<FileText size={24} />
					{:else if doc.type === 'test'}
						<FileEdit size={24} />
					{:else if doc.type === 'lesson'}
						<BookOpen size={24} />
					{:else if doc.type === 'summary'}
						<Bookmark size={24} />
					{:else if doc.type === 'exercise'}
						<PenTool size={24} />
					{:else if doc.type === 'solution'}
						<CheckCircle size={24} />
					{:else}
						<FileText size={24} />
					{/if}
				</div>
				<div class="min-w-0 flex-1">
					<div class="mb-1.5 flex flex-wrap items-center gap-2">
						<h3 class="truncate text-base font-bold sm:text-lg">
							{doc.title_ar || doc.title}
						</h3>
						<span
							class="badge-{doc.type} shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:text-xs {doc._itemType ===
							'quiz'
								? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
								: ''}"
						>
							{typeLabels[doc.type] || doc.type}
						</span>
					</div>

					<div class="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
						{#if doc.source}
							<span class="flex items-center gap-1.5"
								><GraduationCap size={14} class="opacity-70" /> {doc.source}</span
							>
						{/if}
						{#if doc.academic_year}
							<span class="flex items-center gap-1.5"
								><Calendar size={14} class="opacity-70" /> {doc.academic_year}</span
							>
						{/if}
						{#if isEditingMode && doc.isPublished === false}
							<span
								class="flex items-center gap-1.5 rounded bg-orange-500/10 px-2 py-0.5 font-bold text-orange-400"
							>
								مخفي عن الطلاب
							</span>
						{/if}
						{#if doc.isPremium}
							<span
								class="flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400"
							>
								<Star size={12} class="fill-current" /> للمشتركين فقط
							</span>
						{/if}
					</div>
				</div>
			</div>

			<div
				class="mx-auto flex w-full shrink-0 items-center justify-center gap-1.5 border-t border-white/5 pt-3 sm:ms-4 sm:w-auto sm:border-t-0 sm:pt-0"
			>
				<button
					onclick={() => toggleBookmark(doc.id)}
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all {isBookmarked(
						doc.id
					)
						? 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
						: 'text-muted-foreground border-white/10 bg-white/5 hover:bg-white/10 hover:text-amber-400'}"
					title={isBookmarked(doc.id) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
				>
					<Bookmark size={16} class={isBookmarked(doc.id) ? 'fill-current' : ''} />
				</button>

				{#if doc._itemType === 'quiz'}
					<a
						href={`/quizzes/${doc.slug}`}
						class="relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-lg bg-emerald-600 py-2 text-[11px] font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
					>
						<Gamepad2 size={14} class="sm:h-4 sm:w-4" /> ابدأ التمرين
					</a>

					{#if isEditingMode}
						<a
							href={`/admin/quizzes/${doc.id}/builder`}
							class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors hover:bg-indigo-500/20"
							title="تعديل في المدير"
						>
							<FileEdit size={16} />
						</a>
					{/if}
				{:else}
					<button
						onclick={(e) => {
							e.preventDefault();
							openDoc(doc, 'exam');
						}}
						class="relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-lg bg-blue-600 py-2 text-[11px] font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
					>
						<FileText size={14} class="sm:h-4 sm:w-4" /> الموضوع
					</button>

					{#if doc.has_solution}
						<button
							onclick={(e) => {
								e.preventDefault();
								openDoc(doc, 'solution');
							}}
							class="relative flex flex-1 items-center justify-center gap-1 overflow-hidden rounded-lg bg-emerald-500 py-2 text-[11px] font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 sm:flex-none sm:px-4 sm:py-2 sm:text-sm"
						>
							<CheckCircle size={14} class="sm:h-4 sm:w-4" /> الحل
						</button>
					{/if}

					{#if isEditingMode}
						<a
							href={`/admin/documents`}
							class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors hover:bg-indigo-500/20"
							title="إدارة في المدير"
						>
							<FileEdit size={16} />
						</a>
					{/if}
				{/if}
			</div>
		</div>
	{/snippet}

	<!-- Fullscreen Modal Viewer -->
	{#if isFullscreen && selectedDoc}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="bg-background/95 fixed inset-0 z-50 flex flex-col backdrop-blur-sm sm:p-4 md:p-8"
			onclick={(e) => {
				if (e.target === e.currentTarget) closeDoc();
			}}
		>
			<div
				class="mx-auto flex w-full max-w-5xl items-center justify-between border border-white/10 bg-black/10 px-4 py-3 shadow-sm sm:rounded-t-xl dark:bg-white/5"
			>
				<div class="text-foreground/90 flex items-center gap-3 truncate">
					<h2
						class="inline-block max-w-[150px] truncate align-middle text-sm font-bold sm:max-w-md sm:text-lg"
					>
						{selectedDoc.title_ar || selectedDoc.title}
					</h2>
					<span
						class="badge-{selectedDoc.type} mx-2 inline-block rounded-full border px-2 py-0.5 align-middle text-xs"
					>
						{activeTab === 'exam' ? 'الموضوع' : 'التصحيح'}
					</span>
				</div>

				<div class="flex items-center gap-2">
					{#if activeTab === 'exam' && selectedDoc.pdf_url}
						<button
							onclick={(e) => {
								e.preventDefault();
								printDoc(selectedDoc.pdf_url);
							}}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-500 transition-all hover:bg-blue-500 hover:text-white"
							title="طباعة الموضوع"
						>
							<Printer size={22} />
						</button>
						<a
							href={selectedDoc.pdf_url}
							download
							target="_blank"
							class="flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg"
							title="تحميل الموضوع"
							><Download size={16} /> <span class="hidden sm:mr-1 sm:inline">تحميل</span></a
						>
					{/if}
					{#if activeTab === 'solution' && selectedDoc.solution_url}
						<button
							onclick={(e) => {
								e.preventDefault();
								printDoc(selectedDoc.solution_url);
							}}
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
							title="طباعة التصحيح"
						>
							<Printer size={22} />
						</button>
						<a
							href={selectedDoc.solution_url}
							download
							target="_blank"
							class="flex h-9 items-center justify-center rounded-lg bg-emerald-500 px-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-lg"
							title="تحميل التصحيح"
							><Download size={16} /> <span class="hidden sm:mr-1 sm:inline">تحميل</span></a
						>
					{/if}

					<button
						onclick={closeDoc}
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-600 hover:shadow-lg"
						title="إغلاق"
					>
						<X size={20} />
					</button>
				</div>
			</div>

			<div
				class="relative mx-auto w-full max-w-5xl flex-1 overflow-hidden border-x border-b border-white/10 bg-white shadow-2xl sm:rounded-b-xl"
			>
				{#if activeTab === 'exam' && selectedDoc.pdf_url}
					<iframe
						src={selectedDoc.pdf_url + '#toolbar=0&view=FitH'}
						title="قارئ الوثيقة"
						class="absolute inset-0 h-full w-full border-0"
					></iframe>
				{:else if activeTab === 'solution' && selectedDoc.solution_url}
					<iframe
						src={selectedDoc.solution_url + '#toolbar=0&view=FitH'}
						title="قارئ الوثيقة"
						class="absolute inset-0 h-full w-full border-0"
					></iframe>
				{:else}
					<div class="flex h-full w-full items-center justify-center text-black/50">
						لا يوجد ملف لعرضه بصيغة PDF
					</div>
				{/if}
			</div>

			<!-- Mobile/Desktop Toggle inside Fullscreen -->
			{#if selectedDoc.has_solution && selectedDoc.solution_url}
				<div
					class="absolute bottom-6 left-1/2 z-60 flex -translate-x-1/2 items-center rounded-full border border-white/10 bg-black/80 p-1.5 shadow-2xl backdrop-blur-md"
				>
					<button
						onclick={() => openDoc(selectedDoc, 'exam')}
						class="rounded-full px-4 py-2 text-sm font-bold transition-all {activeTab === 'exam'
							? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
							: 'text-white/70 hover:bg-white/10 hover:text-white'}"
					>
						الموضوع
					</button>
					<button
						onclick={() => openDoc(selectedDoc, 'solution')}
						class="rounded-full px-4 py-2 text-sm font-bold transition-all {activeTab === 'solution'
							? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
							: 'text-white/70 hover:bg-white/10 hover:text-white'}"
					>
						التصحيح
					</button>
				</div>
			{/if}
		</div>
	{/if}
{/if}
