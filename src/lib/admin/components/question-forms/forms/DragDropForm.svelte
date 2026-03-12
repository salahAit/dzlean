<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	if (!data.categories) data.categories = [];
	if (!data.items) data.items = [];

	let newCatName = $state('');
	let newItemText = $state('');
	let selectedCatForNewItem = $state('');

	function addCategory() {
		if (newCatName.trim()) {
			data.categories = [...data.categories, { id: crypto.randomUUID(), name: newCatName.trim() }];
			if (data.categories.length === 1) selectedCatForNewItem = data.categories[0].id;
			newCatName = '';
		}
	}

	function removeCategory(id: string) {
		data.categories = data.categories.filter((c: any) => c.id !== id);
		data.items = data.items.filter((i: any) => i.categoryId !== id); // Remove orphaned items
		if (selectedCatForNewItem === id) selectedCatForNewItem = data.categories[0]?.id || '';
	}

	function addItem() {
		if (newItemText.trim() && selectedCatForNewItem) {
			data.items = [
				...data.items,
				{ id: crypto.randomUUID(), text: newItemText.trim(), categoryId: selectedCatForNewItem }
			];
			newItemText = '';
		}
	}

	function removeItem(id: string) {
		data.items = data.items.filter((i: any) => i.id !== id);
	}
</script>

<div class="space-y-6">
	<p class="text-sm text-muted-foreground">
		قم بإنشاء تصنيفات (صناديق)، ثم أضف عناصر وقم بتعيينها لتصنيف محدد.
	</p>

	<!-- Categories -->
	<div class="rounded-xl border border-border bg-background p-4">
		<h4 class="mb-3 font-bold text-blue-400">التصنيفات</h4>
		<div class="mb-4 flex flex-wrap gap-2">
			{#each data.categories as cat}
				<div
					class="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 py-1 pr-4 pl-2 text-sm text-blue-300"
				>
					<span>{cat.name}</span>
					<button
						onclick={() => removeCategory(cat.id)}
						class="text-blue-500/50 hover:text-red-400"
					>
						<Trash2 size={14} />
					</button>
				</div>
			{/each}
		</div>

		<div class="flex gap-2">
			<input
				type="text"
				bind:value={newCatName}
				placeholder="اسم تصنيف جديد..."
				class="flex-1 rounded-lg border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
				onkeydown={(e) => e.key === 'Enter' && addCategory()}
			/>
			<button
				onclick={addCategory}
				disabled={!newCatName.trim()}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-blue-700 disabled:opacity-50"
			>
				إضافة
			</button>
		</div>
	</div>

	<!-- Items -->
	{#if data.categories.length > 0}
		<div class="rounded-xl border border-border bg-background p-4">
			<h4 class="mb-3 font-bold text-amber-400">العناصر</h4>

			<div class="mb-4 max-h-48 space-y-2 overflow-y-auto pr-2">
				{#each data.items as item}
					<div
						class="flex items-center gap-2 rounded-lg border border-white/5 bg-card text-card-foreground shadow-sm p-2 text-sm"
					>
						<span class="flex-1">{item.text}</span>
						<span class="text-xs text-foreground/40"
							>ينتمي إلى: {data.categories.find((c: any) => c.id === item.categoryId)?.name}</span
						>
						<button onclick={() => removeItem(item.id)} class="text-white/30 hover:text-red-400">
							<Trash2 size={16} />
						</button>
					</div>
				{/each}
			</div>

			<div class="flex gap-2">
				<input
					type="text"
					bind:value={newItemText}
					placeholder="نص العنصر..."
					class="flex-1 rounded-lg border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-amber-500"
					onkeydown={(e) => e.key === 'Enter' && addItem()}
				/>
				<select
					bind:value={selectedCatForNewItem}
					class="w-32 rounded-lg border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-amber-500"
				>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
				<button
					onclick={addItem}
					disabled={!newItemText.trim() || !selectedCatForNewItem}
					class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-amber-700 disabled:opacity-50"
				>
					إضافة
				</button>
			</div>
		</div>
	{:else}
		<p class="text-sm text-amber-400/80">يرجى إضافة تصنيف واحد على الأقل أولاً لإضافة العناصر.</p>
	{/if}
</div>
