<script lang="ts">
	let { data }: { data: any } = $props();
</script>

<svelte:head>
	<title>DzLearn - بنك الفروض والاختبارات الجزائرية</title>
	<meta
		name="description"
		content="منصة تعليمية جزائرية شاملة - فروض، اختبارات، دروس وملخصات لجميع المراحل التعليمية"
	/>
</svelte:head>

<!-- Hero Section -->
<section class="hero-gradient relative overflow-hidden py-20 lg:py-32">
	<!-- Floating decorations -->
	<div class="float-animation absolute top-20 right-10 text-6xl opacity-10">📐</div>
	<div
		class="float-animation absolute bottom-20 left-10 text-5xl opacity-10"
		style="animation-delay: 2s"
	>
		🔬
	</div>
	<div
		class="float-animation absolute top-40 left-1/4 text-4xl opacity-10"
		style="animation-delay: 4s"
	>
		📖
	</div>

	<div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
		<div
			class="text-muted-foreground mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm"
		>
			<span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
			المنهج الدراسي الجزائري - محدّث
		</div>

		<h1 class="mb-6 text-4xl leading-tight font-extrabold sm:text-5xl lg:text-7xl">
			<span class="gradient-text">بنك الفروض</span>
			<br />
			<span class="text-foreground">والاختبارات</span>
		</h1>

		<p class="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed sm:text-xl">
			دروس، ملخصات، فروض واختبارات لجميع المراحل التعليمية
			<br class="hidden sm:block" />
			وفق المنهاج الدراسي الوطني الجزائري
		</p>

		<!-- Quick access buttons -->
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="/primaire"
				class="group inline-flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-6 py-3 font-bold text-emerald-400 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/30"
			>
				<span class="text-2xl">🎒</span>
				ابتدائي
			</a>
			<a
				href="/moyen"
				class="group inline-flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/20 px-6 py-3 font-bold text-blue-400 transition-all duration-300 hover:scale-105 hover:bg-blue-500/30"
			>
				<span class="text-2xl">📚</span>
				متوسط
			</a>
			<a
				href="/secondaire"
				class="group inline-flex items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/20 px-6 py-3 font-bold text-purple-400 transition-all duration-300 hover:scale-105 hover:bg-purple-500/30"
			>
				<span class="text-2xl">🎓</span>
				ثانوي
			</a>
		</div>
	</div>
</section>

<!-- Stats Section -->
<section class="border-y border-white/10 bg-white/[0.02] py-8">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
			<div>
				<div class="gradient-text text-3xl font-extrabold">{data.stats?.totalDocs || 0}</div>
				<div class="text-muted-foreground mt-1 text-sm">وثيقة تعليمية</div>
			</div>
			<div>
				<div class="text-3xl font-extrabold text-red-400">{data.stats?.examCount || 0}</div>
				<div class="text-muted-foreground mt-1 text-sm">اختبار</div>
			</div>
			<div>
				<div class="text-3xl font-extrabold text-orange-400">{data.stats?.testCount || 0}</div>
				<div class="text-muted-foreground mt-1 text-sm">فرض</div>
			</div>
			<div>
				<div class="text-3xl font-extrabold text-emerald-400">{data.stats?.subjectCount || 0}</div>
				<div class="text-muted-foreground mt-1 text-sm">مادة دراسية</div>
			</div>
		</div>
	</div>
</section>

<!-- Education Levels Section -->
<section class="py-16 lg:py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold lg:text-4xl">المراحل التعليمية</h2>
			<p class="text-muted-foreground text-lg">اختر المرحلة التعليمية للوصول إلى المحتوى</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each data.levels as level}
				<a
					href="/{level.slug}"
					class="group glass-card level-card-{level.slug} block rounded-2xl border p-8 transition-all duration-500 hover:scale-[1.02]"
				>
					<div class="text-center">
						<!-- Icon -->
						<div class="mb-6 text-6xl transition-transform duration-300 group-hover:scale-110">
							{level.icon}
						</div>

						<!-- Title -->
						<h3 class="mb-3 text-2xl font-bold">{level.name_ar}</h3>
						<p class="text-muted-foreground mb-6 text-sm">{level.name_fr}</p>

						<!-- Stats -->
						<div class="flex justify-center gap-6 text-sm">
							<div class="text-center">
								<div class="text-lg font-bold">{level.yearCount}</div>
								<div class="text-muted-foreground">سنوات</div>
							</div>
							<div class="w-px bg-white/10"></div>
							<div class="text-center">
								<div class="text-lg font-bold">{level.docCount}</div>
								<div class="text-muted-foreground">وثيقة</div>
							</div>
						</div>

						<!-- Arrow -->
						<div class="text-muted-foreground group-hover:text-foreground mt-6 transition-colors">
							<svg
								class="mx-auto h-6 w-6 rotate-180 transition-transform group-hover:-translate-x-2"
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
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="border-t border-white/10 bg-white/[0.01] py-16">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold lg:text-4xl">لماذا DzLearn؟</h2>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<div class="glass-card p-6 text-center">
				<div class="mb-4 text-4xl">🇩🇿</div>
				<h3 class="mb-2 text-lg font-bold">منهج جزائري</h3>
				<p class="text-muted-foreground text-sm">
					محتوى متوافق 100% مع المنهاج الدراسي الوطني الجزائري
				</p>
			</div>
			<div class="glass-card p-6 text-center">
				<div class="mb-4 text-4xl">📋</div>
				<h3 class="mb-2 text-lg font-bold">فروض واختبارات</h3>
				<p class="text-muted-foreground text-sm">
					نماذج فروض واختبارات مع الحلول النموذجية لجميع الفصول
				</p>
			</div>
			<div class="glass-card p-6 text-center">
				<div class="mb-4 text-4xl">📖</div>
				<h3 class="mb-2 text-lg font-bold">دروس وملخصات</h3>
				<p class="text-muted-foreground text-sm">دروس مفصلة وملخصات شاملة لتسهيل المراجعة</p>
			</div>
		</div>
	</div>
</section>
