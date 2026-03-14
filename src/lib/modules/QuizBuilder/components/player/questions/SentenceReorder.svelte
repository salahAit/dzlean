<script lang="ts">
	/**
	 * Sentence Reorder — Drag words to form correct sentence
	 * Data: { words: string[], correctOrder: number[] }
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	let shuffledWords = $state<{ text: string; origIdx: number }[]>([]);
	let arranged = $state<{ text: string; origIdx: number }[]>([]);
	let draggedIdx = $state<number | null>(null);
	let dragSource = $state<'pool' | 'arranged' | null>(null);

	import { onMount } from 'svelte';

	onMount(() => {
		const words = (data.words || []).map((w: string, i: number) => ({ text: w, origIdx: i }));
		// Shuffle
		for (let i = words.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[words[i], words[j]] = [words[j], words[i]];
		}
		shuffledWords = words;
		arranged = [];
	});

	function addWord(idx: number) {
		if (disabled) return;
		arranged = [...arranged, shuffledWords[idx]];
		shuffledWords = shuffledWords.filter((_, i) => i !== idx);
		checkAnswer();
	}

	function removeWord(idx: number) {
		if (disabled) return;
		shuffledWords = [...shuffledWords, arranged[idx]];
		arranged = arranged.filter((_, i) => i !== idx);
		checkAnswer();
	}

	function checkAnswer() {
		if (arranged.length === (data.words || []).length) {
			const order = arranged.map((w) => w.origIdx);
			const correct = JSON.stringify(order) === JSON.stringify(data.correctOrder);
			onAnswer?.({ order, correct });
		}
	}

	// Touch-friendly: just tap to move between pools
</script>

<div class="space-y-4">
	<!-- Arranged sentence -->
	<div
		class="flex min-h-[56px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-black/10 bg-black/5 p-3 dark:border-white/20 dark:bg-white/5 {arranged.length ===
		0
			? 'items-center justify-center'
			: ''}"
	>
		{#if arranged.length === 0}
			<span class="text-muted-foreground/50 text-sm">اضغط على الكلمات لترتيب الجملة</span>
		{:else}
			{#each arranged as word, i}
				<button
					onclick={() => removeWord(i)}
					{disabled}
					class="rounded-lg bg-blue-600/80 px-3 py-1.5 text-sm font-bold text-white shadow transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
				>
					{word.text}
				</button>
			{/each}
		{/if}
	</div>

	<!-- Word pool -->
	<div class="flex flex-wrap justify-center gap-2">
		{#each shuffledWords as word, i}
			<button
				onclick={() => addWord(i)}
				{disabled}
				class="bg-secondary text-secondary-foreground/80 hover:bg-secondary/80 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
			>
				{word.text}
			</button>
		{/each}
	</div>

	{#if showResult}
		<div
			class="mt-2 rounded-lg p-3 text-center text-sm font-bold {isCorrect
				? 'bg-emerald-500/20 text-emerald-400'
				: 'bg-red-500/20 text-red-400'}"
		>
			{isCorrect
				? '✓ ترتيب صحيح!'
				: `✗ الترتيب الصحيح: ${data.words?.filter((_: any, i: number) => data.correctOrder.includes(i)).join(' ') || ''}`}
		</div>
	{/if}
</div>
