<script lang="ts">
	/**
	 * Calculated Question — Formula-based with randomized variables
	 * Data: { formula: string, variables: {name, min, max}[], tolerance: number }
	 * Generated values are randomized on mount
	 */
	let { data, onAnswer, disabled = false, showResult, isCorrect }: any = $props();

	import { onMount } from 'svelte';

	let vars = $state<Record<string, number>>({});
	let correctAnswer = $state(0);
	let userAnswer = $state('');

	onMount(() => {
		// Generate random values for each variable
		const v: Record<string, number> = {};
		for (const variable of (data.variables || [])) {
			v[variable.name] = Math.floor(Math.random() * (variable.max - variable.min + 1)) + variable.min;
		}
		vars = v;

		// Evaluate formula to get correct answer
		try {
			let expr = data.formula || '';
			for (const [key, val] of Object.entries(vars)) {
				expr = expr.replaceAll(`{${key}}`, String(val));
			}
			correctAnswer = Function('"use strict"; return (' + expr + ')')();
		} catch { correctAnswer = 0; }
	});

	// Build display text with variables substituted
	let displayText = $derived(() => {
		let text = data.displayTemplate || data.formula || '';
		for (const [key, val] of Object.entries(vars)) {
			text = text.replaceAll(`{${key}}`, String(val));
		}
		return text;
	});

	function handleInput() {
		const num = parseFloat(userAnswer);
		if (!isNaN(num)) {
			const tolerance = data.tolerance || 0;
			const correct = Math.abs(num - correctAnswer) <= tolerance;
			onAnswer?.({ value: num, correct, expected: correctAnswer });
		}
	}
</script>

<div class="space-y-4">
	<div class="rounded-xl border border-white/10 bg-white/5 p-4 text-center" dir="ltr">
		<p class="text-lg font-mono font-bold text-blue-400">{displayText()}</p>
	</div>

	<div class="flex items-center justify-center gap-3">
		<span class="text-sm font-semibold text-white/70">الجواب:</span>
		<input
			type="number"
			step="any"
			bind:value={userAnswer}
			oninput={handleInput}
			{disabled}
			class="w-40 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center text-lg font-bold outline-none transition-all focus:border-blue-500 disabled:opacity-50"
			placeholder="؟"
			dir="ltr"
		/>
	</div>

	{#if showResult}
		<div class="mt-2 rounded-lg p-3 text-center text-sm font-bold {isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
			{isCorrect ? '✓ إجابة صحيحة!' : `✗ الجواب الصحيح: ${correctAnswer}`}
		</div>
	{/if}
</div>
