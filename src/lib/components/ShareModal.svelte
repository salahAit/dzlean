<script lang="ts">
	import { X, Copy, Check, Facebook, Send, MessageCircle, Share2 } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	let {
		isOpen = $bindable(false),
		url = '',
		title = 'شارك هذا التمرين'
	} = $props<{
		isOpen: boolean;
		url: string;
		title?: string;
	}>();

	let copied = $state(false);

	const shareOptions = $derived([
		{
			name: 'واتساب',
			icon: MessageCircle,
			color: 'bg-[#25D366]',
			link: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n\n' + url)}`
		},
		{
			name: 'فيسبوك',
			icon: Facebook,
			color: 'bg-[#1877F2]',
			link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
		},
		{
			name: 'تليجرام',
			icon: Send,
			color: 'bg-[#0088cc]',
			link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
		},
		{
			name: 'إكس (تويتر)',
			icon: Share2,
			color: 'bg-[#000000]',
			link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
		}
	]);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 bg-black/60" onclick={() => (isOpen = false)}></div>

		<div
			class="glass-card relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl dark:bg-black/20"
			transition:fly={{ y: 20, duration: 300 }}
			dir="rtl"
		>
			<!-- Close Button -->
			<button
				onclick={() => (isOpen = false)}
				class="text-muted-foreground hover:text-foreground absolute top-4 left-4 h-10 w-10 rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
			>
				<X size={20} class="mx-auto" />
			</button>

			<div class="mt-4 text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500"
				>
					<Share2 size={32} />
				</div>
				<h3 class="text-xl font-extrabold">{title}</h3>
				<p class="text-muted-foreground mt-1 text-sm">اختر المنصة التي تود المشاركة عبرها</p>
			</div>

			<!-- Share Grid -->
			<div class="mt-8 grid grid-cols-4 gap-4">
				{#each shareOptions as option}
					<a
						href={option.link}
						target="_blank"
						rel="noopener noreferrer"
						class="flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg {option.color}"
						>
							<option.icon size={22} />
						</div>
						<span class="text-xs font-medium">{option.name}</span>
					</a>
				{/each}
			</div>

			<!-- Link Copy Section -->
			<div class="mt-8">
				<label
					for="share-url"
					class="text-muted-foreground mb-2 block text-xs font-bold tracking-wider uppercase"
				>
					أو انسخ الرابط المباشر
				</label>
				<div
					class="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/5 p-2 dark:bg-white/5"
				>
					<div class="flex-1 overflow-hidden px-2">
						<p id="share-url" class="truncate text-sm font-medium opacity-60">
							{url}
						</p>
					</div>
					<button
						onclick={copyToClipboard}
						class="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all {copied
							? 'bg-emerald-500 text-white'
							: 'bg-white/10 hover:bg-white/20'}"
					>
						{#if copied}
							<Check size={16} />
							تم!
						{:else}
							<Copy size={16} />
							نسخ
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.glass-card {
		background: rgba(var(--card-bg), 0.7);
		backdrop-filter: blur(20px);
	}
</style>
