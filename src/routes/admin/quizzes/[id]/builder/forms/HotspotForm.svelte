<script lang="ts">
	let { data = $bindable() }: any = $props();

	if (!data) data = { imageUrl: '', zones: [], correctZone: 0 };

	function addZone() {
		data.zones = [...(data.zones || []), { x: 50, y: 50, radius: 8, label: '' }];
	}

	function removeZone(i: number) {
		data.zones = data.zones.filter((_: any, idx: number) => idx !== i);
		if (data.correctZone >= data.zones.length) data.correctZone = 0;
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">رابط الصورة (URL)</span>
		<input bind:value={data.imageUrl} placeholder="https://..." dir="ltr"
			class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500" />
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-white/70">المناطق (Zones)</span>
			<button onclick={addZone} class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">+ إضافة منطقة</button>
		</div>
		{#each (data.zones || []) as zone, i}
			<div class="flex flex-wrap gap-2 items-center rounded-lg border border-white/10 bg-white/5 p-2">
				<input bind:value={zone.label} placeholder="تسمية" class="w-24 rounded-lg border border-white/10 bg-black/20 p-1.5 text-xs outline-none" />
				<span class="text-xs text-white/50">X:</span>
				<input type="number" bind:value={zone.x} class="w-16 rounded-lg border border-white/10 bg-black/20 p-1.5 text-xs outline-none" />
				<span class="text-xs text-white/50">Y:</span>
				<input type="number" bind:value={zone.y} class="w-16 rounded-lg border border-white/10 bg-black/20 p-1.5 text-xs outline-none" />
				<span class="text-xs text-white/50">نصف القطر:</span>
				<input type="number" bind:value={zone.radius} class="w-16 rounded-lg border border-white/10 bg-black/20 p-1.5 text-xs outline-none" />
				<button onclick={() => removeZone(i)} class="text-red-400 hover:text-red-300 text-xs">🗑</button>
			</div>
		{/each}
	</div>

	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">المنطقة الصحيحة (رقم، يبدأ من 0)</span>
		<input type="number" bind:value={data.correctZone} min="0" max={(data.zones?.length || 1) - 1}
			class="w-24 rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500" />
	</div>
</div>
