<script lang="ts">
	import { Plus, Trash2, Edit, X } from 'lucide-svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { ActionData } from './$types';

	let { data, form } = $props<{ data: any; form: ActionData }>();

	let isCreateModalOpen = $state(false);

	let isEditModalOpen = $state(false);
	let editingItem: any = $state(null);

	let isDeleteModalOpen = $state(false);
	let deletingId = $state<string | null>(null);
	let deleteFormElement: HTMLFormElement;

	function openEdit(item: any) {
		editingItem = { ...item };
		isEditModalOpen = true;
	}

	function confirmDelete(id: string, formEl: HTMLFormElement) {
		deletingId = id;
		deleteFormElement = formEl;
		isDeleteModalOpen = true;
	}

	function performDelete() {
		if (deleteFormElement) {
			deleteFormElement.submit();
		}
	}
</script>

<svelte:head>
	<title>إدارة السنوات الدراسية - لوحة التحكم</title>
</svelte:head>

<div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
	<div>
		<h1 class="text-3xl font-bold">السنوات الدراسية</h1>
		<p class="text-muted-foreground mt-2 text-sm">إدارة السنوات والأطوار المدرسية</p>
	</div>
	<button
		onclick={() => (isCreateModalOpen = true)}
		class="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-bold text-white transition-all hover:scale-105 hover:bg-blue-600"
	>
		<Plus size={20} />
		إضافة سنة دراسية
	</button>
</div>

