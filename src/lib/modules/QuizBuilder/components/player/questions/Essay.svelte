<script lang="ts">
	/**
	 * Essay — Free-text long answer
	 * Data: { minWords?: number, maxWords?: number, keywords?: string[] }
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	let text = $state('');

	let wordCount = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);
	let minWords = $derived(data.minWords || 0);
	let maxWords = $derived(data.maxWords || 0);

	function handleInput() {
		if (!text.trim()) return;

		// Keyword-based auto-grading (if keywords provided)
		const keywords = data.keywords || [];
		if (keywords.length > 0) {
			const minRequired = data.minKeywords || 1;
			const found = keywords.filter((kw: string) => text.includes(kw)).length;
			const correct = found >= minRequired;
			onAnswer?.({ text, wordCount, keywordsFound: found, correct });
		} else {
			// No auto-grading, just submit text
			onAnswer?.({ text, wordCount, correct: true });
		}
	}
</script>

<div class="space-y-3">
	<textarea
		bind:value={text}
		oninput={handleInput}
		{disabled}
		rows="6"
		placeholder="اكتب إجابتك هنا..."
		class="border-border bg-muted/30 w-full resize-y rounded-xl border p-4 text-sm leading-relaxed transition-all outline-none focus:border-blue-500 disabled:opacity-50 dark:border-white/10 dark:bg-black/20"
	></textarea>

	<div class="text-muted-foreground flex items-center justify-between text-xs">
		<span>
			عدد الكلمات: <span
				class="font-bold {wordCount < minWords ? 'text-amber-400' : 'text-emerald-400'}"
				>{wordCount}</span
			>
			{#if minWords > 0}
				<span> / الحد الأدنى: {minWords}</span>
			{/if}
		</span>
		{#if maxWords > 0}
			<span class:text-red-400={wordCount > maxWords}>الحد الأقصى: {maxWords} كلمة</span>
		{/if}
	</div>

	{#if showResult}
		{#if data.keywords?.length}
			<div
				class="rounded-lg p-3 text-sm {isCorrect
					? 'bg-emerald-500/20 text-emerald-400'
					: 'bg-amber-500/20 text-amber-400'}"
			>
				{isCorrect
					? '✓ الإجابة تحتوي على الكلمات المفتاحية المطلوبة'
					: '✗ الإجابة لا تحتوي على بعض الكلمات المفتاحية المطلوبة'}
			</div>
		{:else}
			<div class="rounded-lg bg-blue-500/20 p-3 text-sm text-blue-400">
				📝 يتم تصحيح هذا السؤال يدوياً من المعلم
			</div>
		{/if}
	{/if}
</div>
