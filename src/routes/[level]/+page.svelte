<script lang="ts">
	import { BookOpen, FileText } from 'lucide-svelte';
	import DynamicIcon from '$lib/components/DynamicIcon.svelte';
	let { data }: { data: any } = $props();

	const levelColors: Record<string, string> = {
		primaire: 'emerald',
		moyen: 'blue',
		secondaire: 'purple'
	};

	let color = $derived(levelColors[data.level.slug] || 'blue');
</script>

<svelte:head>
	<title>{data.level.name_ar} - SujetStore</title>
	<meta name="description" content="فروض واختبارات {data.level.name_ar} - جميع السنوات والمواد" />
</svelte:head>

<!-- Breadcrumb -->
<div class="border-b border-white/10 bg-white/[0.02]">
	<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
		<nav class="text-muted-foreground flex items-center gap-2 text-sm">
			<a href="/" class="hover:text-foreground transition-colors">الرئيسية</a>
			<span class="opacity-50">/</span>
			<span class="text-foreground font-semibold">{data.level.name_ar}</span>
		</nav>
	</div>
</div>

<!-- Level Header -->
<section class="hero-gradient py-12 lg:py-16">
	<div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
		<div class="text-primary mb-4 flex justify-center">
			<DynamicIcon name={data.level.icon} size={64} />
		</div>
		<h1 class="mb-3 text-3xl font-extrabold lg:text-5xl">{data.level.name_ar}</h1>
		<p class="text-muted-foreground text-lg">{data.level.name_fr}</p>
		{#if data.level.description}
			<p class="text-muted-foreground mx-auto mt-3 max-w-xl">{data.level.description}</p>
		{/if}
	</div>
</section>

<!-- Years Grid -->
<section class="py-12 lg:py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<h2 class="mb-8 text-center text-2xl font-bold">اختر السنة الدراسية</h2>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.years as year, i}
				<a
					href="/{data.level.slug}/{year.slug}"
					class="group glass-card level-card-{data.level
						.slug} block rounded-2xl border p-6 transition-all duration-500 hover:scale-[1.02]"
				>
					<div class="flex items-start gap-4">
						<!-- Year Number -->
						<div
							class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl font-extrabold {color ===
							'emerald'
								? 'text-emerald-400'
								: color === 'blue'
									? 'text-blue-400'
									: 'text-purple-400'}"
						>
							{i + 1}
						</div>

						<div class="min-w-0 flex-1">
							<h3 class="mb-1 text-lg font-bold group-hover:text-{color}-400 transition-colors">
								{year.name_ar}
							</h3>
							<p class="text-muted-foreground mb-3 text-sm">{year.name_fr}</p>

							<div class="text-muted-foreground flex items-center gap-4 text-xs">
								<span class="flex items-center gap-1">
									<BookOpen size={14} />
									{year.subjectCount} مادة
								</span>
								<span class="flex items-center gap-1">
									<FileText size={14} />
									{year.docCount} وثيقة
								</span>
							</div>
						</div>

						<!-- Arrow -->
						<svg
							class="text-muted-foreground group-hover:text-foreground mt-2 h-5 w-5 flex-shrink-0 rotate-180 transition-all group-hover:-translate-x-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>
