<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	if (!data.keywords) data.keywords = [];

	function addKeyword() {
		data.keywords = [...data.keywords, ''];
	}

	function removeKeyword(idx: number) {
		data.keywords = data.keywords.filter((_: any, i: number) => i !== idx);
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">
		أضف مسودة الكلمات المفتاحية المقبولة. ستُعتبر إجابة الطالب صحيحة إذا كانت تحتوي على إحدى هذه
		الكلمات المفتاحية على الأقل (نظام مرن).
	</p>

	<div class="space-y-3">
		{#each data.keywords as keyword, i}
			<div class="flex items-center gap-2">
				<span class="text-blue-500/50">كلمة مقبولة / تطابق</span>
				<input
					type="text"
					bind:value={data.keywords[i]}
					placeholder="مثال: ثورة التحرير"
					class="flex-1 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
				/>
				<button
					onclick={() => removeKeyword(i)}
					class="rounded-lg p-2 text-foreground/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
				>
					<Trash2 size={16} />
				</button>
			</div>
		{/each}
	</div>

	<button
		onclick={addKeyword}
		class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10"
	>
		<Plus size={16} /> إضافة كلمة مفتاحية مقبولة
	</button>
</div>
