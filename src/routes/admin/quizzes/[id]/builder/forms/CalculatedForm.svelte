<script lang="ts">
	let { data = $bindable() }: any = $props();

	if (!data) data = { formula: '', displayTemplate: '', variables: [], tolerance: 0 };

	function addVariable() {
		data.variables = [...(data.variables || []), { name: 'x', min: 1, max: 10 }];
	}

	function removeVariable(i: number) {
		data.variables = data.variables.filter((_: any, idx: number) => idx !== i);
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">الصيغة الرياضية (formula)</span>
		<input bind:value={data.formula} placeholder="مثال: a * b + c" dir="ltr"
			class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500" />
		<p class="text-xs text-white/40">استخدم {'{اسم المتغير}'} للمتغيرات العشوائية</p>
	</div>

	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">نص العرض (يظهر للطالب)</span>
		<input bind:value={data.displayTemplate} placeholder="مثال: احسب a × b + c = ?" dir="ltr"
			class="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500" />
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-white/70">المتغيرات</span>
			<button onclick={addVariable} class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">+ إضافة</button>
		</div>
		{#each (data.variables || []) as v, i}
			<div class="flex gap-2 items-center">
				<input bind:value={v.name} placeholder="اسم" dir="ltr" class="w-20 rounded-lg border border-white/10 bg-black/20 p-2 text-xs outline-none" />
				<input type="number" bind:value={v.min} placeholder="أدنى" class="w-20 rounded-lg border border-white/10 bg-black/20 p-2 text-xs outline-none" />
				<input type="number" bind:value={v.max} placeholder="أقصى" class="w-20 rounded-lg border border-white/10 bg-black/20 p-2 text-xs outline-none" />
				<button onclick={() => removeVariable(i)} class="text-red-400 hover:text-red-300 text-xs">🗑</button>
			</div>
		{/each}
	</div>

	<div class="space-y-2">
		<span class="text-sm font-semibold text-white/70">هامش الخطأ (tolerance)</span>
		<input type="number" bind:value={data.tolerance} step="0.01" placeholder="0"
			class="w-32 rounded-xl border border-white/10 bg-black/20 p-3 text-sm outline-none focus:border-blue-500" />
	</div>
</div>
