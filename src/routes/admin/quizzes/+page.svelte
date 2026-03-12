<script lang="ts">
	import { onMount } from 'svelte';
	import { Brain, Plus, Edit, Trash2, Eye, EyeOff, Lock, CheckCircle, Search, Copy, SaveAll, Hash, FolderTree } from 'lucide-svelte';

	let quizzes = $state<any[]>([]);
	let stats = $state({ totalQuizzes: 0, totalQuestions: 0, totalCategories: 0 });
	let loading = $state(true);
	let searchQuery = $state('');

	onMount(async () => {
		await Promise.all([loadQuizzes(), loadStats()]);
	});

	async function loadQuizzes() {
		loading = true;
		try {
			const res = await fetch('/api/admin/quizzes');
			if (res.ok) quizzes = await res.json();
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		try {
			const res = await fetch('/api/admin/quizzes/stats');
			if (res.ok) stats = await res.json();
		} catch (e) {
			console.error(e);
		}
	}

	async function togglePublish(id: number, currentStatus: boolean) {
		const res = await fetch(`/api/admin/quizzes/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isPublished: !currentStatus })
		});
		if (res.ok) await loadQuizzes();
	}

	async function togglePremium(id: number, currentStatus: boolean) {
		const res = await fetch(`/api/admin/quizzes/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isPremium: !currentStatus })
		});
		if (res.ok) await loadQuizzes();
	}

	async function deleteQuiz(id: number) {
		if (confirm('هل أنت متأكد من حذف هذا التمرين وجميع أسئلته؟')) {
			const res = await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' });
			if (res.ok) await loadQuizzes();
		}
	}

	async function duplicateQuiz(id: number) {
		try {
			const res = await fetch(`/api/admin/quizzes/${id}/duplicate`, { method: 'POST' });
			if (res.ok) {
				await loadQuizzes();
			} else {
				alert('خطأ في نسخ التمرين');
			}
		} catch {
			alert('خطأ في الاتصال');
		}
	}

	let filteredQuizzes = $derived(
		quizzes.filter(
			(q) => (q.title || '').includes(searchQuery) || (q.titleAr || '').includes(searchQuery)
		)
	);
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="flex items-center gap-3 text-2xl font-bold">
			<Brain size={28} class="text-purple-500" /> إدارة التمارين التفاعلية
		</h1>
		<a
			href="/admin/quizzes/new"
			class="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-foreground shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 hover:text-white"
		>
			<Plus size={18} /> تمرين جديد
		</a>
	</div>

	<!-- Stats Dashboard -->
	<div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3 text-purple-500">
				<Brain size={24} />
				<span class="font-bold">إجمالي التمارين</span>
			</div>
			<p class="text-3xl font-black text-foreground">{stats.totalQuizzes}</p>
		</div>
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3 text-emerald-500">
				<Hash size={24} />
				<span class="font-bold">إجمالي الأسئلة</span>
			</div>
			<p class="text-3xl font-black text-foreground">{stats.totalQuestions}</p>
		</div>
		<div class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
			<div class="flex items-center gap-3 text-blue-500">
				<FolderTree size={24} />
				<span class="font-bold">التصنيفات</span>
			</div>
			<p class="text-3xl font-black text-foreground">{stats.totalCategories}</p>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="mb-6 flex gap-4">
		<div class="relative flex-1">
			<Search class="absolute top-1/2 right-4 -translate-y-1/2 text-foreground/40" size={18} />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="ابحث عن تمرين..."
				class="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm py-3 pr-12 pl-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:ring-1 focus:ring-primary"
			/>
		</div>
	</div>

	{#if loading}
		<div class="flex h-32 items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
			></div>
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
			<table class="w-full text-right">
				<thead class="border-b border-border bg-card text-card-foreground shadow-sm text-sm font-medium text-foreground/60">
					<tr>
						<th class="p-4">العنوان</th>
						<th class="p-4">الأسئلة</th>
						<th class="p-4">مدفوع</th>
						<th class="p-4">الحالة</th>
						<th class="p-4 text-left">إجراءات</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each filteredQuizzes as quiz}
						<tr class="transition-colors hover:bg-muted/50">
							<td class="p-4">
								<p class="font-bold">{quiz.titleAr || quiz.title}</p>
								<p class="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
									<span class="rounded bg-muted px-1.5 py-0.5"
										>{quiz.difficulty || 'medium'}</span
									>
									<span class="opacity-50">•</span>
									{quiz.slug}
								</p>
							</td>
							<td class="p-4">
								<span
									class="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400"
								>
									{quiz.questionCount}
								</span>
							</td>
							<td class="p-4">
								<button
									onclick={() => togglePremium(quiz.id, quiz.isPremium)}
									class="inline-flex items-center transition-colors {quiz.isPremium
										? 'text-amber-400 hover:text-amber-500'
										: 'text-white/30 hover:text-muted-foreground'}"
								>
									<Lock size={18} />
								</button>
							</td>
							<td class="p-4">
								<button
									onclick={() => togglePublish(quiz.id, quiz.isPublished)}
									class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors {quiz.isPublished
										? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
										: 'bg-muted text-foreground/60 hover:bg-white/20'}"
								>
									{#if quiz.isPublished}
										<Eye size={12} /> منشور
									{:else}
										<EyeOff size={12} /> مسودة
									{/if}
								</button>
							</td>
							<td class="p-4 text-left">
								<div class="flex items-center justify-end gap-2">
									<a
										href={`/admin/quizzes/${quiz.id}/builder`}
										class="rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20"
										title="بناء الأسئلة"
									>
										<Brain size={18} />
									</a>
									<a
										href={`/admin/quizzes/${quiz.id}/edit`}
										class="rounded-lg bg-card text-card-foreground shadow-sm p-2 transition-colors hover:bg-muted"
										title="تعديل الإعدادات"
									>
										<Edit size={18} />
									</a>
									<button
										onclick={() => duplicateQuiz(quiz.id)}
										class="rounded-lg bg-amber-500/10 p-2 text-amber-400 transition-colors hover:bg-amber-500/20"
										title="نسخ التمرين"
									>
										<Copy size={18} />
									</button>
									<button
										onclick={() => deleteQuiz(quiz.id)}
										class="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</td>
						</tr>
					{/each}
					{#if filteredQuizzes.length === 0}
						<tr>
							<td colspan="5" class="p-8 text-center text-muted-foreground"
								>لا توجد تمارين مضافة حتى الآن</td
							>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>
