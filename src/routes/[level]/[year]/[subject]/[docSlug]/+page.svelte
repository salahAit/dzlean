<script lang="ts">
	import { Printer, Download, X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data }: { data: any } = $props();

	let activeTab = $state<'exam' | 'solution'>('exam'); // 'exam' or 'solution'

	let doc = $derived(data.document);
	let subject = $derived(data.subject);
	let year = $derived(data.year);
	let level = $derived(data.level);

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
		// Try to go back, if there's no history or we landed directly here, go to subject page
		const subjectPath = `/${level.slug}/${year.slug}/${subject.slug}`;
		if (window.history.length > 2) {
			window.history.back();
		} else {
			goto(subjectPath);
		}
	}
</script>

<svelte:head>
	<title>{doc.titleAr || doc.title} - DzLearn</title>
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
					class="text-primary hover:bg-primary hover:text-primary-foreground bg-primary/20 flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors"
					title="تحميل الموضوع"
				>
					<Download size={16} /> <span class="hidden sm:mr-1 sm:inline">تحميل</span>
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
					class="flex h-9 items-center justify-center rounded-lg bg-emerald-500/20 px-3 text-sm font-semibold text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
					title="تحميل التصحيح"
				>
					<Download size={16} /> <span class="hidden sm:mr-1 sm:inline">تحميل</span>
				</a>
			{/if}

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
		<div
			class="absolute bottom-6 left-1/2 z-60 flex -translate-x-1/2 items-center rounded-full border border-white/10 bg-black/80 p-1.5 shadow-2xl backdrop-blur-md"
		>
			<button
				onclick={() => {
					activeTab = 'exam';
				}}
				class="rounded-full px-4 py-2 text-sm font-bold transition-all {activeTab === 'exam'
					? 'bg-primary text-primary-foreground shadow-sm'
					: 'text-white/70 hover:bg-white/10 hover:text-white'}"
			>
				الموضوع
			</button>
			<button
				onclick={() => {
					activeTab = 'solution';
				}}
				class="rounded-full px-4 py-2 text-sm font-bold transition-all {activeTab === 'solution'
					? 'bg-emerald-500 text-white shadow-sm'
					: 'text-white/70 hover:bg-white/10 hover:text-white'}"
			>
				التصحيح
			</button>
		</div>
	{/if}
</div>
