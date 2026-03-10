<script lang="ts">
	import {
		Folder,
		FolderOpen,
		MoreVertical,
		Plus,
		Edit,
		Trash2,
		Save,
		X,
		CornerDownLeft
	} from 'lucide-svelte';

	let { data } = $props();

	// We use the flat map for quick lookups and building the reactive state
	let categories = $state<any[]>(data.tree || []);
	let flatCategories = $state<any[]>(data.categories || []);

	let isAdding = $state(false);
	let newCatName = $state('');
	let newCatDesc = $state('');
	let addingUnderParent = $state<number | null>(null);

	let editingCat = $state<number | null>(null);
	let editName = $state('');
	let editDesc = $state('');

	// Toggle expanded state of folders
	let expanded = $state<Record<number, boolean>>({});

	// Reload data helper
	async function reload() {
		const res = await fetch('/api/admin/question-categories');
		const json = await res.json();
		if (json.success) {
			categories = json.tree;
			flatCategories = json.categories;
		}
	}

	async function saveNew() {
		if (!newCatName.trim()) return;

		const response = await fetch('/api/admin/question-categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: newCatName,
				description: newCatDesc,
				parentId: addingUnderParent
			})
		});

		if (response.ok) {
			isAdding = false;
			newCatName = '';
			newCatDesc = '';
			if (addingUnderParent) {
				expanded[addingUnderParent] = true; // Auto-expand where added
			}
			await reload();
		}
	}

	async function saveEdit(id: number, parentId: number | null) {
		if (!editName.trim()) return;

		const response = await fetch(`/api/admin/question-categories/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: editName,
				description: editDesc,
				parentId // Keeping same parent for now
			})
		});

		if (response.ok) {
			editingCat = null;
			await reload();
		}
	}

	async function deleteCat(id: number) {
		if (!confirm('Are you sure you want to delete this category?')) return;

		const response = await fetch(`/api/admin/question-categories/${id}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			await reload();
		} else {
			const json = await response.json();
			alert('لا يمكن حذف هذا التصنيف: ' + (json.error || ''));
		}
	}

	function startEdit(cat: any) {
		editingCat = cat.id;
		editName = cat.name;
		editDesc = cat.description || '';
	}

	function toggleExpand(id: number) {
		expanded[id] = !expanded[id];
	}
</script>

