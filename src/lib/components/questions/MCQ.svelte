<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let selected = $state<number | null>(null);
	let options: string[] = $derived(data.options || []);

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
				: 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}"
		>
			<span
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold {selected ===
				i
					? 'bg-blue-500 text-white'
					: 'text-muted-foreground bg-white/10'}"
			>
				{String.fromCharCode(1571 + i)}
			</span>
			<span class="flex-1 font-medium">{option}</span>
		</button>
	{/each}
</div>
