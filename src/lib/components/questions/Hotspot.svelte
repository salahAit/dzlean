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
		class="relative mx-auto max-w-lg overflow-hidden rounded-xl border border-white/10 cursor-crosshair"
		role="img"
	>
		{#if data.imageUrl}
			<img
				src={data.imageUrl}
				alt="اضغط على المنطقة الصحيحة"
				class="w-full"
				onload={(e) => { imgWidth = (e.target as HTMLImageElement).naturalWidth; imgHeight = (e.target as HTMLImageElement).naturalHeight; }}
			/>
		{:else}
			<div class="flex h-48 items-center justify-center bg-white/5 text-white/30 text-sm">
				لا توجد صورة
			</div>
		{/if}

		<!-- Overlay zones -->
		{#each (data.zones || []) as zone, i}
			<button
				onclick={() => selectZone(i)}
				{disabled}
				class="absolute rounded-full border-2 transition-all {selectedZone === i ? 'border-blue-500 bg-blue-500/30 scale-110' : 'border-white/30 bg-white/10 hover:bg-white/20'}"
				style="left: {zone.x - (zone.radius || 8)}%; top: {zone.y - (zone.radius || 8)}%; width: {(zone.radius || 8) * 2}%; height: {(zone.radius || 8) * 2}%;"
				title={zone.label || ''}
			>
				{#if zone.label}
					<span class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-white/60">{zone.label}</span>
				{/if}
			</button>
		{/each}

		{#if showResult && data.correctZone !== undefined}
			<div
				class="absolute rounded-full border-3 {isCorrect ? 'border-emerald-400 bg-emerald-400/20' : 'border-red-400 bg-red-400/20'} animate-pulse"
				style="left: {(data.zones?.[data.correctZone]?.x || 50) - 8}%; top: {(data.zones?.[data.correctZone]?.y || 50) - 8}%; width: 16%; height: 16%;"
			></div>
		{/if}
	</div>

	<!-- Zone buttons for accessibility / mobile fallback -->
	{#if (data.zones || []).length > 0 && data.zones[0].label}
		<div class="flex flex-wrap gap-2 justify-center">
			{#each (data.zones || []) as zone, i}
				<button
					onclick={() => selectZone(i)}
					{disabled}
					class="rounded-lg px-3 py-1.5 text-sm font-bold transition-all {selectedZone === i ? 'bg-blue-600 text-white' : 'border border-white/20 bg-white/5 text-white/70 hover:bg-white/10'} disabled:opacity-50"
				>
					{zone.label}
				</button>
			{/each}
		</div>
	{/if}

	{#if showResult}
		<div class="mt-2 rounded-lg p-3 text-center text-sm font-bold {isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
			{isCorrect ? '✓ منطقة صحيحة!' : `✗ المنطقة الصحيحة: ${data.zones?.[data.correctZone]?.label || data.correctZone}`}
		</div>
	{/if}
</div>
