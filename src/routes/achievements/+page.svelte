<script lang="ts">
	import { onMount } from 'svelte';
	import { Trophy, Star, Zap, Target, Crown, Medal, TrendingUp } from 'lucide-svelte';

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
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
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
				<div class="bg-card rounded-xl border p-4 text-center">
					<div class="text-3xl font-extrabold text-amber-500">{data.totalPoints}</div>
					<div class="text-muted-foreground text-xs font-semibold">النقاط</div>
				</div>
				<div class="bg-card rounded-xl border p-4 text-center">
					<div class="text-3xl font-extrabold text-blue-500">{data.quizCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">تمرين مكتمل</div>
				</div>
				<div class="bg-card rounded-xl border p-4 text-center">
					<div class="text-3xl font-extrabold text-emerald-500">{earnedCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">شارة مكتسبة</div>
				</div>
				<div class="bg-card rounded-xl border p-4 text-center">
					<div class="text-3xl font-extrabold text-purple-500">{totalBadges - earnedCount}</div>
					<div class="text-muted-foreground text-xs font-semibold">شارة متبقية</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="mb-6 flex gap-2 overflow-x-auto">
				<button onclick={() => activeTab = 'badges'}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab === 'badges' ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}">
					<Medal size={16} /> الشارات
				</button>
				<button onclick={() => activeTab = 'leaderboard'}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}">
					<Crown size={16} /> لوحة الصدارة
				</button>
				<button onclick={() => activeTab = 'history'}
					class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all {activeTab === 'history' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}">
					<TrendingUp size={16} /> السجل
				</button>
			</div>

			<!-- Badges Grid -->
			{#if activeTab === 'badges'}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{#each data.badges as badge}
						<div class="bg-card relative overflow-hidden rounded-xl border p-4 text-center transition-all {badge.earned ? 'border-amber-500/30 shadow-lg shadow-amber-500/10' : 'opacity-60 grayscale'}">
							{#if badge.earned}
								<div class="absolute top-2 right-2">
									<Star size={14} class="text-amber-500" fill="currentColor" />
								</div>
							{/if}
							<div class="mb-2 text-4xl">{badge.icon}</div>
							<h3 class="text-sm font-bold">{badge.name_ar}</h3>
							<p class="text-muted-foreground mt-1 text-[10px]">{badge.description}</p>
							<div class="mt-2 text-xs font-bold" style="color: {badge.color}">
								+{badge.points} نقطة
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Leaderboard -->
			{#if activeTab === 'leaderboard'}
				<div class="bg-card rounded-xl border overflow-hidden">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-white/10">
								<th class="p-3 text-right font-bold text-white/70">#</th>
								<th class="p-3 text-right font-bold text-white/70">اللاعب</th>
								<th class="p-3 text-center font-bold text-white/70">التمارين</th>
								<th class="p-3 text-center font-bold text-white/70">النقاط</th>
							</tr>
						</thead>
						<tbody>
							{#each data.leaderboard as player, i}
								<tr class="border-b border-white/5 transition-colors hover:bg-white/5">
									<td class="p-3 font-bold {i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-white/50'}">
										{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
									</td>
									<td class="p-3 font-semibold">
										{player.fingerprint?.substring(0, 8)}...
									</td>
									<td class="p-3 text-center text-white/70">{player.quizzes}</td>
									<td class="p-3 text-center font-bold text-amber-500">{player.total_points}</td>
								</tr>
							{/each}
							{#if data.leaderboard.length === 0}
								<tr><td colspan="4" class="p-8 text-center text-white/40">لا توجد بيانات بعد</td></tr>
							{/if}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- History -->
			{#if activeTab === 'history'}
				<div class="flex flex-col gap-2">
					{#each data.history as entry}
						<div class="bg-card flex items-center justify-between rounded-lg border p-3">
							<div>
								<span class="text-sm font-bold">
									{entry.reason === 'quiz_complete' ? '✅ إكمال تمرين' :
									 entry.reason === 'perfect_score' ? '⭐ نتيجة مثالية' :
									 entry.reason === 'badge_earned' ? '🏆 شارة جديدة' : entry.reason}
								</span>
								<span class="text-muted-foreground text-xs mr-2">
									{new Date(entry.earned_at).toLocaleDateString('ar-DZ')}
								</span>
							</div>
							<span class="text-sm font-bold text-emerald-500">+{entry.points}</span>
						</div>
					{:else}
						<div class="text-muted-foreground py-8 text-center text-sm">لا توجد نقاط مكتسبة بعد</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</section>
