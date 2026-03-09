<script lang="ts">
	import { AlertTriangle, X } from 'lucide-svelte';

	let {
		isOpen = $bindable(false),
		title = 'تأكيد الحذف',
		message = 'هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذه العملية.',
		confirmText = 'نعم، احذف',
		cancelText = 'إلغاء',
		onConfirm
	} = $props<{
		isOpen: boolean;
		title?: string;
		message?: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
	}>();

	function handleConfirm() {
		onConfirm();
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
		<div
			class="glass-card relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/20 p-6 shadow-2xl"
		>
			<!-- Decoration -->
			<div class="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-red-500/10 blur-2xl"></div>

			<div class="relative flex flex-col items-center text-center">
				<div
					class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-4 ring-red-500/5"
				>
					<AlertTriangle size={28} />
				</div>

				<h3 class="mb-2 text-xl font-bold text-white">{title}</h3>
				<p class="mb-6 text-sm text-white/70">{message}</p>

				<div class="flex w-full gap-3">
					<button
						onclick={() => (isOpen = false)}
						class="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-bold text-white transition-colors hover:bg-white/10"
					>
						{cancelText}
					</button>
					<button
						onclick={handleConfirm}
						class="flex-1 rounded-xl bg-red-500 py-2.5 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:bg-red-600"
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
