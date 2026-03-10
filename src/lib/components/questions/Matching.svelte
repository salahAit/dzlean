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

	function selectLeft(i: number) {
		selectedLeft = i;
	}

	function selectRight(ri: number) {
		if (selectedLeft === null) return;
		matches = { ...matches, [selectedLeft]: ri };
		selectedLeft = null;
		if (Object.keys(matches).length === pairs.length) {
			onAnswer({ matches: { ...matches } });
		}
	}

	function isLeftMatched(i: number): boolean {
		return i in matches;
	}

	function isRightMatched(ri: number): boolean {
		return Object.values(matches).includes(ri);
	}
</script>

<div class="space-y-6">
	<p class="text-muted-foreground text-sm">اختر عنصراً من اليمين ثم العنصر المطابق من اليسار</p>

	<div class="grid grid-cols-2 gap-6">
		<!-- Left Column -->
		<div class="space-y-2">
			{#each pairs as pair, i}
				<button
					onclick={() => selectLeft(i)}
					disabled={isLeftMatched(i)}
					class="w-full rounded-xl border-2 p-3 text-right font-semibold transition-all {selectedLeft ===
					i
						? 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-md'
						: isLeftMatched(i)
							? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 opacity-70'
							: 'border-white/10 bg-white/5 hover:border-white/20'}"
				>
					{pair.left}
				</button>
			{/each}
		</div>

		<!-- Right Column (shuffled) -->
		<div class="space-y-2">
			{#each shuffledRight as ri}
				<button
					onclick={() => selectRight(ri)}
					disabled={isRightMatched(ri)}
					class="w-full rounded-xl border-2 p-3 text-right font-semibold transition-all {isRightMatched(
						ri
					)
						? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 opacity-70'
						: 'border-white/10 bg-white/5 hover:border-amber-500/30 hover:bg-amber-500/5'}"
				>
					{pairs[ri].right}
				</button>
			{/each}
		</div>
	</div>
</div>
