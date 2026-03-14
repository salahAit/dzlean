<script lang="ts">
	import MathRenderer from '../../shared/MathRenderer.svelte';

	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let selected = $state<number | null>(null);

	// Normalize options: handle both legacy strings and new { text, imageUrl } objects
	let options = $derived(
		(data.options || []).map((opt: any) => (typeof opt === 'string' ? { text: opt } : opt))
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
			class="flex w-full items-start gap-3 rounded-xl border-2 p-4 text-right transition-all duration-200 {selected ===
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
			<div class="flex-1 space-y-2 mt-1">
				{#if option.imageUrl}
					<img src={option.imageUrl} alt="خيار {i + 1}" class="max-h-48 max-w-full rounded-lg object-contain" />
				{/if}
				{#if option.text}
					<div class="font-medium">
						<MathRenderer content={option.text} />
					</div>
				{/if}
			</div>
		</button>
	{/each}
</div>
