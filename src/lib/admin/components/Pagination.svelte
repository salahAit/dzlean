<script lang="ts">
	import { ChevronRight, ChevronLeft } from 'lucide-svelte';

	let {
		totalItems,
		pageSize = 10,
		currentPage = $bindable(1)
	} = $props<{
		totalItems: number;
		pageSize?: number;
		currentPage: number;
	}>();

	let totalPages = $derived(Math.ceil(totalItems / pageSize) || 1);

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
</script>

{#if totalPages > 1}
	<div class="mt-4 flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
		<div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
			<div>
				<p class="text-sm text-muted-foreground">
					إظهار <span class="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> إلى
					<span class="font-bold text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> من أصل
					<span class="font-bold text-foreground">{totalItems}</span> نتيجة
				</p>
			</div>
			<div>
				<nav class="isolate inline-flex -space-x-px rounded-md shadow-sm rtl:space-x-reverse" aria-label="Pagination">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						class="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50"
						title="الصفحة السابقة"
					>
						<span class="sr-only">السابق</span>
						<ChevronRight class="h-5 w-5" aria-hidden="true" />
					</button>

					{#each Array(totalPages) as _, i}
						{@const pageNum = i + 1}
						<!-- Show first, last, current, and adjacent pages to current -->
						{#if pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
							<button
								onclick={() => goToPage(pageNum)}
								class="relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 {currentPage === pageNum ? 'z-10 bg-primary text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-foreground ring-1 ring-inset ring-border hover:bg-muted'}"
							>
								{pageNum}
							</button>
						{:else if (pageNum === currentPage - 2 && currentPage > 3) || (pageNum === currentPage + 2 && currentPage < totalPages - 2)}
							<span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-inset ring-border">...</span>
						{/if}
					{/each}

					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						class="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50"
						title="الصفحة التالية"
					>
						<span class="sr-only">التالي</span>
						<ChevronLeft class="h-5 w-5" aria-hidden="true" />
					</button>
				</nav>
			</div>
		</div>
		
		<!-- Mobile view -->
		<div class="flex flex-1 justify-between sm:hidden">
			<button
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				class="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
			>
				السابق
			</button>
			<span class="text-sm font-medium text-foreground self-center">
				{currentPage} / {totalPages}
			</span>
			<button
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
				class="relative inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
			>
				التالي
			</button>
		</div>
	</div>
{/if}
