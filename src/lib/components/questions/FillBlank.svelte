<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();

	let parts = $derived((data.sentence || '').split('___'));
	let answer = $state('');

	function handleInput() {
		onAnswer({ text: answer.trim() });
	}
</script>

<div class="space-y-6">
	<div class="rounded-2xl border-2 border-white/10 bg-white/5 p-6">
		<p class="text-lg leading-loose font-semibold" dir="rtl">
			{#each parts as part, i}
				<span>{part}</span>
				{#if i < parts.length - 1}
					<input
						bind:value={answer}
						oninput={handleInput}
						type="text"
						class="mx-1 inline-block w-32 rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/10 px-3 py-1 text-center text-blue-300 transition-colors outline-none focus:border-blue-500 focus:bg-blue-500/20"
						placeholder="..."
					/>
				{/if}
			{/each}
		</p>
	</div>
</div>
