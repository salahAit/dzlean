<script lang="ts">
	import { X } from 'lucide-svelte';
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let categories: string[] = $derived(data.categories || []);
	let items: { text: string; category: number }[] = $derived(data.items || []);

	let assignments = $state<Record<string, number | null>>({});
	let dragItem = $state<string | null>(null);
	let selectedItem = $state<string | null>(null);

	// Initialize
	$effect(() => {
		const init: Record<string, number | null> = {};
		items.forEach((item) => (init[item.text] = null));
		assignments = init;
	});

	function startDrag(text: string) {
		dragItem = text;
	}

	function selectItem(text: string) {
		selectedItem = selectedItem === text ? null : text;
	}

	function drop(categoryIndex: number) {
		const itemText = dragItem || selectedItem;
		if (itemText) {
			assignments = { ...assignments, [itemText]: categoryIndex };
			dragItem = null;
			selectedItem = null;
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
			<button
				type="button"
				draggable="true"
				ondragstart={() => startDrag(item.text)}
				onclick={() => selectItem(item.text)}
				class="border-border bg-secondary cursor-grab rounded-lg border-2 border-dashed px-4 py-2 font-semibold transition-all hover:border-blue-500/50 hover:bg-blue-500/5 active:cursor-grabbing dark:border-white/20 dark:bg-white/5 {selectedItem === item.text ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-500/10 dark:bg-blue-500/20' : ''}"
			>
				{item.text}
			</button>
		{/each}
		{#if unassigned.length === 0}
			<p class="text-muted-foreground text-sm italic">✓ تم توزيع جميع العناصر</p>
		{/if}
	</div>

	<!-- Category Drop Zones -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-{categories.length}">
		{#each categories as cat, ci}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				tabindex="0"
				role="region"
				ondragover={allowDrop}
				ondrop={() => drop(ci)}
				onclick={() => drop(ci)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') drop(ci); }}
				class="border-border/50 bg-secondary/30 min-h-[120px] rounded-2xl border-2 border-dashed p-4 transition-colors dark:border-white/15 dark:bg-white/2 {selectedItem ? 'hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer' : ''}"
			>
				<h4 class="mb-3 text-center text-sm font-bold text-blue-400">{cat}</h4>
				<div class="flex flex-wrap gap-2">
					{#each items.filter((item) => assignments[item.text] === ci) as assigned}
						<span
							class="group flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-destructive/10 dark:hover:bg-destructive/20"
						>
							{assigned.text}
							<button
								type="button"
								class="text-primary/50 transition-colors hover:text-destructive group-hover:text-destructive"
								onclick={() => {
									assignments = { ...assignments, [assigned.text]: null };
									onAnswer({ assignments: { ...assignments } });
								}}
								title="تراجع (إزالة)"
							>
								<X size={14} strokeWidth={3} />
							</button>
						</span>
					{/each}
					{#if items.filter((item) => assignments[item.text] === ci).length === 0}
						<div
							class="flex h-10 w-full items-center justify-center rounded-lg border-2 border-dashed border-border/40 bg-background/20 text-xs text-muted-foreground/60 transition-colors"
						>
							اسحب عنصراً هنا...
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
