<script lang="ts">
	import { Printer, Download, X, Share2, FileText, FileEdit, CheckCircle } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: any } = $props();

	let activeTab = $state<'exam' | 'solution'>('exam'); // 'exam' or 'solution'

	let doc = $derived(data.document);
	let subject = $derived(data.subject);
	let year = $derived(data.year);
	let level = $derived(data.level);
	let relatedDocs = $derived(data.relatedDocs || []);

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل'
	};

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

	function closeDoc() {
		const subjectPath = `/${level.slug}/${year.slug}/${subject.slug}`;
		if (window.history.length > 2) {
			window.history.back();
		} else {
			goto(subjectPath);
		}
	}

	async function shareDoc() {
		const url = window.location.href;
		const title = doc.titleAr || doc.title;
		if (navigator.share) {
			try {
				await navigator.share({ title, url });
			} catch (e) {}
		} else {
			await navigator.clipboard.writeText(url);
			// Could add a toast here
		}
	}
</script>

<svelte:head>
	<title>{doc.titleAr || doc.title} - SujetStore</title>
	<meta property="og:title" content="{doc.titleAr || doc.title} - SujetStore" />
	<meta
		property="og:description"
		content="{doc.titleAr || doc.title} | {subject.name_ar} - {year.name_ar}"
	/>
	<meta property="og:type" content="article" />
</svelte:head>

<!-- Fullscreen Modal-like Viewer (covers entire page layout including navbar) -->
<div class="bg-background/95 fixed inset-0 z-50 flex flex-col backdrop-blur-sm sm:p-4 md:p-8">
	<div
		class="mx-auto flex w-full max-w-5xl items-center justify-between border border-white/10 bg-black/10 px-4 py-3 shadow-sm sm:rounded-t-xl dark:bg-white/5"
	>
		<div class="text-foreground/90 flex items-center gap-3 truncate">
			<h2
				class="inline-block max-w-[150px] truncate align-middle text-sm font-bold sm:max-w-md sm:text-lg"
			>
				{doc.title_ar || doc.title}
			</h2>
			<span
				class="badge-{doc.type} mx-2 inline-block rounded-full border px-2 py-0.5 align-middle text-xs"
			>
				{activeTab === 'exam' ? 'الموضوع' : 'التصحيح'}
			</span>
		</div>

		<div class="flex items-center gap-2">
			{#if activeTab === 'exam' && doc.pdfUrl}
				<button
					onclick={(e) => {
						e.preventDefault();
						printDoc(doc.pdfUrl);
					}}
					class="border-primary/30 bg-primary/10 text-primary hover:bg-primary/30 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
					title="طباعة الموضوع"
				>
					<Printer size={18} />
				</button>
				<a
					href={doc.pdfUrl}
					download
					target="_blank"
					class="from-primary to-primary/80 text-primary-foreground hover:shadow-primary/25 flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r px-4 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5"
					title="تحميل الموضوع"
				>
					<Download size={16} /> <span class="hidden sm:inline">تحميل الموضوع</span>
				</a>
			{/if}
			{#if activeTab === 'solution' && doc.solutionUrl}
				<button
					onclick={(e) => {
						e.preventDefault();
						printDoc(doc.solutionUrl);
					}}
					class="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/30 dark:text-emerald-400"
					title="طباعة التصحيح"
				>
					<Printer size={18} />
				</button>
				<a
					href={doc.solutionUrl}
					download
					target="_blank"
					class="flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
					title="تحميل التصحيح"
				>
					<Download size={16} /> <span class="hidden sm:inline">تحميل التصحيح</span>
				</a>
			{/if}

			<button
				onclick={shareDoc}
				class="border-primary/30 bg-primary/10 text-primary hover:bg-primary/30 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
				title="مشاركة"
			>
				<Share2 size={18} />
			</button>

			<button
				onclick={closeDoc}
				class="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 bg-destructive/10 flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
				title="إغلاق"
			>
				<X size={20} />
			</button>
		</div>
	</div>

	<div
		class="relative mx-auto w-full max-w-5xl flex-1 overflow-hidden border-x border-b border-white/10 bg-white shadow-2xl sm:rounded-b-xl"
	>
		{#if activeTab === 'exam' && doc.pdfUrl}
			<iframe
				src={doc.pdfUrl + '#toolbar=0&view=FitH'}
				title="قارئ الوثيقة"
				class="absolute inset-0 h-full w-full border-0"
			></iframe>
		{:else if activeTab === 'solution' && doc.solutionUrl}
			<iframe
				src={doc.solutionUrl + '#toolbar=0&view=FitH'}
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
	{#if doc.hasSolution && doc.solutionUrl}
		<div class="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
			<div
				class="flex items-center gap-1 rounded-full border border-white/10 bg-black/80 p-1.5 shadow-2xl backdrop-blur-xl"
			>
				<button
					onclick={() => {
						activeTab = 'exam';
					}}
					class="relative flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 {activeTab ===
					'exam'
						? 'text-primary-foreground shadow-lg'
						: 'text-white/60 hover:text-white'}"
				>
					{#if activeTab === 'exam'}
						<div class="bg-primary absolute inset-0 rounded-full"></div>
					{/if}
					<span class="relative z-10">الموضوع</span>
				</button>
				<button
					onclick={() => {
						activeTab = 'solution';
					}}
					class="relative flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 {activeTab ===
					'solution'
						? 'text-white shadow-lg shadow-emerald-500/20'
						: 'text-white/60 hover:text-white'}"
				>
					{#if activeTab === 'solution'}
						<div class="absolute inset-0 rounded-full bg-emerald-500"></div>
					{/if}
					<span class="relative z-10">التصحيح</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Related Documents -->
{#if relatedDocs.length > 0}
	<section class="py-8">
		<div class="mx-auto max-w-5xl px-4">
			<h3 class="mb-4 text-lg font-bold">وثائق ذات صلة</h3>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each relatedDocs as rdoc}
					<a
						href="/{level.slug}/{year.slug}/{subject.slug}/{rdoc.slug}"
						class="bg-card flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-white/5"
					>
						<div
							class="text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5"
						>
							{#if rdoc.type === 'exam'}
								<FileText size={18} />
							{:else if rdoc.type === 'test'}
								<FileEdit size={18} />
							{:else}
								<FileText size={18} />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-bold">{rdoc.titleAr || rdoc.title}</p>
							<span class="badge-{rdoc.type} rounded border px-1.5 py-0.5 text-[10px]">
								{typeLabels[rdoc.type] || rdoc.type}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}
