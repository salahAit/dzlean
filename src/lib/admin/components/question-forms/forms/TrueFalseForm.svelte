<script lang="ts">
	let { data = $bindable() } = $props();

	if (typeof data.correctAnswer !== 'boolean') {
		data.correctAnswer = true;
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">حدد الإجابة الصحيحة لهذه العبارة.</p>

	<div class="flex gap-4">
		<button
			onclick={() => (data.correctAnswer = true)}
			class="flex flex-1 items-center justify-center rounded-xl border p-4 text-center font-bold transition-all {data.correctAnswer ===
			true
				? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
				: 'border-border bg-card text-card-foreground shadow-sm text-muted-foreground hover:bg-muted'}"
		>
			صحيح
		</button>

		<button
			onclick={() => (data.correctAnswer = false)}
			class="flex flex-1 items-center justify-center rounded-xl border p-4 text-center font-bold transition-all {data.correctAnswer ===
			false
				? 'border-red-500 bg-red-500/20 text-red-400'
				: 'border-border bg-card text-card-foreground shadow-sm text-muted-foreground hover:bg-muted'}"
		>
			خطأ
		</button>
	</div>
</div>
