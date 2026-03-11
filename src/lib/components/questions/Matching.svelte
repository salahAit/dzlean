<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let pairs: { left: string; right: string }[] = $derived(data.pairs || []);

	let selectedLeft = $state<number | null>(null);
	let matches = $state<Record<number, number>>({});
	let shuffledRight = $state<number[]>([]);

	// Shuffle right column on init
	$effect(() => {
		const indices = pairs.map((_, i) => i);
		for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
		}
		shuffledRight = indices;
	});

	// Define distinct vibrant colors for up to 10 pairs
	const pairColors = [
		'border-blue-500/50 bg-blue-500/15 text-blue-600 dark:text-blue-300 dark:bg-blue-500/20',
		'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 dark:bg-emerald-500/20',
		'border-purple-500/50 bg-purple-500/15 text-purple-600 dark:text-purple-300 dark:bg-purple-500/20',
		'border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-300 dark:bg-amber-500/20',
		'border-pink-500/50 bg-pink-500/15 text-pink-600 dark:text-pink-300 dark:bg-pink-500/20',
		'border-cyan-500/50 bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 dark:bg-cyan-500/20',
		'border-rose-500/50 bg-rose-500/15 text-rose-600 dark:text-rose-300 dark:bg-rose-500/20',
		'border-indigo-500/50 bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 dark:bg-indigo-500/20',
		'border-orange-500/50 bg-orange-500/15 text-orange-600 dark:text-orange-300 dark:bg-orange-500/20',
		'border-teal-500/50 bg-teal-500/15 text-teal-600 dark:text-teal-300 dark:bg-teal-500/20'
	];

	function selectLeft(i: number) {
		// Undo match if already matched
		if (i in matches) {
			const newMatches = { ...matches };
			delete newMatches[i];
			matches = newMatches;
			onAnswer({ matches: { ...matches } });
			return;
		}

		// Toggle selection
		selectedLeft = selectedLeft === i ? null : i;
	}

	function selectRight(ri: number) {
		// Undo match if already matched
		const leftKey = Object.keys(matches).find((key) => matches[Number(key)] === ri);
		if (leftKey !== undefined) {
			const newMatches = { ...matches };
			delete newMatches[Number(leftKey)];
			matches = newMatches;
			onAnswer({ matches: { ...matches } });
			return;
		}

		if (selectedLeft === null) return;
		
		matches = { ...matches, [selectedLeft]: ri };
		selectedLeft = null;
		
		// Send answers (even if not fully complete, to maintain state)
		onAnswer({ matches: { ...matches } });
	}

	function getLeftColorClass(i: number): string {
		if (selectedLeft === i) {
			return 'border-primary ring-2 ring-primary bg-primary/10 text-primary shadow-md';
		}
		if (i in matches) {
			return pairColors[i % pairColors.length];
		}
		return 'border-border bg-secondary/50 hover:border-foreground/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 text-foreground';
	}

	function getRightColorClass(ri: number): string {
		const leftKey = Object.keys(matches).find((key) => matches[Number(key)] === ri);
		if (leftKey !== undefined) {
			return pairColors[Number(leftKey) % pairColors.length];
		}
		return 'border-border bg-secondary/50 hover:border-foreground/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 text-foreground';
	}
</script>

<div class="space-y-6">
	<p class="text-muted-foreground text-sm">اختر عنصراً من اليمين ثم العنصر المطابق من اليسار</p>

	<div class="grid grid-cols-2 gap-6">
		<div class="space-y-2">
			{#each pairs as pair, i}
				<button
					onclick={() => selectLeft(i)}
					class="w-full rounded-xl border-2 p-3 text-right font-semibold transition-all duration-200 {getLeftColorClass(i)}"
				>
					{pair.left}
				</button>
			{/each}
		</div>

		<div class="space-y-2">
			{#each shuffledRight as ri}
				<button
					onclick={() => selectRight(ri)}
					class="w-full rounded-xl border-2 p-3 text-right font-semibold transition-all duration-200 {getRightColorClass(ri)}"
				>
					{pairs[ri].right}
				</button>
			{/each}
		</div>
	</div>
</div>
