<script lang="ts">
	/**
	 * DragToImage — Drag labels onto their correct positions on a diagram
	 * Data: { imageUrl: string, labels: { text: string, correctX: number, correctY: number }[] }
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	let pool = $state<number[]>([]);
	let placed = $state<Record<number, { x: number; y: number }>>({});
	let activeLabel = $state<number | null>(null);

	import { onMount } from 'svelte';

	onMount(() => {
		pool = (data.labels || []).map((_: any, i: number) => i);
		// Shuffle pool
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}
	});

	let containerRef: HTMLDivElement;

	function selectLabel(idx: number) {
		if (disabled) return;
		activeLabel = idx;
	}

	function placeOnImage(event: MouseEvent | TouchEvent) {
		if (disabled || activeLabel === null) return;
		const rect = containerRef.getBoundingClientRect();
		let clientX: number, clientY: number;
		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}
		const x = Math.round(((clientX - rect.left) / rect.width) * 100);
		const y = Math.round(((clientY - rect.top) / rect.height) * 100);

		placed = { ...placed, [activeLabel]: { x, y } };
		pool = pool.filter((i) => i !== activeLabel);
		activeLabel = null;

		checkAnswer();
	}

	function removePlaced(idx: number) {
		if (disabled) return;
		const { [idx]: _, ...rest } = placed;
		placed = rest;
		pool = [...pool, idx];
	}

	function checkAnswer() {
		if (Object.keys(placed).length === (data.labels || []).length) {
			// Check if all labels are close enough to their correct positions
			let allCorrect = true;
			for (const [idxStr, pos] of Object.entries(placed)) {
				const idx = parseInt(idxStr);
				const label = data.labels[idx];
				const dist = Math.sqrt((pos.x - label.correctX) ** 2 + (pos.y - label.correctY) ** 2);
				if (dist > 15) allCorrect = false; // tolerance: 15% of image
			}
			onAnswer?.({ placements: placed, correct: allCorrect });
		}
	}
</script>

<div class="space-y-4">
	{#if activeLabel !== null}
		<div class="animate-pulse text-center text-sm font-bold text-blue-400">
			📍 اضغط على الصورة لوضع: "{data.labels?.[activeLabel]?.text}"
		</div>
	{/if}

	<!-- Image area -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={containerRef}
		onclick={placeOnImage}
		ontouchstart={placeOnImage}
		class="border-border relative mx-auto max-w-lg overflow-hidden rounded-xl border dark:border-white/10 {activeLabel !==
		null
			? 'cursor-crosshair ring-2 ring-blue-500/50'
			: 'cursor-default'}"
		role="img"
	>
		{#if data.imageUrl}
			<img
				src={data.imageUrl}
				alt="ضع التسميات في أماكنها"
				class="pointer-events-none w-full select-none"
			/>
		{:else}
			<div class="bg-muted text-muted-foreground/50 flex h-48 items-center justify-center text-sm">
				رسم تخطيطي
			</div>
		{/if}

		<!-- Placed labels -->
		{#each Object.entries(placed) as [idxStr, pos]}
			{@const idx = parseInt(idxStr)}
			<button
				onclick={(e) => {
					e.stopPropagation();
					removePlaced(idx);
				}}
				{disabled}
				class="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white shadow-lg transition-all hover:scale-110 hover:bg-red-500"
				style="left: {pos.x}%; top: {pos.y}%;"
				title="اضغط للإزالة"
			>
				{data.labels?.[idx]?.text}
			</button>
		{/each}

		<!-- Show correct positions after result -->
		{#if showResult}
			{#each data.labels || [] as label, i}
				<div
					class="absolute -translate-x-1/2 -translate-y-1/2 rounded border-2 border-dashed border-emerald-400/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400"
					style="left: {label.correctX}%; top: {label.correctY}%;"
				>
					{label.text}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Label pool -->
	<div class="flex flex-wrap justify-center gap-2">
		{#each pool as idx}
			<button
				onclick={() => selectLabel(idx)}
				{disabled}
				class="rounded-lg px-3 py-1.5 text-sm font-bold transition-all {activeLabel === idx
					? 'bg-blue-600 text-white ring-2 ring-blue-400'
					: 'border-border bg-secondary text-foreground/80 hover:bg-secondary/40 border dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20'} active:scale-95 disabled:opacity-50"
			>
				{data.labels?.[idx]?.text}
			</button>
		{/each}
	</div>

	{#if showResult}
		<div
			class="mt-2 rounded-lg p-3 text-center text-sm font-bold {isCorrect
				? 'bg-emerald-500/20 text-emerald-400'
				: 'bg-red-500/20 text-red-400'}"
		>
			{isCorrect ? '✓ جميع التسميات في أماكنها الصحيحة!' : '✗ بعض التسميات ليست في أماكنها الصحيحة'}
		</div>
	{/if}
</div>
