<script lang="ts">
	import { Plus, Trash2 } from 'lucide-svelte';

	let { data = $bindable() } = $props();

	if (!data.acceptedAnswers) data.acceptedAnswers = [];

	function addAnswer() {
		data.acceptedAnswers = [...data.acceptedAnswers, ''];
	}

	function removeAnswer(idx: number) {
		data.acceptedAnswers = data.acceptedAnswers.filter((_: any, i: number) => i !== idx);
	}
</script>

<div class="space-y-4">
	<p class="mb-4 text-sm text-muted-foreground">
		في "نص السؤال" بالأعلى، استخدم ثلاث شرطات سفلية <code>___</code> لتمثيل الفراغ المُراد ملؤه.
		<br />ثم أضف هنا جميع الإجابات الصحيحة المقبولة (تُقبل الإجابة إذا طابقت أيًا منها).
	</p>

	<div class="space-y-3">
		{#each data.acceptedAnswers as answer, i}
			<div class="flex items-center gap-2">
				<span class="text-blue-500/50">إجابة مقبولة</span>
				<input
					type="text"
					bind:value={data.acceptedAnswers[i]}
					placeholder="مثال: باريس"
					class="flex-1 rounded-xl border border-border bg-card text-card-foreground shadow-sm p-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
				/>
				<button
					onclick={() => removeAnswer(i)}
					class="rounded-lg p-2 text-foreground/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
				>
					<Trash2 size={16} />
				</button>
			</div>
		{/each}
	</div>

	<button
		onclick={addAnswer}
		class="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/10"
	>
		<Plus size={16} /> إضافة إجابة بديلة مقبولة
	</button>
</div>
