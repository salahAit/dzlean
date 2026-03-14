<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let selected = $state<number | null>(null);

	let parts = $derived((data.sentence || '').split('___'));
	let options: string[] = $derived(data.options || []);

	function select(index: number) {
		selected = index;
		onAnswer({ selectedIndex: index });
	}
</script>

<div class="space-y-6">
	<!-- Sentence with gap -->
	<div
		class="border-border bg-secondary/30 rounded-2xl border-2 p-6 dark:border-white/10 dark:bg-white/5"
	>
		<p class="text-lg leading-loose font-semibold" dir="rtl">
			{#each parts as part, i}
				<span>{part}</span>
				{#if i < parts.length - 1}
					<span
						class="mx-1 inline-block min-w-[80px] rounded-lg border-2 border-dashed px-3 py-1 text-center {selected !==
						null
							? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-300'
							: 'text-muted-foreground border-border dark:border-white/20'}"
					>
						{selected !== null ? options[selected] : '...'}
					</span>
				{/if}
			{/each}
		</p>
	</div>

	<!-- Options -->
	<div class="flex flex-wrap justify-center gap-3">
		{#each options as option, i}
			<button
				onclick={() => select(i)}
				class="rounded-xl border-2 px-5 py-2.5 font-semibold transition-all duration-200 {selected ===
				i
					? 'border-blue-500 bg-blue-500/15 text-blue-600 shadow-md dark:text-blue-300'
					: 'border-border bg-secondary hover:border-blue-500/30 hover:bg-blue-500/5 dark:border-white/10 dark:bg-white/5'}"
			>
				{option}
			</button>
		{/each}
	</div>
</div>