{#if form?.error}
	<div
		class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-500"
	>
		{form.message}
	</div>
{/if}

{#if form?.success}
	<div
		class="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-sm font-bold text-emerald-500"
	>
		تمت العملية بنجاح!
	</div>
{/if}

<div class="glass-card overflow-hidden rounded-2xl border border-white/10">
	<div class="overflow-x-auto">
		<table class="w-full text-right text-sm">
			<thead class="border-b border-white/10 bg-white/5 text-xs text-white/50">
				<tr>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">ID</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الاسم بالعربية</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الاسم بالفرنسية</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">المرحلة</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الرابط (Slug)</th>
					<th class="px-6 py-4 text-center font-medium tracking-wider uppercase">إجراءات</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/10">
				{#each data.years as year}
					<tr class="transition-colors hover:bg-white/5">
						<td class="px-6 py-4 font-medium whitespace-nowrap text-white/70" dir="ltr"
							>{year.id}</td
						>
						<td class="px-6 py-4 font-bold whitespace-nowrap">{year.nameAr}</td>
						<td class="px-6 py-4 whitespace-nowrap" dir="ltr">{year.nameFr}</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs"
								>{year.levelId}</span
							>
						</td>
						<td class="text-primary px-6 py-4 whitespace-nowrap" dir="ltr">{year.slug}</td>
						<td class="flex justify-center gap-3 px-6 py-4 whitespace-nowrap"> </td><td
							class="flex justify-center gap-3 px-6 py-4 whitespace-nowrap"
						>
							<button
								onclick={() => openEdit(year)}
								class="text-blue-400 transition-colors hover:text-blue-300"
								title="تعديل"
							>
								<Edit size={18} />
							</button>
							<form
								action="?/delete"
								method="POST"
								onsubmit={(e) => {
									e.preventDefault();
									confirmDelete(year.id, e.currentTarget);
								}}
							>
								<input type="hidden" name="id" value={year.id} />
								<button
									type="submit"
									class="text-red-400 transition-colors hover:text-red-300"
									title="حذف"
								>
									<Trash2 size={18} />
								</button>
							</form>
						</td>
					</tr>
				{/each}

				{#if data.years.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-white/50">
							لا توجد سنوات تعليمية بعد
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<!-- Create Modal -->
{#if isCreateModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget) isCreateModalOpen = false;
		}}
	>
		<div
			class="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold">إضافة سنة دراسية</h2>
				<button class="text-white/50 hover:text-white" onclick={() => (isCreateModalOpen = false)}>
					<X size={20} />
				</button>
			</div>

			<form action="?/create" method="POST" class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="id" class="mb-1 block text-sm font-medium">المعرف (ID - إنجليزي)</label>
						<input
							type="text"
							id="id"
							name="id"
							required
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							placeholder="1am"
						/>
					</div>
					<div>
						<label for="levelId" class="mb-1 block text-sm font-medium">المرحلة التعليمية</label>
						<select
							id="levelId"
							name="levelId"
							required
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each data.levels as level}
								<option value={level.id}>{level.nameAr}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="name" class="mb-1 block text-sm font-medium">الاسم الكامل</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="السنة الأولى متوسط"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="nameAr" class="mb-1 block text-sm font-medium">الاسم (عربي قصير)</label>
						<input
							type="text"
							id="nameAr"
							name="nameAr"
							required
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							placeholder="الأولى متوسط"
						/>
					</div>
					<div>
						<label for="nameFr" class="mb-1 block text-sm font-medium">الاسم (فرنسي)</label>
						<input
							type="text"
							id="nameFr"
							name="nameFr"
							required
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							placeholder="1AM"
						/>
					</div>
				</div>

				<div>
					<label for="slug" class="mb-1 block text-sm font-medium">الرابط (Slug)</label>
					<input
						type="text"
						id="slug"
						name="slug"
						required
						dir="ltr"
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="1am"
					/>
				</div>

				<div class="mt-8 flex gap-3">
					<button
						type="button"
						onclick={() => (isCreateModalOpen = false)}
						class="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-bold transition-colors hover:bg-white/10"
					>
						إلغاء
					</button>
					<button
						type="submit"
						class="flex-1 rounded-xl bg-blue-500 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-600"
					>
						حفظ الإضافة
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if isEditModalOpen && editingItem}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget) isEditModalOpen = false;
		}}
	>
		<div
			class="glass-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold text-blue-400">تعديل سنة دراسية</h2>
				<button class="text-white/50 hover:text-white" onclick={() => (isEditModalOpen = false)}>
					<X size={20} />
				</button>
			</div>

			<form action="?/update" method="POST" class="space-y-4">
				<input type="hidden" name="originalId" value={editingItem.id} />
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="edit_id" class="mb-1 block text-sm font-medium">المعرف (ID - إنجليزي)</label
						>
						<input
							type="text"
							id="edit_id"
							name="id"
							required
							dir="ltr"
							bind:value={editingItem.id}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit_levelId" class="mb-1 block text-sm font-medium"
							>المرحلة التعليمية</label
						>
						<select
							id="edit_levelId"
							name="levelId"
							required
							bind:value={editingItem.levelId}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each data.levels as level}
								<option value={level.id}>{level.nameAr}</option>
							{/each}
						</select>
					</div>
				</div>

				<div>
					<label for="edit_name" class="mb-1 block text-sm font-medium">الاسم الكامل</label>
					<input
						type="text"
						id="edit_name"
						name="name"
						required
						bind:value={editingItem.name}
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="edit_nameAr" class="mb-1 block text-sm font-medium">الاسم (عربي قصير)</label
						>
						<input
							type="text"
							id="edit_nameAr"
							name="nameAr"
							required
							bind:value={editingItem.nameAr}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit_nameFr" class="mb-1 block text-sm font-medium">الاسم (فرنسي)</label>
						<input
							type="text"
							id="edit_nameFr"
							name="nameFr"
							required
							dir="ltr"
							bind:value={editingItem.nameFr}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="edit_slug" class="mb-1 block text-sm font-medium">الرابط (Slug)</label>
					<input
						type="text"
						id="edit_slug"
						name="slug"
						required
						dir="ltr"
						bind:value={editingItem.slug}
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="mt-8 flex gap-3">
					<button
						type="button"
						onclick={() => (isEditModalOpen = false)}
						class="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-bold transition-colors hover:bg-white/10"
					>
						إلغاء
					</button>
					<button
						type="submit"
						class="flex-1 rounded-xl bg-blue-500 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-blue-600"
					>
						حفظ التعديلات
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<ConfirmModal
	bind:isOpen={isDeleteModalOpen}
	onConfirm={performDelete}
	title="تأكيد الحذف"
	message="هل أنت متأكد من رغبتك في حذف هذه السنة الدراسية؟ سيؤدي ذلك لنتائج غير متوقعة في حال وجود دروس أو وثائق مرتبطة بها."
/>
