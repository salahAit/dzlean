<script lang="ts">
	import { onMount } from 'svelte';
	import { Trophy, Star, Zap, Target, Crown, Medal, TrendingUp, BookOpen, Flame, LayoutGrid, Award, CheckCircle, XCircle } from 'lucide-svelte';

	const icons: Record<string, any> = {
		Trophy, Star, Zap, Target, Crown, Medal, TrendingUp, BookOpen, Flame, LayoutGrid, Award
	};

	let data = $state<any>(null);
	let loading = $state(true);
	let activeTab = $state<'badges' | 'leaderboard' | 'history'>('badges');

	onMount(async () => {
		try {
			const res = await fetch('/api/gamification');
			data = await res.json();
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	let earnedCount = $derived(data ? data.badges.filter((b: any) => b.earned).length : 0);
	let totalBadges = $derived(data ? data.badges.length : 0);
</script>

<svelte:head>
	<title>الإنجازات والشارات - SujetStore</title>
	<meta name="description" content="تتبع إنجازاتك واجمع الشارات والنقاط" />
</svelte:head>

<section class="py-10 lg:py-14">
	<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8 text-center">
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10"
			>
				<Trophy size={32} class="text-amber-500" />
			</div>
			<h1 class="text-3xl font-extrabold">الإنجازات والشارات</h1>
			<p class="text-muted-foreground mt-2">اجمع الشارات واحصد النقاط مع كل تمرين تنجزه</p>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-16">
				<div class="text-muted-foreground animate-pulse">جاري التحميل...</div>
			</div>
		{:else if data}
			<!-- Summary Cards -->
			<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div
					class="bg-card rounded-xl border border-black/5 p-4 text-center shadow-sm dark:border-white/10"
				>
					<div class="text-3xl font-extrabold text-amber-500">{data.totalPoints}</div>
					<div class="text-muted-foreground text-xs font-semibold">النقاط</div>
				</div>
				<div
					class="bg-card rounded-xl border border-black/5 p-4 text-center shadow-sm dark:border-white/10"
				>
					<div class="text-3xl font-extrabold text-blue-500">{data.quizCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">تمرين مكتمل</div>
				</div>
				<div
					class="bg-card rounded-xl border border-black/5 p-4 text-center shadow-sm dark:border-white/10"
				>
					<div class="text-3xl font-extrabold text-emerald-500">{earnedCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">شارة مكتسبة</div>
				</div>
				<div
					class="bg-card rounded-xl border border-black/5 p-4 text-center shadow-sm dark:border-white/10"
				>
					<div class="text-3xl font-extrabold text-purple-500">{totalBadges - earnedCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">شارة متبقية</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="mb-6 flex gap-2 overflow-x-auto">
				<button
					onclick={() => (activeTab = 'badges')}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab ===
					'badges'
						? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
						: 'text-muted-foreground border border-black/5 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}"
				>
					<Medal size={16} /> الشارات
				</button>
				<button
					onclick={() => (activeTab = 'leaderboard')}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab ===
					'leaderboard'
						? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
						: 'text-muted-foreground border border-black/5 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}"
				>
					<Crown size={16} /> لوحة الصدارة
				</button>
				<button
					onclick={() => (activeTab = 'history')}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab ===
					'history'
						? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
						: 'text-muted-foreground border border-black/5 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}"
				>
					<TrendingUp size={16} /> السجل
				</button>
			</div>

			<!-- Badges Grid -->
			{#if activeTab === 'badges'}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{#each data.badges as badge}
						<div
							class="bg-card group relative overflow-hidden rounded-2xl border border-black/5 p-5 text-center shadow-sm transition-all hover:-translate-y-1 dark:border-white/10 {badge.earned
								? 'border-amber-500/30 bg-gradient-to-b from-white to-amber-50/30 shadow-xl shadow-amber-500/5 dark:from-white/5 dark:to-amber-500/5'
								: 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}"
						>
							<!-- Background Glow -->
							{#if badge.earned}
								<div 
									class="absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
									style="background-color: {badge.color}"
								></div>
							{/if}

							{#if badge.earned}
								<div class="absolute top-3 right-3">
									<Star size={14} class="text-amber-500 animate-pulse" fill="currentColor" />
								</div>
							{/if}

							<div class="mb-4 flex justify-center">
								{#if icons[badge.icon]}
									{@const Icon = icons[badge.icon]}
									<div 
										class="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
										style="background-color: {badge.earned ? `${badge.color}15` : 'rgba(0,0,0,0.05)'}"
									>
										<Icon 
											size={30} 
											style="color: {badge.earned ? badge.color : 'currentColor'}" 
											class={badge.earned ? 'drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]' : ''}
										/>
									</div>
								{:else}
									<div class="text-4xl">{badge.icon}</div>
								{/if}
							</div>
							
							<h3 class="text-sm font-bold leading-tight">{badge.name_ar}</h3>
							<p class="text-muted-foreground mt-1.5 text-[10px] leading-relaxed line-clamp-2">{badge.description}</p>
							
							<div 
								class="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
								style="color: {badge.color}; background-color: {badge.color}15"
							>
								<Zap size={10} fill="currentColor" />
								+{badge.points} نقطة
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Leaderboard -->
			{#if activeTab === 'leaderboard'}
				<div
					class="bg-card overflow-hidden rounded-xl border border-black/5 shadow-sm dark:border-white/10"
				>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b">
								<th class="text-muted-foreground p-3 text-right font-bold">#</th>
								<th class="text-muted-foreground p-3 text-right font-bold">اللاعب</th>
								<th class="text-muted-foreground p-3 text-center font-bold">التمارين</th>
								<th class="text-muted-foreground p-3 text-center font-bold">النقاط</th>
							</tr>
						</thead>
						<tbody>
							{#each data.leaderboard as player, i}
								<tr class="hover:bg-muted/50 border-b transition-colors">
									<td class="p-3">
										{#if i === 0}
											<Trophy size={18} class="mx-auto text-amber-500" />
										{:else if i === 1}
											<Medal size={18} class="mx-auto text-gray-400" />
										{:else if i === 2}
											<Medal size={18} class="mx-auto text-amber-700" />
										{:else}
											<span class="text-muted-foreground font-bold">{i + 1}</span>
										{/if}
									</td>
									<td class="p-3 font-semibold">
										{player.fingerprint?.substring(0, 8)}...
									</td>
									<td class="text-muted-foreground p-3 text-center">{player.quizzes}</td>
									<td class="p-3 text-center font-bold text-amber-500">{player.total_points}</td>
								</tr>
							{/each}
							{#if data.leaderboard.length === 0}
								<tr
									><td colspan="4" class="text-muted-foreground p-8 text-center opacity-70"
										>لا توجد بيانات بعد</td
									></tr
								>
							{/if}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- History -->
			{#if activeTab === 'history'}
				<div class="flex flex-col gap-2">
					{#each data.history as entry}
						<div
							class="bg-card flex items-center justify-between rounded-lg border border-black/5 p-3 shadow-sm dark:border-white/10"
						>
							<div>
								<span class="flex items-center gap-2 text-sm font-bold">
									{#if entry.reason === 'quiz_complete'}
										<CheckCircle size={14} class="text-emerald-500" /> إكمال تمرين
									{:else if entry.reason === 'perfect_score'}
										<Star size={14} class="text-amber-500" /> نتيجة مثالية
									{:else if entry.reason === 'badge_earned'}
										<Trophy size={14} class="text-amber-500" /> شارة جديدة
									{:else}
										{entry.reason}
									{/if}
								</span>
								<span class="text-muted-foreground mr-2 text-xs">
									{new Date(entry.earned_at).toLocaleDateString('ar-DZ')}
								</span>
							</div>
							<span class="text-sm font-bold text-emerald-500">+{entry.points}</span>
						</div>
					{:else}
						<div class="text-muted-foreground py-8 text-center text-sm">
							لا توجد نقاط مكتسبة بعد
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</section>
