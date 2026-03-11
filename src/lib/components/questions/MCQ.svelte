<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let selected = $state<number | null>(null);

	// Normalize options: handle both {id, text, isCorrect} objects and plain strings
	let options = $derived(
		(data.options || []).map((opt: any) => (typeof opt === 'string' ? opt : opt.text))
	);

	// Build correctIndexes from isCorrect if not provided
	let correctIndexes = $derived(
		data.correctIndexes
			? data.correctIndexes
			: (data.options || [])
					.map((opt: any, i: number) => (typeof opt === 'object' && opt.isCorrect ? i : -1))
					.filter((i: number) => i >= 0)
	);

	function select(index: number) {
		selected = index;
		onAnswer({ selectedIndexes: [index] });
	}
</script>

<div class="space-y-3">
	{#each options as option, i}
		<button
			onclick={() => select(i)}
			class="flex w-full items-center gap-3 rounded-xl border-2 p-4 text-right transition-all duration-200 {selected ===
			i
				? 'border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/10'
				: 'border-border bg-secondary/50 hover:bg-secondary/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}"
		>
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold {selected ===
				i
					? 'bg-blue-500 text-white'
					: 'text-muted-foreground bg-muted'}"
			>
				{['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][i] || i + 1}
			</span>
			<span class="flex-1 font-medium">{option}</span>
		</button>
	{/each}
</div>
