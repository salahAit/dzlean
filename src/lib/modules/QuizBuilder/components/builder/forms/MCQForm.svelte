<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	// Initialize data format
	if (!data.options) data.options = [];
	if (!data.correctIndices) data.correctIndices = [];

	function addOption() {
		data.options = [...data.options, { text: '' }];
	}

	function removeOption(idx: number) {
		data.options = data.options.filter((_: any, i: number) => i !== idx);
		// adjust correctIndices
		data.correctIndices = data.correctIndices
			.filter((currOpt: number) => currOpt !== idx)
			.map((currOpt: number) => (currOpt > idx ? currOpt - 1 : currOpt));
	}

	function toggleCorrect(idx: number) {
		if (data.correctIndices.includes(idx)) {
			data.correctIndices = data.correctIndices.filter((i: number) => i !== idx);
		} else {
			data.correctIndices = [...data.correctIndices, idx];
		}
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">
		أضف الخيارات وحدد الإجابة/الإجابات الصحيحة. يمكنك تحديد أكثر من خيار صحيح.
	</p>

	<div class="space-y-3 border-r-2 border-white/5 pr-4">
		{#each data.options as option, i}
			<div class="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-blue-500/30">
				<div class="flex items-center gap-3">
					<button
						onclick={() => toggleCorrect(i)}
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors {data.correctIndices.includes(
							i
						)
							? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
							: 'border-border bg-muted text-muted-foreground hover:bg-white/10'}"
						title="تعيين كإجابة صحيحة"
					>
						{i + 1}
					</button>
					<input
						type="text"
						bind:value={option.text}
						placeholder={`نص الخيار ${i + 1}`}
						class="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					/>
					<button
						onclick={() => removeOption(i)}
						class="rounded-lg p-2 text-foreground/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
					>
						<Trash2 size={16} />
					</button>
				</div>
				<div class="flex items-center gap-3 pr-14">
					<input
						type="text"
						bind:value={option.imageUrl}
						placeholder="رابط صورة الخيار (اختياري)"
						dir="ltr"
						class="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-left text-xs text-muted-foreground outline-none focus:border-blue-500"
					/>
					{#if option.imageUrl}
						<img src={option.imageUrl} alt="preview" class="h-8 max-w-[60px] rounded object-contain border" />
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<button
		onclick={addOption}
		class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10"
	>
		<Plus size={16} /> إضافة خيار جديد
	</button>
</div>
