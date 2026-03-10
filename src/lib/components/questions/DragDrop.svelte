<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let categories: string[] = $derived(data.categories || []);
	let items: { text: string; category: number }[] = $derived(data.items || []);

	let assignments = $state<Record<string, number | null>>({});
	let dragItem = $state<string | null>(null);

	// Initialize
	$effect(() => {
		const init: Record<string, number | null> = {};
		items.forEach((item) => (init[item.text] = null));
		assignments = init;
	});

	function startDrag(text: string) {
		dragItem = text;
	}

	function drop(categoryIndex: number) {
		if (dragItem) {
			assignments = { ...assignments, [dragItem]: categoryIndex };
			dragItem = null;
			onAnswer({ assignments: { ...assignments } });
		}
	}

	function allowDrop(e: DragEvent) {
		e.preventDefault();
	}

	let unassigned = $derived(
		items.filter((item) => assignments[item.text] === null || assignments[item.text] === undefined)
	);
</script>

<div class="space-y-6">
	<p class="text-muted-foreground text-sm">اسحب العناصر إلى الفئة المناسبة</p>

	<!-- Unassigned items -->
	<div class="flex flex-wrap gap-2">
		{#each unassigned as item}
			<div
				draggable="true"
				ondragstart={() => startDrag(item.text)}
				class="cursor-grab rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-2 font-semibold transition-all hover:border-blue-500/50 hover:bg-blue-500/5 active:cursor-grabbing"
			>
				{item.text}
			</div>
		{/each}
		{#if unassigned.length === 0}
			<p class="text-muted-foreground text-sm italic">✓ تم توزيع جميع العناصر</p>
		{/if}
	</div>

	<!-- Category Drop Zones -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-{categories.length}">
		{#each categories as cat, ci}
			<div
				ondragover={allowDrop}
				ondrop={() => drop(ci)}
				role="region"
				class="min-h-[120px] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-4 transition-colors"
			>
				<h4 class="mb-3 text-center text-sm font-bold text-blue-400">{cat}</h4>
				<div class="flex flex-wrap gap-2">
					{#each items.filter((item) => assignments[item.text] === ci) as assigned}
						<span class="rounded-lg bg-blue-500/15 px-3 py-1.5 text-sm font-semibold text-blue-300">
							{assigned.text}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
