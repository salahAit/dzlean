<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	if (!data.options) data.options = [];
	if (!data.correctOptionIndex) data.correctOptionIndex = 0;

	function addOption() {
		data.options = [...data.options, { text: '' }];
	}

	function removeOption(idx: number) {
		data.options = data.options.filter((_: any, i: number) => i !== idx);
		if (data.correctOptionIndex === idx) {
			data.correctOptionIndex = 0;
		} else if (data.correctOptionIndex > idx) {
			data.correctOptionIndex -= 1;
		}
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">
		في "نص السؤال" بالأعلى، استخدم ثلاث شرطات سفلية <code>___</code> لتمثيل الفراغ المُراد ملؤه.<br
		/>
		أضف قائمة الخيارات هنا، وحدد الخيار الصحيح ليملأ الفراغ.
	</p>

	<div class="space-y-3">
		{#each data.options as option, i}
			<div class="flex items-center gap-3">
				<input
					type="radio"
					name="cloze_correct"
					bind:group={data.correctOptionIndex}
					value={i}
					class="h-5 w-5 rounded border-border accent-emerald-500"
					title="تعيين كإجابة صحيحة"
				/>
				<input
					type="text"
					bind:value={option.text}
					placeholder={`خيار ${i + 1}`}
					class="flex-1 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary {data.correctOptionIndex ===
					i
						? 'border-emerald-500/50 bg-emerald-500/10'
						: ''}"
				/>
				<button
					onclick={() => removeOption(i)}
					class="rounded-lg p-2 text-foreground/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
				>
					<Trash2 size={16} />
				</button>
			</div>
		{/each}
	</div>

	<button
		onclick={addOption}
		class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10"
	>
		<Plus size={16} /> إضافة خيار جديد للقائمة
	</button>
</div>
