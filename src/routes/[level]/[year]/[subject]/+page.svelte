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
		X
	} from 'lucide-svelte';
	import DynamicIcon from '$lib/components/DynamicIcon.svelte';

	let { data }: { data: any } = $props();

	// Modal State
	let selectedDoc = $state<any>(null);
	let activeTab = $state<'exam' | 'solution'>('exam');
	let isFullscreen = $state(false);

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
		solution: 'حل'
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
	<title>{data.subject.name_ar} - {data.year.name_ar} - SujetStore</title>
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
				<DynamicIcon name={data.subject.icon} size={32} class="text-foreground" />
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

{#if data.documents.length === 0}
<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
<Inbox size={48} class="mb-4 opacity-50" />
<h3 class="mb-2 text-xl font-bold">لا توجد وثائق بعد</h3>
<p>سيتم إضافة فروض واختبارات قريباً لهذه المادة</p>
</div>
{:else}
<!-- Tabs Navigation -->
<div class="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
{#each data.trimesters as trimester}
{@const docsCount = getDocsByTrimester(trimester.id).length}
{#if docsCount > 0}
<button
onclick={() => activeTrimesterTab = trimester.id}
class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all {activeTrimesterTab === trimester.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}"
>
{trimester.name_ar}
<span class="flex h-5 items-center justify-center rounded-full bg-black/20 px-2 text-[10px]">{docsCount}</span>
</button>
{/if}
{/each}


{#if getGeneralDocs().length > 0}
<button
onclick={() => activeTrimesterTab = 'general'}
class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all {activeTrimesterTab === 'general' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}"
>
دروس وملخصات
<span class="flex h-5 items-center justify-center rounded-full bg-black/20 px-2 text-[10px]">{getGeneralDocs().length}</span>
</button>
{/if}
</div>

<!-- Active Tab Content -->
<div class="flex flex-col gap-3">
{#if activeTrimesterTab === 'general'}
{#each getGeneralDocs() as doc}
{@render docRow(doc, '#10b981')}
{/each}
{:else}
{#each getDocsByTrimester(activeTrimesterTab) as doc}
{@render docRow(doc, data.subject.color)}
{/each}
{/if}
</div>
{/if}

</div>
</section>

{#snippet docRow(doc: any, accentColor: string)}
<div class="glass-card group flex flex-col justify-between gap-4 border-r-4 p-4 transition-all duration-300 hover:bg-white/5 sm:flex-row sm:items-center" style="border-right-color: {accentColor}">
<div class="flex min-w-0 flex-1 items-center gap-4">
<div class="text-primary/70 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
{#if doc.type === 'exam'}
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
<span class="badge-{doc.type} shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:text-xs">
{typeLabels[doc.type] || doc.type}
</span>
</div>

<div class="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
{#if doc.source}
<span class="flex items-center gap-1.5"><GraduationCap size={14} class="opacity-70" /> {doc.source}</span>
{/if}
{#if doc.academic_year}
<span class="flex items-center gap-1.5"><Calendar size={14} class="opacity-70" /> {doc.academic_year}</span>
{/if}
</div>
</div>
</div>

<div class="mx-auto flex w-full shrink-0 flex-col items-center gap-2 sm:ms-4 sm:w-auto sm:flex-row border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0">
<button
onclick={(e) => {
e.preventDefault();
openDoc(doc, 'exam');
}}
class="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 sm:w-auto sm:py-2"
>
<FileText size={16} /> الموضوع
</button>

{#if doc.has_solution}
<button
onclick={(e) => {
e.preventDefault();
openDoc(doc, 'solution');
}}
class="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 sm:w-auto sm:py-2"
>
<CheckCircle size={16} /> الحل
</button>
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
