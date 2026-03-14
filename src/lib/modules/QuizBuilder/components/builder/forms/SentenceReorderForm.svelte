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
		<span class="text-sm font-semibold text-foreground/80">الجملة الصحيحة (بالترتيب الصحيح)</span>
		<textarea bind:value={wordsText} oninput={updateWords} rows="2" placeholder="اكتب الجملة بالترتيب الصحيح (كلمة كلمة مفصولة بمسافة)"
			class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
		<p class="text-xs text-foreground/40">سيتم خلط الكلمات تلقائياً عند عرض السؤال للطالب</p>
	</div>

	{#if data.words?.length > 0}
		<div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-3">
			<p class="mb-2 text-xs font-bold text-muted-foreground">معاينة الكلمات ({data.words.length}):</p>
			<div class="flex flex-wrap gap-1.5">
				{#each data.words as word}
					<span class="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-bold text-blue-400">{word}</span>
				{/each}
			</div>
		</div>
	{/if}
</div>
