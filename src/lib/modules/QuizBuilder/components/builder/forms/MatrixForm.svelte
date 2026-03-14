<script lang="ts">
	let { data = $bindable() }: any = $props();

	if (!data) data = { statements: [], columns: ['صحيح', 'خطأ'], correctAnswers: [] };

	let columnsText = $state((data.columns || []).join('، '));

	function addStatement() {
		data.statements = [...(data.statements || []), ''];
		data.correctAnswers = [...(data.correctAnswers || []), 0];
	}

	function removeStatement(i: number) {
		data.statements = data.statements.filter((_: any, idx: number) => idx !== i);
		data.correctAnswers = data.correctAnswers.filter((_: any, idx: number) => idx !== i);
	}

	function updateColumns() {
		data.columns = columnsText.split(/[,،]\s*/).filter(Boolean);
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<span class="text-sm font-semibold text-foreground/80">الأعمدة (مفصولة بفاصلة)</span>
		<input bind:value={columnsText} oninput={updateColumns} placeholder="صحيح، خطأ"
			class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
		<p class="text-xs text-foreground/40">مثال: صحيح، خطأ أو دائماً، أحياناً، أبداً</p>
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold text-foreground/80">العبارات</span>
			<button onclick={addStatement} class="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-foreground">+ إضافة عبارة</button>
		</div>
		{#each (data.statements || []) as stmt, i}
			<div class="flex gap-2 items-center">
				<input bind:value={data.statements[i]} placeholder="العبارة {i+1}..."
					class="flex-1 rounded-lg border border-border bg-background p-2 text-xs outline-none" />
				<select bind:value={data.correctAnswers[i]}
					class="rounded-lg border border-border bg-background p-2 text-xs outline-none">
					{#each (data.columns || []) as col, j}
						<option value={j}>{col}</option>
					{/each}
				</select>
				<button onclick={() => removeStatement(i)} class="text-red-400 hover:text-red-300 text-xs">🗑</button>
			</div>
		{/each}
	</div>
</div>
