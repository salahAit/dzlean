<script lang="ts">
	/**
	 * Matrix — Multi-row true/false or selection grid
	 * Data: { statements: string[], columns: string[], correctAnswers: number[] }
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	let selected = $state<Record<number, number>>({});

	function select(row: number, col: number) {
		if (disabled) return;
		selected = { ...selected, [row]: col };
		const stmts = data.statements || [];
		if (Object.keys(selected).length === stmts.length) {
			const allCorrect = stmts.every(
				(_: any, i: number) => selected[i] === data.correctAnswers?.[i]
			);
			onAnswer?.({ answers: selected, correct: allCorrect });
		}
	}

	function getButtonClass(rowIdx: number, colIdx: number): string {
		const isSelected = selected[rowIdx] === colIdx;
		if (!isSelected)
			return 'border-border hover:border-black/40 hover:bg-muted dark:border-white/20 dark:hover:border-white/40 dark:hover:bg-white/10';
		if (!showResult) return 'border-blue-500 bg-blue-500 text-white';
		return colIdx === data.correctAnswers?.[rowIdx]
			? 'border-emerald-500 bg-emerald-500 text-white'
			: 'border-red-500 bg-red-500 text-white';
	}
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b">
				<th class="text-muted-foreground p-3 text-right font-bold">العبارة</th>
				{#each data.columns || [] as col}
					<th class="text-muted-foreground p-3 text-center font-bold">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.statements || [] as stmt, rowIdx}
				<tr class="hover:bg-muted/50 border-b transition-colors last:border-0">
					<td class="text-foreground/90 p-3 font-semibold">{stmt}</td>
					{#each data.columns || [] as _, colIdx}
						<td class="p-3 text-center">
							<button
								onclick={() => select(rowIdx, colIdx)}
								{disabled}
								class="mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all disabled:opacity-50 {getButtonClass(
									rowIdx,
									colIdx
								)}"
							>
								{#if selected[rowIdx] === colIdx}
									<span class="text-xs font-bold">✓</span>
								{/if}
							</button>
						</td>
					{/each}
					{#if showResult && selected[rowIdx] !== undefined && selected[rowIdx] !== data.correctAnswers?.[rowIdx]}
						<td class="p-2">
							<span class="text-[10px] text-emerald-400"
								>← {data.columns?.[data.correctAnswers?.[rowIdx]]}</span
							>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showResult}
	<div
		class="mt-3 rounded-lg p-3 text-center text-sm font-bold {isCorrect
			? 'bg-emerald-500/20 text-emerald-400'
			: 'bg-red-500/20 text-red-400'}"
	>
		{isCorrect ? '✓ جميع الإجابات صحيحة!' : '✗ بعض الإجابات غير صحيحة'}
	</div>
{/if}
