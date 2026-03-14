<script lang="ts">
	import { Upload, Trash2, MapPin } from 'lucide-svelte';
	let { data = $bindable() }: any = $props();

	if (!data) data = { imageUrl: '', zones: [], correctZone: 0 };

	let uploading = $state(false);
	let imageContainer = $state<HTMLDivElement | null>(null);

	function addZone() {
		data.zones = [...(data.zones || []), { x: 50, y: 50, radius: 8, label: '' }];
	}

	function removeZone(i: number) {
		data.zones = data.zones.filter((_: any, idx: number) => idx !== i);
		if (data.correctZone >= data.zones.length) data.correctZone = 0;
	}

	async function uploadImage(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		uploading = true;
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
			const result = await res.json();
			if (res.ok) {
				data.imageUrl = result.url;
			} else {
				alert(result.error || 'خطأ في رفع الصورة');
			}
		} catch (e: any) {
			alert('خطأ: ' + e.message);
		} finally {
			uploading = false;
			target.value = '';
		}
	}

	function handleImageClick(event: MouseEvent) {
		if (!imageContainer) return;
		const rect = imageContainer.getBoundingClientRect();
		const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
		const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
		data.zones = [...(data.zones || []), { x, y, radius: 8, label: `منطقة ${(data.zones?.length || 0) + 1}` }];
	}
</script>

<div class="space-y-4">
	<!-- Image Upload -->
	<div class="space-y-2">
		<span class="text-sm font-semibold text-foreground/80">الصورة</span>
		<div class="flex items-center gap-3">
			<input bind:value={data.imageUrl} placeholder="أو أدخل رابط الصورة https://..." dir="ltr"
				class="flex-1 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
			<label class="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700">
				{#if uploading}
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
				{:else}
					<Upload size={16} />
				{/if}
				رفع
				<input type="file" accept="image/*" class="hidden" onchange={uploadImage} />
			</label>
		</div>
	</div>

	<!-- Visual Editor -->
	{#if data.imageUrl}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-semibold text-foreground/80">
					<MapPin size={14} class="mr-1 inline" /> انقر على الصورة لإضافة منطقة
				</span>
				<span class="text-xs text-muted-foreground">{data.zones?.length || 0} مناطق</span>
			</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				bind:this={imageContainer}
				class="relative cursor-crosshair overflow-hidden rounded-xl border-2 border-dashed border-blue-500/30 bg-black/5"
				onclick={handleImageClick}
				role="button"
				tabindex="0"
			>
				<img src={data.imageUrl} alt="صورة السؤال" class="w-full pointer-events-none object-contain max-h-[400px]" />
				
				{#each (data.zones || []) as zone, i}
					<div
						class="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg shadow-black/50 transition-transform hover:scale-110 {i === data.correctZone
							? 'border-emerald-400 bg-emerald-500/90 text-white'
							: 'border-blue-400 bg-blue-500/90 text-white'}"
						style="left: {zone.x}%; top: {zone.y}%; width: {zone.radius * 2}%; height: {zone.radius * 2}%; min-width: 2rem; min-height: 2rem;"
						title={zone.label || `منطقة ${i + 1}`}
					>
						{i + 1}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Zones Table -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-foreground/80">المناطق (Zones)</span>
			<button onclick={addZone} class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">+ إضافة يدوياً</button>
		</div>
		{#each (data.zones || []) as zone, i}
			<div class="flex flex-wrap gap-2 items-center rounded-lg border p-2 {i === data.correctZone ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-card'}">
				<button
					onclick={() => (data.correctZone = i)}
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold {i === data.correctZone
						? 'bg-emerald-500 text-white'
						: 'bg-muted text-foreground/40 hover:bg-blue-500/20'}"
					title="تعيين كمنطقة صحيحة"
				>{i + 1}</button>
				<input bind:value={zone.label} placeholder="تسمية" class="w-24 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<span class="text-xs text-muted-foreground">X:</span>
				<input type="number" bind:value={zone.x} min="0" max="100" class="w-14 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<span class="text-xs text-muted-foreground">Y:</span>
				<input type="number" bind:value={zone.y} min="0" max="100" class="w-14 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<span class="text-xs text-muted-foreground">نصف القطر:</span>
				<input type="number" bind:value={zone.radius} class="w-14 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<button onclick={() => removeZone(i)} class="text-red-400 hover:text-red-300 text-xs">🗑</button>
			</div>
		{/each}
	</div>
</div>
