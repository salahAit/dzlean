<script lang="ts">
	import { page } from '$app/stores';
	import QuizPlayer from '$lib/modules/QuizBuilder/components/player/QuizPlayer.svelte';
	import ShareModal from '$lib/components/ShareModal.svelte';
	
	let { data } = $props();
	let quiz = $derived(data.quiz);
	let questions = $derived(data.questions || []);
	
	let isShareModalOpen = $state(false);

	async function handleSubmit(payload: any) {
		try {
			await fetch(`/api/quizzes/${quiz.id}/submit`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} catch (err) {
			console.error('Failed to submit quiz attempt:', err);
		}
	}
</script>

<svelte:head>
	<title>{quiz.titleAr || quiz.title} - SujetStore</title>
</svelte:head>

<!-- We apply the QuizPlayer as a completely standalone playback component -->
<QuizPlayer 
	{quiz} 
	rawQuestions={questions} 
	onSubmit={handleSubmit} 
	onShare={() => isShareModalOpen = true} 
/>

<ShareModal bind:isOpen={isShareModalOpen} title={quiz.titleAr || quiz.title} url={$page.url.href} />
