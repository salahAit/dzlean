<script lang="ts">
	let { data = $bindable() }: any = $props();

	if (!data) data = { minWords: 0, maxWords: 0, keywords: [] };

	let keywordsText = $state((data.keywords || []).join('، '));

	function updateKeywords() {
		data.keywords = keywordsText.split(/[,،]\s*/).filter(Boolean);
		data.minKeywords = Math.max(1, Math.ceil(data.keywords.length * 0.5));
	}
</script>

<div class="space-y-4">
	<div class="grid gap-4 md:grid-cols-2">
		<div class="space-y-2">
			<span class="text-sm font-semibold text-foreground/80">الحد الأدنى للكلمات</span>
			<input type="number" bind:value={data.minWords} min="0" placeholder="0 = بدون حد"
				class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
		</div>
		<div class="space-y-2">
			<span class="text-sm font-semibold text-foreground/80">الحد الأقصى للكلمات</span>
			<input type="number" bind:value={data.maxWords} min="0" placeholder="0 = بدون حد"
				class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
		</div>
	</div>

	<div class="space-y-2">
		<span class="text-sm font-semibold text-foreground/80">كلمات مفتاحية للتصحيح التلقائي (اختياري)</span>
		<textarea bind:value={keywordsText} oninput={updateKeywords} rows="2" placeholder="كلمة1، كلمة2، كلمة3"
			class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
		<p class="text-xs text-foreground/40">اترك فارغاً للتصحيح اليدوي من المعلم. إذا أضفت كلمات مفتاحية سيتم التصحيح تلقائياً</p>
	</div>
</div>
