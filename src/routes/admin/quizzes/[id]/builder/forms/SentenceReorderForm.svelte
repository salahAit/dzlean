<script lang="ts">
	let { data = $bindable() }: any = $props();

	if (!data) data = { words: [], correctOrder: [] };

	let wordsText = $state((data.words || []).join(' '));

	function updateWords() {
		const words = wordsText.split(/\s+/).filter(Boolean);
		data.words = words;
		data.correctOrder = words.map((_: any, i: number) => i);
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">الجملة الصحيحة (بالترتيب الصحيح)</span>
		<textarea bind:value={wordsText} oninput={updateWords} rows="2" placeholder="اكتب الجملة بالترتيب الصحيح (كلمة كلمة مفصولة بمسافة)"
			class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500"></textarea>
		<p class="text-xs text-white/40">سيتم خلط الكلمات تلقائياً عند عرض السؤال للطالب</p>
	</div>

	{#if data.words?.length > 0}
		<div class="rounded-lg border border-white/10 bg-white/5 p-3">
			<p class="mb-2 text-xs font-bold text-white/50">معاينة الكلمات ({data.words.length}):</p>
			<div class="flex flex-wrap gap-1.5">
				{#each data.words as word}
					<span class="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-bold text-blue-400">{word}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
