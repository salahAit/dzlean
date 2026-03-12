<script lang="ts">
	import { onMount } from 'svelte';
	import { Download, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	// The beforeinstallprompt event is fired by the browser when the app meets PWA installability criteria
	let deferredPrompt: any = $state(null);
	let showPrompt = $state(false);
	
	onMount(() => {
		// Only check if we haven't persistently dismissed it
		const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
		
		if (!isDismissed) {
			window.addEventListener('beforeinstallprompt', (e) => {
				// Prevent the mini-infobar from appearing on mobile
				e.preventDefault();
				
				// Stash the event so it can be triggered later.
				deferredPrompt = e;
				
				// Show our custom UI
				// Delay slightly so it doesn't immediately interrupt the user on page load
				setTimeout(() => {
					showPrompt = true;
				}, 3000);
			});
		}

		// Listen for successful installation
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
			showPrompt = false;
			// Don't ask again
			localStorage.setItem('pwa_prompt_dismissed', 'true');
			console.log('PWA was installed successfully');
		});
	});

	async function installApp() {
		if (deferredPrompt) {
			// Hide the custom prompt
			showPrompt = false;
			
			// Show the browser's native install prompt
			deferredPrompt.prompt();
			
			// Wait for the user to respond to the prompt
			const { outcome } = await deferredPrompt.userChoice;
			
			// Optionally, log or handle the user's choice...
			console.log(`User response to the install prompt: ${outcome}`);
			
			// We've used the prompt, and can't use it again until it's fired again
			deferredPrompt = null;
			
			if (outcome === 'accepted') {
			   localStorage.setItem('pwa_prompt_dismissed', 'true'); 
			}
		}
	}

	function dismissPrompt() {
		showPrompt = false;
		// Dismiss for this session, or persistently? Let's do persistently for now 
		// so we don't annoy them on every page load
		localStorage.setItem('pwa_prompt_dismissed', 'true');
	}
</script>

{#if showPrompt}
	<div 
		transition:slide={{ duration: 300 }}
		class="fixed bottom-0 sm:bottom-4 inset-x-0 mx-auto w-full sm:max-w-md z-50 p-4"
	>
		<div class="bg-card text-card-foreground border-border shadow-2xl rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden">
			<!-- Decorative Background Glow -->
			<div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

			<div class="flex items-start justify-between gap-4">
				<div class="flex items-center gap-4">
					<div class="bg-blue-500/10 text-blue-500 h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
						<Download size={24} />
					</div>
					<div>
						<h3 class="font-bold text-lg mb-1 leading-tight">تثبيت التطبيق</h3>
						<p class="text-xs text-muted-foreground mr-1">تجربة أسرع، تصفح بدون إنترنت لتمارينك المحفوظة.</p>
					</div>
				</div>
				<button 
					onclick={dismissPrompt}
					class="text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted p-1.5 rounded-full transition-colors shrink-0"
					aria-label="إغلاق التنبيه"
				>
					<X size={16} />
				</button>
			</div>

			<div class="flex gap-3 mt-1">
				<button 
					onclick={installApp}
					class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
				>
					تثبيت الآن
				</button>
				<button 
					onclick={dismissPrompt}
					class="flex-1 bg-muted hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-border"
				>
					ليس الآن
				</button>
			</div>
		</div>
	</div>
{/if}