<div class="font-cairo px-4 py-6 md:px-8" dir="rtl">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">تصنيفات الأسئلة (Categories)</h1>
			<p class="mt-2 text-sm text-white/60">
				إدارة شجرة مجلدات الأسئلة، مشابهة لنظام Moodle لتنظيم بنك الأسئلة الشامل.
			</p>
		</div>
		<button
			onclick={() => {
				isAdding = true;
				addingUnderParent = null;
			}}
			class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-black transition-colors"
		>
			<Plus size={20} />
			إضافة تصنيف رئيسي
		</button>
	</div>

	{#if isAdding && addingUnderParent === null}
		<div class="mb-6 flex items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4">
			<input
				type="text"
				bind:value={newCatName}
				placeholder="اسم التصنيف"
				class="focus:border-primary w-1/3 rounded-lg border border-white/10 bg-[#0f172a] p-2 text-white outline-none"
			/>
			<input
				type="text"
				bind:value={newCatDesc}
				placeholder="الوصف (اختياري)"
				class="focus:border-primary w-1/2 rounded-lg border border-white/10 bg-[#0f172a] p-2 text-white outline-none"
			/>
			<button
				onclick={saveNew}
				class="bg-primary hover:bg-primary/80 rounded-lg px-4 py-2 font-bold text-black">حفظ</button
			>
			<button
				onclick={() => (isAdding = false)}
				class="rounded-lg px-4 py-2 text-white/50 hover:bg-white/10">إلغاء</button
			>
		</div>
	{/if}

	<div class="rounded-xl border border-white/10 bg-white/5 p-6">
		{#if categories.length === 0}
			<div class="py-10 text-center text-white/50">
				لا توجد تصنيفات بعد. أضف أول تصنيف رئيسي لترتيب بنك الأسئلة.
			</div>
		{:else}
			{#snippet renderCategory(cat: any, depth: number)}
				<div class="mb-1 flex flex-col select-none">
					<div
						class="group flex items-center rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
						style="margin-right: {depth * 2}rem;"
					>
						<button onclick={() => toggleExpand(cat.id)} class="text-primary mr-2 hover:text-white">
							{#if cat.children && cat.children.length > 0}
								{#if expanded[cat.id]}
									<FolderOpen size={20} fill="#6ee7b7" stroke="black" />
								{:else}
									<Folder size={20} fill="#6ee7b7" stroke="black" />
								{/if}
							{:else}
								<Folder size={20} class="text-white/30" />
							{/if}
						</button>

						{#if editingCat === cat.id}
							<div class="mr-2 flex flex-1 items-center gap-2">
								<input
									type="text"
									bind:value={editName}
									class="focus:border-primary rounded border border-white/20 bg-black/50 p-1 text-sm text-white"
								/>
								<input
									type="text"
									bind:value={editDesc}
									placeholder="الوصف..."
									class="focus:border-primary w-48 rounded border border-white/20 bg-black/50 p-1 text-sm text-white"
								/>
								<button
									onclick={() => saveEdit(cat.id, cat.parentId)}
									class="text-green-400 hover:text-green-300"><Save size={18} /></button
								>
								<button onclick={() => (editingCat = null)} class="text-red-400 hover:text-red-300"
									><X size={18} /></button
								>
							</div>
						{:else}
							<div
								class="mr-2 flex flex-1 cursor-pointer flex-col justify-center"
								onclick={() => toggleExpand(cat.id)}
								role="presentation"
							>
								<span class="font-medium text-white">{cat.name}</span>
								{#if cat.description}
									<span class="mt-0.5 text-xs text-white/40">{cat.description}</span>
								{/if}
							</div>
						{/if}

						<div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
							<button
								onclick={() => {
									isAdding = true;
									addingUnderParent = cat.id;
									newCatName = '';
									newCatDesc = '';
									expanded[cat.id] = true;
								}}
								class="text-primary hover:bg-primary/20 rounded p-1.5"
								title="إضافة تصنيف فرعي"
							>
								<Plus size={16} />
							</button>
							<button
								onclick={() => startEdit(cat)}
								class="rounded p-1.5 text-blue-400 hover:bg-blue-400/20"
								title="تعديل اسم التصنيف"
							>
								<Edit size={16} />
							</button>
							<button
								onclick={() => deleteCat(cat.id)}
								class="rounded p-1.5 text-red-400 hover:bg-red-400/20"
								title="حذف"
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>

					{#if isAdding && addingUnderParent === cat.id}
						<div
							class="border-primary mt-1 mb-2 flex items-center gap-4 rounded-lg border-l-2 bg-white/5 px-4 py-2"
							style="margin-right: {(depth + 1) * 2}rem;"
						>
							<CornerDownLeft class="text-primary" size={16} />
							<input
								type="text"
								bind:value={newCatName}
								placeholder="اسم التصنيف الفرعي"
								class="focus:border-primary w-48 rounded border border-white/10 bg-[#0f172a] p-1.5 text-sm text-white outline-none"
							/>
							<input
								type="text"
								bind:value={newCatDesc}
								placeholder="الوصف"
								class="focus:border-primary flex-1 rounded border border-white/10 bg-[#0f172a] p-1.5 text-sm text-white outline-none"
							/>
							<button
								onclick={saveNew}
								class="bg-primary hover:bg-primary/80 rounded px-3 py-1.5 text-sm font-bold text-black"
								>حفظ</button
							>
							<button
								onclick={() => {
									isAdding = false;
									addingUnderParent = null;
								}}
								class="rounded px-3 py-1.5 text-sm text-white/50 hover:bg-white/10">إلغاء</button
							>
						</div>
					{/if}

					{#if expanded[cat.id] && cat.children && cat.children.length > 0}
						{#each cat.children as child}
							{@render renderCategory(child, depth + 1)}
						{/each}
					{/if}
				</div>
			{/snippet}

			{#each categories as topcat}
				{@render renderCategory(topcat, 0)}
			{/each}
		{/if}
	</div>
</div>
