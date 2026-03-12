<script lang="ts">
	import { Upload, Trash2, Tag } from 'lucide-svelte';
	let { data = $bindable() }: any = $props();

	if (!data) data = { imageUrl: '', labels: [] };

	let uploading = $state(false);
	let imageContainer = $state<HTMLDivElement | null>(null);
	let placingLabelIndex = $state<number | null>(null);

	function addLabel() {
		data.labels = [...(data.labels || []), { text: '', correctX: 50, correctY: 50 }];
	}

	function removeLabel(i: number) {
		data.labels = data.labels.filter((_: any, idx: number) => idx !== i);
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
		if (placingLabelIndex === null || !imageContainer) return;
		const rect = imageContainer.getBoundingClientRect();
		const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
		const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
		data.labels[placingLabelIndex].correctX = x;
		data.labels[placingLabelIndex].correctY = y;
		data.labels = [...data.labels]; // trigger reactivity
		placingLabelIndex = null;
	}
</script>

<div class="space-y-4">
	<!-- Image Upload -->
	<div class="space-y-2">
		<span class="text-sm font-semibold text-foreground/80">صورة / رسم تخطيطي</span>
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
					<Tag size={14} class="mr-1 inline" />
					{#if placingLabelIndex !== null}
						<span class="text-amber-400">انقر على الصورة لوضع «{data.labels[placingLabelIndex]?.text || `تسمية ${placingLabelIndex + 1}`}»</span>
					{:else}
						مواقع التسميات على الصورة
					{/if}
				</span>
			</div>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				bind:this={imageContainer}
				class="relative overflow-hidden rounded-xl border-2 border-dashed {placingLabelIndex !== null ? 'border-amber-500/50 cursor-crosshair' : 'border-border'}"
				onclick={handleImageClick}
				role="button"
				tabindex="0"
			>
				<img src={data.imageUrl} alt="رسم تخطيطي" class="w-full" />
				{#each (data.labels || []) as label, i}
					<div
						class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold shadow-lg {placingLabelIndex === i
							? 'animate-pulse border-amber-500 bg-amber-500/80 text-white'
							: 'border-blue-400 bg-blue-600/80 text-white'}"
						style="left: {label.correctX}%; top: {label.correctY}%"
					>
						{label.text || `#${i + 1}`}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Labels List -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-foreground/80">التسميات</span>
			<button onclick={addLabel} class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">+ إضافة تسمية</button>
		</div>
		{#each (data.labels || []) as label, i}
			<div class="flex flex-wrap gap-2 items-center rounded-lg border border-border bg-card p-2">
				<input bind:value={label.text} placeholder="تسمية" class="flex-1 min-w-[100px] rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<span class="text-xs text-muted-foreground">X%:</span>
				<input type="number" bind:value={label.correctX} min="0" max="100" class="w-14 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<span class="text-xs text-muted-foreground">Y%:</span>
				<input type="number" bind:value={label.correctY} min="0" max="100" class="w-14 rounded-lg border border-border bg-background p-1.5 text-xs outline-none" />
				<button
					onclick={() => (placingLabelIndex = i)}
					class="rounded-lg px-2 py-1 text-xs font-bold {placingLabelIndex === i
						? 'bg-amber-500 text-white'
						: 'bg-muted text-foreground/60 hover:bg-blue-500/20'}"
					title="النقر على الصورة لتحديد الموقع"
				>📍</button>
				<button onclick={() => removeLabel(i)} class="text-red-400 hover:text-red-300 text-xs">🗑</button>
			</div>
		{/each}
	</div>
</div>
