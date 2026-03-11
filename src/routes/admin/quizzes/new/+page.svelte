<script lang="ts">
	import { goto } from '$app/navigation';
	import { Save, AlertCircle } from 'lucide-svelte';
	let { data }: { data: any } = $props();

	let title = $state('');
	let titleAr = $state('');
	let description = $state('');
	let difficulty = $state('medium');
	let timeLimit = $state(0);
	let passingScore = $state(60);
	let isPremium = $state(false);
	let isPublished = $state(false);

	let yearSubjectId = $state(data.yearSubjects?.[0]?.id || 0);
	let trimesterId = $state<string | undefined>(undefined);

	// Form options
	let yearSubjects = $state<any[]>(data.yearSubjects || []);
	let trimesters = $state<any[]>(data.trimesters || []);
	let saving = $state(false);
	let error = $state('');

	async function save() {
		if (!title || !titleAr || !yearSubjectId) {
			error = 'الرجاء ملء جميع الحقول المطلوبة (العنوان، العنوان العربي، المادة)';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch('/api/admin/quizzes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					titleAr,
					description,
					difficulty,
					timeLimit,
					passingScore,
					isPremium,
					isPublished,
					yearSubjectId,
					trimesterId
				})
			});

			if (res.ok) {
				const data = await res.json();
				goto(`/admin/quizzes/${data.quiz.id}/builder`);
			} else {
				const data = await res.json();
				error = data.error || 'حدث خطأ أثناء الحفظ';
			}
		} catch (e: any) {
			error = e.message;
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="flex items-center justify-between border-b border-white/10 pb-4">
		<h1 class="text-2xl font-bold">إضافة تمرين تفاعلي جديد</h1>
	</div>

	{#if error}
		<div class="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-400">
			<AlertCircle size={20} />
			{error}
		</div>
	{/if}

	<div class="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
		<!-- Titles -->
		<div class="grid gap-6 sm:grid-cols-2">
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">العنوان (عربي) *</label>
				<input
					type="text"
					bind:value={titleAr}
					placeholder="مثال: تمرين في الرياضيات الفصل الأول"
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				/>
			</div>
			<div class="space-y-2 text-left">
				<label class="text-sm font-semibold text-white/70">* Title (FR/EN)</label>
				<input
					type="text"
					bind:value={title}
					dir="ltr"
					placeholder="Ex: Math Quiz Trimester 1"
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-left text-sm outline-none focus:border-purple-500"
				/>
			</div>
		</div>

		<!-- Linkage -->
		<div class="grid gap-6 sm:grid-cols-2">
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">المادة / القسم *</label>
				<select
					bind:value={yearSubjectId}
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				>
					{#each yearSubjects as ys}
						<option value={ys.id}>
							{ys.streamAr ? `${ys.yearAr} - ${ys.streamAr} - ${ys.subjectAr}` : `${ys.yearAr} - ${ys.subjectAr}`}
						</option>
					{/each}
				</select>
			</div>
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">الفصل (اختياري)</label>
				<select
					bind:value={trimesterId}
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				>
					<option value={undefined}>عام (بدون فصل)</option>
					{#each trimesters as t}
						<option value={t.id}>{t.name_ar}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Description -->
		<div class="space-y-2 text-right">
			<label class="text-sm font-semibold text-white/70">الوصف</label>
			<textarea
				bind:value={description}
				rows="3"
				placeholder="وصف محتوى التمرين..."
				class="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
			></textarea>
		</div>

		<!-- Settings Grid -->
		<div class="grid gap-6 sm:grid-cols-3">
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">مستوى الصعوبة</label>
				<select
					bind:value={difficulty}
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				>
					<option value="easy">سهل</option>
					<option value="medium">متوسط</option>
					<option value="hard">صعب</option>
				</select>
			</div>
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">الوقت المخصص (بالثواني)</label>
				<input
					type="number"
					bind:value={timeLimit}
					min="0"
					placeholder="0 = مفتوح"
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				/>
				<p class="text-xs text-white/40">استخدم 0 لوقت غير محدود</p>
			</div>
			<div class="space-y-2 text-right">
				<label class="text-sm font-semibold text-white/70">نسبة النجاح (%)</label>
				<input
					type="number"
					bind:value={passingScore}
					min="0"
					max="100"
					class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-right text-sm outline-none focus:border-purple-500"
				/>
			</div>
		</div>

		<!-- Toggles -->
		<div class="flex items-center gap-6 rounded-xl border border-white/10 bg-black/20 p-4">
			<label class="flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					bind:checked={isPremium}
					class="h-5 w-5 rounded border-white/20 accent-amber-500"
				/>
				<span class="font-semibold text-white/80">محتوى مدفوع (Premium)</span>
			</label>
			<label class="flex cursor-pointer items-center gap-3">
				<input
					type="checkbox"
					bind:checked={isPublished}
					class="h-5 w-5 rounded border-white/20 accent-emerald-500"
				/>
				<span class="font-semibold text-white/80">مباشر (Published)</span>
			</label>
		</div>

		<div class="flex justify-end pt-4">
			<button
				onclick={save}
				disabled={saving}
				class="flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-purple-700 disabled:opacity-50"
			>
				{#if saving}
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
					جاري الحفظ...
				{:else}
					<Save size={18} /> حفظ واختيار الأسئلة
				{/if}
			</button>
		</div>
	</div>
</div>
