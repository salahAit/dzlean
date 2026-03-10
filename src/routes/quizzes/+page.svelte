<script lang="ts">
	import { Brain, Clock, Star, Lock, Sparkles } from 'lucide-svelte';
	import DynamicIcon from '$lib/components/DynamicIcon.svelte';

	let { data }: { data: any } = $props();

	const difficultyLabels: Record<string, { label: string; color: string }> = {
		easy: { label: 'سهل', color: 'text-emerald-400' },
		medium: { label: 'متوسط', color: 'text-amber-400' },
		hard: { label: 'صعب', color: 'text-red-400' }
	};
</script>

<svelte:head>
	<title>التمارين التفاعلية - SujetStore</title>
	<meta
		name="description"
		content="تمارين تفاعلية متنوعة: اختيار متعدد، صحيح/خطأ، ترتيب، سحب وإفلات، ربط، ملء فراغات والمزيد!"
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
	<div class="mb-10 text-center">
		<h1 class="flex items-center justify-center gap-3 text-3xl font-extrabold sm:text-4xl">
			<Brain size={36} class="text-purple-500" /> التمارين التفاعلية
		</h1>
		<p class="text-muted-foreground mt-3 text-lg">اختبر معلوماتك مع تمارين تفاعلية متنوعة ومسلية</p>
	</div>

	{#if data.quizzes.length === 0}
		<div class="py-20 text-center">
			<Sparkles size={48} class="mx-auto mb-4 text-purple-500 opacity-50" />
			<p class="text-muted-foreground text-lg">لا توجد تمارين متاحة حالياً</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.quizzes as row}
				{@const quiz = row.quiz}
				{@const diff = difficultyLabels[quiz.difficulty || 'medium']}
				<a
					href={quiz.isPremium ? '#' : `/quizzes/${quiz.slug}`}
					class="bg-card group relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg {quiz.isPremium
						? 'opacity-80'
						: ''}"
				>
					{#if quiz.isPremium}
						<div
							class="absolute top-0 left-0 flex items-center gap-1 rounded-br-xl bg-amber-500 px-3 py-1 text-xs font-bold text-black"
						>
							<Lock size={12} /> مدفوع
						</div>
					{/if}

					<div class="mb-4 flex items-center gap-3">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400"
						>
							<DynamicIcon name={row.subject.icon || 'BookOpen'} size={24} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">{row.subject.name_ar}</p>
							<p class="text-muted-foreground text-xs">{row.year.name_ar}</p>
						</div>
					</div>

					<h3 class="mb-2 text-lg font-bold transition-colors group-hover:text-purple-400">
						{quiz.titleAr || quiz.title}
					</h3>

					{#if quiz.description}
						<p class="text-muted-foreground mb-4 line-clamp-2 text-sm">{quiz.description}</p>
					{/if}

					<div class="text-muted-foreground flex items-center gap-4 text-xs">
						<span class="flex items-center gap-1">
							<Brain size={14} />
							{quiz.questionCount} سؤال
						</span>
						<span class="flex items-center gap-1 {diff.color}">
							<Star size={14} />
							{diff.label}
						</span>
						{#if quiz.timeLimit && quiz.timeLimit > 0}
							<span class="flex items-center gap-1">
								<Clock size={14} />
								{Math.floor(quiz.timeLimit / 60)} دقيقة
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
