<script lang="ts">
	import { onMount } from 'svelte';
	import { Download, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	// ------------------------------------------------------------------------
	// State for the prompt
	let deferredPrompt: any = $state(null);
	let showPrompt = $state(false);
	// Browser detection flags
	let isFirefox = $state(false);
	let isIOS = $state(false);
	let isUnsupportedBrowser = $state(false);

	onMount(() => {
		// 1. Detect Browser to show alternative instructions
		const userAgent = window.navigator.userAgent.toLowerCase();
		isFirefox = userAgent.includes('firefox');
		isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		
		isUnsupportedBrowser = isFirefox || isIOS;

		// 2. Listen for the native install prompt event (Chrome/Edge/Android)
		window.addEventListener('beforeinstallprompt', (e) => {
			// Do NOT use e.preventDefault() so the native browser button in the address bar STILL shows up!
			deferredPrompt = e;
			
			// If we got the event, it's definitely supported, override flags
			isUnsupportedBrowser = false;
			
			const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
			if (!isDismissed) {
				showPrompt = true;
			}
		});

		// 3. Fallback for Firefox/Safari: 
		// Since they don't fire `beforeinstallprompt`, we check if it's already installed (standalone mode)
		// If not, and it hasn't been dismissed, we show the manual prompt.
		if (isUnsupportedBrowser) {
			const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
			const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
			
			if (!isStandalone && !isDismissed) {
				// Delay slightly to not interrupt immediate page load
				setTimeout(() => {
					showPrompt = true;
				}, 4000);
			}
		}

		// 4. Listen for successful installation
		window.addEventListener('appinstalled', () => {
			
			// If we got the event, it's definitely supported, override flags
			isUnsupportedBrowser = false;
			
			const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
			if (!isDismissed) {
				showPrompt = true;
			}
		});

		// 3. Fallback for Firefox/Safari: 
		// Since they don't fire `beforeinstallprompt`, we check if it's already installed (standalone mode)
		// If not, and it hasn't been dismissed, we show the manual prompt.
		if (isUnsupportedBrowser) {
			const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
			const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
			
			if (!isStandalone && !isDismissed) {
				// Delay slightly to not interrupt immediate page load
				setTimeout(() => {
					showPrompt = true;
				}, 4000);
			}
		}

		// 4. Listen for successful installation
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
			showPrompt = false;
			localStorage.setItem('pwa_prompt_dismissed', 'true');
			console.log('PWA was installed successfully');
		});

		// DEBUG: Force show the prompt UI if ?debug_pwa=true is in the URL
		if (window.location.search.includes('debug_pwa=true')) {
			showPrompt = true;
		}
	});

	async function installApp() {
		if (deferredPrompt) {
			
			// Native Install (Chrome/Edge)
			showPrompt = false;
			deferredPrompt.prompt();
			
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`User response to the install prompt: ${outcome}`);
			
			deferredPrompt = null;
			if (outcome === 'accepted') {
			   localStorage.setItem('pwa_prompt_dismissed', 'true'); 
			}
		} else if (isUnsupportedBrowser) {
			// For Firefox/iOS, we can't trigger it programmatically. 
			// The UI itself will show instructions instead of an "Install" button doing magic.
			dismissPrompt(); // Just close it once they click "got it"
		} else {
			// Fallback
			showPrompt = false;
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
