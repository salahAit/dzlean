<script lang="ts">
	/**
	 * Hotspot — Click on correct area of image
	 * Data: { imageUrl: string, zones: { x, y, radius, label }[], correctZone: number }
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	let selectedZone = $state<number | null>(null);
	let imgWidth = $state(0);
	let imgHeight = $state(0);
	let containerRef: HTMLDivElement;

	function handleClick(event: MouseEvent | TouchEvent) {
		if (disabled) return;
		const rect = containerRef.getBoundingClientRect();
		let clientX: number, clientY: number;

		if (event instanceof TouchEvent) {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		} else {
			clientX = event.clientX;
			clientY = event.clientY;
		}

		const x = ((clientX - rect.left) / rect.width) * 100;
		const y = ((clientY - rect.top) / rect.height) * 100;

		// Check which zone was clicked
		for (let i = 0; i < (data.zones || []).length; i++) {
			const zone = data.zones[i];
			const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
			if (dist <= (zone.radius || 10)) {
				selectedZone = i;
				onAnswer?.({ zone: i, correct: i === data.correctZone });
				return;
			}
		}
	}

	function selectZone(i: number) {
		if (disabled) return;
		selectedZone = i;
		onAnswer?.({ zone: i, correct: i === data.correctZone });
	}
</script>

<div class="space-y-4">
	<!-- Image with clickable zones -->
	<div
		bind:this={containerRef}
		class="border-border relative mx-auto max-w-lg cursor-crosshair overflow-hidden rounded-xl border dark:border-white/10"
		role="img"
	>
		{#if data.imageUrl}
			<img
				src={data.imageUrl}
				alt="اضغط على المنطقة الصحيحة"
				class="w-full"
				onload={(e) => {
					imgWidth = (e.target as HTMLImageElement).naturalWidth;
					imgHeight = (e.target as HTMLImageElement).naturalHeight;
				}}
			/>
		{:else}
			<div class="bg-muted text-muted-foreground/30 flex h-48 items-center justify-center text-sm">
				لا توجد صورة
			</div>
		{/if}

		<!-- Overlay zones -->
		{#each data.zones || [] as zone, i}
			<button
				onclick={() => selectZone(i)}
				{disabled}
				class="absolute rounded-full border-2 transition-all {selectedZone === i
					? 'scale-110 border-blue-500 bg-blue-500/30'
					: 'border-secondary-foreground/30 bg-secondary/80 hover:bg-secondary dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20'}"
				style="left: {zone.x - (zone.radius || 8)}%; top: {zone.y -
					(zone.radius || 8)}%; width: {(zone.radius || 8) * 2}%; height: {(zone.radius || 8) *
					2}%;"
				title={zone.label || ''}
			>
			</button>
		{/each}

		{#if showResult && data.correctZone !== undefined}
			<div
				class="absolute rounded-full border-3 {isCorrect
					? 'border-emerald-400 bg-emerald-400/20'
					: 'border-red-400 bg-red-400/20'} animate-pulse"
				style="left: {(data.zones?.[data.correctZone]?.x || 50) - 8}%; top: {(data.zones?.[
					data.correctZone
				]?.y || 50) - 8}%; width: 16%; height: 16%;"
			></div>
		{/if}
	</div>



	{#if showResult}
		<div
			class="mt-2 rounded-lg p-3 text-center text-sm font-bold {isCorrect
				? 'bg-emerald-500/20 text-emerald-400'
				: 'bg-red-500/20 text-red-400'}"
		>
			{isCorrect
				? '✓ منطقة صحيحة!'
				: `✗ المنطقة الصحيحة: ${data.zones?.[data.correctZone]?.label || data.correctZone}`}
		</div>
	{/if}
</div>
