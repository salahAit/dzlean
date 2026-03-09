<script lang="ts">
	import { Inbox } from 'lucide-svelte';
	import DynamicIcon from '$lib/components/DynamicIcon.svelte';
	let { data }: { data: any } = $props();
</script>

<svelte:head>
	<title>{data.year.name_ar} - {data.level.name_ar} - SujetStore</title>
	<meta name="description" content="المواد الدراسية - {data.year.name_ar} - فروض واختبارات" />
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
			<span class="text-foreground font-semibold">{data.year.name_ar}</span>
		</nav>
	</div>
</div>

<!-- Year Header -->
<section class="hero-gradient py-10 lg:py-14">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
		<div class="text-muted-foreground mb-3 inline-flex items-center gap-2 text-sm">
			<span class="flex items-center"><DynamicIcon name={data.level.icon} size={16} /></span>
			<span>{data.level.name_ar}</span>
		</div>
		<h1 class="mb-2 text-3xl font-extrabold lg:text-4xl">{data.year.name_ar}</h1>
		<p class="text-muted-foreground">{data.year.name_fr}</p>
	</div>
</section>

<!-- Subjects Grid -->
<section class="py-12 lg:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="mb-8 text-center text-2xl font-bold">المواد الدراسية</h2>

		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.subjects as subject}
				<a
					href="/{data.level.slug}/{data.year.slug}/{subject.slug}"
					class="subject-card group block"
				>
					<div class="flex items-center gap-4">
						<!-- Subject Icon -->
						<div
							class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
							style="background: {subject.color}20; border: 1px solid {subject.color}40; color: {subject.color}"
						>
							<DynamicIcon name={subject.icon} size={28} />
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="group-hover:text-primary truncate text-lg font-bold transition-colors">
								{subject.name_ar}
							</h3>
							<p class="text-muted-foreground text-sm">{subject.name_fr}</p>
						</div>

						<!-- Doc count -->
						<div class="flex-shrink-0 text-center">
							<div class="text-lg font-bold" style="color: {subject.color}">{subject.docCount}</div>
							<div class="text-muted-foreground text-xs">وثيقة</div>
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
				<p class="text-xl">لا توجد مواد بعد لهذه السنة</p>
			</div>
		{/if}
	</div>
</section>
