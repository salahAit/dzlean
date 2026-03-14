<script lang="ts">
	let { data, onAnswer }: { data: any; onAnswer: (answer: any) => void } = $props();
	let answer = $state('');

	function handleInput() {
		onAnswer({ text: answer.trim() });
	}
</script>

<div class="space-y-4">
	<div
		class="border-border bg-secondary/50 rounded-2xl border-2 p-6 dark:border-white/10 dark:bg-white/5"
	>
		<textarea
			bind:value={answer}
			oninput={handleInput}
			placeholder="اكتب إجابتك هنا..."
			rows="3"
			maxlength="500"
			class="bg-muted w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
		></textarea>
		<p class="text-muted-foreground mt-2 text-xs">{answer.length}/500 حرف</p>
	</div>
</div>
