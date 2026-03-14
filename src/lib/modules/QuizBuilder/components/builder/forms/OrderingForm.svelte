<script lang="ts">
	import { Plus, Trash2, GripVertical } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	if (!data.items) data.items = [];

	function addItem() {
		data.items = [...data.items, { id: crypto.randomUUID(), text: '' }];
	}

	function removeItem(idx: number) {
		data.items = data.items.filter((_: any, i: number) => i !== idx);
	}

	// Simple drag-and-drop for reordering within the form itself
	let draggedIndex = $state<number | null>(null);

	function dragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function dragOver(event: DragEvent) {
		event.preventDefault();
	}

	function drop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) return;

		const item = data.items[draggedIndex];
		const newItems = [...data.items];
		newItems.splice(draggedIndex, 1);
		newItems.splice(dropIndex, 0, item);

		data.items = newItems;
		draggedIndex = null;
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">
		أضف العناصر بالترتيب الصحيح. سيتم عرضها مشوشة للطالب أثناء الامتحان.
	</p>

	<div class="space-y-2">
		{#each data.items as item, i}
			<div
				draggable="true"
				ondragstart={(e) => dragStart(e, i)}
				ondragover={dragOver}
				ondrop={(e) => drop(e, i)}
				class="flex items-center gap-2 rounded-xl border border-white/5 bg-card text-card-foreground shadow-sm p-2 transition-colors hover:border-border {draggedIndex ===
				i
					? 'border-dashed opacity-50'
					: ''}"
			>
				<button class="cursor-grab p-2 text-foreground/30 hover:text-white/60 active:cursor-grabbing">
					<GripVertical size={16} />
				</button>

				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-500/10 text-sm font-bold text-blue-400"
				>
					{i + 1}
				</div>

				<input
					type="text"
					bind:value={item.text}
					placeholder={`عنصر ${i + 1}`}
					class="flex-1 bg-transparent px-2 text-sm outline-none"
				/>

				<button
					onclick={() => removeItem(i)}
					class="rounded-lg p-2 text-foreground/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
				>
					<Trash2 size={16} />
				</button>
			</div>
		{/each}
	</div>

	<button
		onclick={addItem}
		class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10"
	>
		<Plus size={16} /> إضافة عنصر جديد
	</button>
</div>
