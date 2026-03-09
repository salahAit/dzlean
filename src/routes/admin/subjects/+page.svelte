<script lang="ts">
	import { Plus, Trash2, Edit, X } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { data, form } = $props<{ data: any; form: ActionData }>();

	let isCreateModalOpen = $state(false);
</script>

<svelte:head>
	<title>إدارة المواد الدراسية - لوحة التحكم</title>
</svelte:head>

<div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
	<div>
		<h1 class="text-3xl font-bold">المواد الدراسية</h1>
		<p class="text-muted-foreground mt-2 text-sm">إدارة المواد والفروع التعليمية المتاحة</p>
	</div>
	<button
		onclick={() => (isCreateModalOpen = true)}
		class="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 font-bold text-white transition-all hover:scale-105 hover:bg-purple-600"
	>
		<Plus size={20} />
		إضافة مادة دراسية
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
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الرابط (Slug)</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الأيقونة</th>
					<th class="px-6 py-4 text-center font-medium tracking-wider uppercase">إجراءات</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/10">
				{#each data.subjects as subject}
					<tr class="transition-colors hover:bg-white/5">
						<td class="px-6 py-4 font-medium whitespace-nowrap text-white/70" dir="ltr"
							>{subject.id}</td
						>
						<td class="px-6 py-4 font-bold whitespace-nowrap">{subject.nameAr}</td>
						<td class="px-6 py-4 whitespace-nowrap" dir="ltr">{subject.nameFr}</td>
						<td class="text-primary px-6 py-4 whitespace-nowrap" dir="ltr">{subject.slug}</td>
						<td class="px-6 py-4 text-xl whitespace-nowrap">{subject.icon || '-'}</td>
						<td class="flex justify-center gap-3 px-6 py-4 whitespace-nowrap">
							<button
								onclick={() => alert('ميزة التعديل قيد التطوير')}
								class="text-blue-400 transition-colors hover:text-blue-300"
								title="تعديل"
							>
								<Edit size={18} />
							</button>
							<form
								action="?/delete"
								method="POST"
								onsubmit={() => confirm('هل أنت متأكد من الحذف؟')}
							>
								<input type="hidden" name="id" value={subject.id} />
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

				{#if data.subjects.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-white/50">
							لا توجد مواد تعليمية بعد
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
				<h2 class="text-xl font-bold">إضافة مادة دراسية</h2>
				<button class="text-white/50 hover:text-white" onclick={() => (isCreateModalOpen = false)}>
					<X size={20} />
				</button>
			</div>

			<form action="?/create" method="POST" class="space-y-4">
				<div>
					<label for="id" class="mb-1 block text-sm font-medium">المعرف (ID - إنجليزي)</label>
					<input
						type="text"
						id="id"
						name="id"
						required
						dir="ltr"
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
						placeholder="math"
					/>
				</div>

				<div>
					<label for="name" class="mb-1 block text-sm font-medium">الاسم الكامل</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
						placeholder="الرياضيات"
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
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
							placeholder="رياضيات"
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
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
							placeholder="Mathématiques"
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
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
						placeholder="math"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="icon" class="mb-1 block text-sm font-medium">الأيقونة (Lucide)</label>
						<input
							type="text"
							id="icon"
							name="icon"
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
							placeholder="Calculator"
						/>
					</div>
					<div>
						<label for="color" class="mb-1 block text-sm font-medium">اللون (Hex/CSS)</label>
						<input
							type="text"
							id="color"
							name="color"
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
							placeholder="#a855f7"
						/>
					</div>
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
						class="flex-1 rounded-xl bg-purple-500 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-purple-600"
					>
						حفظ الإضافة
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
