<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let selected = $state<boolean | null>(null);

	function select(value: boolean) {
		selected = value;
		onAnswer({ value });
	}
</script>

<div class="flex gap-4">
	<button
		onclick={() => select(true)}
		class="flex flex-1 items-center justify-center gap-3 rounded-xl border-2 p-6 text-lg font-bold transition-all duration-200 {selected ===
		true
			? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-md shadow-emerald-500/10 dark:text-emerald-400'
			: 'border-border bg-secondary hover:border-emerald-500/30 hover:bg-emerald-500/5 dark:border-white/10 dark:bg-white/5'}"
	>
		✓ صحيح
	</button>
	<button
		onclick={() => select(false)}
		class="flex flex-1 items-center justify-center gap-3 rounded-xl border-2 p-6 text-lg font-bold transition-all duration-200 {selected ===
		false
			? 'border-red-500 bg-red-500/10 text-red-700 shadow-md shadow-red-500/10 dark:text-red-400'
			: 'border-border bg-secondary hover:border-red-500/30 hover:bg-red-500/5 dark:border-white/10 dark:bg-white/5'}"
	>
		✗ خطأ
	</button>
</div>
