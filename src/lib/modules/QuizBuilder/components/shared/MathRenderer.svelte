<script lang="ts">
	import { marked } from 'marked';
	import markedKatex from 'marked-katex-extension';
	import 'katex/dist/katex.min.css';

	// We configure marked to use KaTeX.
	// We want to pass throwing false so it doesn't crash on bad math
	marked.use(
		markedKatex({
			throwOnError: false,
			output: 'html' // Best for SSR
		})
	);

	let { content = '' }: { content: string } = $props();

	// Render the markdown + math synchronously during SSR
	// It's safe since it's just pure string manipulation
	let renderedHtml = $derived(marked.parse(content || '') as string);
</script>

<div class="prose prose-sm md:prose-base prose-blue max-w-none dark:prose-invert">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html renderedHtml}
</div>

<style>
	/* Make sure the math flows naturally inline and vertically centers */
	:global(.katex-display) {
		margin: 1em 0;
		overflow-x: auto;
		overflow-y: hidden;
	}
	:global(.katex) {
		font-size: 1.1em;
	}
</style>
