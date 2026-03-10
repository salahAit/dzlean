<script lang="ts">
	import { GripVertical } from 'lucide-svelte';

	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let items = $state<string[]>([...(data.items || [])]);

	let dragIndex = $state<number | null>(null);

	function dragStart(i: number) {
		dragIndex = i;
	}

	function dragOver(e: DragEvent, i: number) {
		e.preventDefault();
		if (dragIndex === null || dragIndex === i) return;
		const newItems = [...items];
		const [moved] = newItems.splice(dragIndex, 1);
		newItems.splice(i, 0, moved);
		items = newItems;
		dragIndex = i;
	}

	function dragEnd() {
		dragIndex = null;
		onAnswer({ order: items });
	}
</script>

<div class="space-y-2">
	<p class="text-muted-foreground mb-4 text-sm">اسحب العناصر لترتيبها بالشكل الصحيح</p>
	{#each items as item, i}
		<div
			draggable="true"
			ondragstart={() => dragStart(i)}
			ondragover={(e) => dragOver(e, i)}
			ondragend={dragEnd}
			role="listitem"
			class="flex cursor-grab items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 active:cursor-grabbing {dragIndex ===
			i
				? 'scale-[1.02] border-blue-500 bg-blue-500/10 shadow-lg'
				: 'border-white/10 bg-white/5 hover:border-white/20'}"
		>
			<GripVertical size={20} class="text-muted-foreground shrink-0" />
			<span
				class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400"
			>
				{i + 1}
			</span>
			<span class="font-medium">{item}</span>
		</div>
	{/each}
</div>
