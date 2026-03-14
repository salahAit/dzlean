<script lang="ts">
	import { GripVertical } from 'lucide-svelte';

	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let items = $state<string[]>([]);

	$effect(() => {
		items = [...(data.items || [])];
	});

	let dragIndex = $state<number | null>(null);
	let dropIndex = $state<number | null>(null);

	function dragStart(i: number) {
		dragIndex = i;
		dropIndex = i;
	}

	function dragOver(e: DragEvent, i: number) {
		e.preventDefault();
		if (dragIndex === null) return;
		dropIndex = i;
	}

	function dragEnd() {
		if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
			const newItems = [...items];
			const [moved] = newItems.splice(dragIndex, 1);
			newItems.splice(dropIndex, 0, moved);
			items = newItems;
			onAnswer({ order: items });
		}
		dragIndex = null;
		dropIndex = null;
	}
</script>

<div class="space-y-3">
	<p class="text-muted-foreground mb-4 text-sm">اسحب العناصر لترتيبها بالشكل الصحيح</p>
	<div class="flex flex-col gap-2">
		{#each items as item, i}
			{#if dragIndex !== null && dropIndex === i && i < dragIndex}
				<div
					class="h-16 rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 transition-all duration-200"
				></div>
			{/if}

			<div
				draggable="true"
				ondragstart={() => dragStart(i)}
				ondragover={(e) => dragOver(e, i)}
				ondragend={dragEnd}
				role="listitem"
				class="flex cursor-grab items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 active:cursor-grabbing {dragIndex ===
				i
					? 'opacity-40 grayscale-50'
					: 'border-border bg-secondary/50 hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'} {dropIndex ===
					i && dragIndex !== i
					? 'border-blue-500 ring-2 ring-blue-500/20'
					: ''}"
			>
				<GripVertical size={20} class="text-muted-foreground shrink-0" />
				<span
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400"
				>
					{i + 1}
				</span>
				<span class="font-medium">{item}</span>
			</div>

			{#if dragIndex !== null && dropIndex === i && i > dragIndex}
				<div
					class="h-16 rounded-xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 transition-all duration-200"
				></div>
			{/if}
		{/each}
	</div>
</div>
