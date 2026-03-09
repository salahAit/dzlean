<script lang="ts">
	import { Plus, Trash2, Edit, FileText, CheckCircle, ExternalLink, X, Eye } from 'lucide-svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { ActionData } from './$types';

	let { data, form } = $props<{ data: any; form: ActionData }>();

	let isCreateModalOpen = $state(false);

	let isEditModalOpen = $state(false);
	let editingItem: any = $state(null);

	let isDeleteModalOpen = $state(false);
	let deletingId = $state<number | null>(null);
	let deleteFormElement: HTMLFormElement;

	const typeLabels: Record<string, string> = {
		exam: 'اختبار',
		test: 'فرض',
		lesson: 'درس',
		summary: 'ملخص',
		exercise: 'تمرين',
		solution: 'حل'
	};

	function getYearSubjectLabel(id: number) {
		const ys = data.yearSubjects.find((y: any) => y.id === id);
		return ys ? `${ys.yearAr} - ${ys.subjectAr}` : 'غير معروف';
	}

	function openEdit(item: any) {
		editingItem = { ...item };
		isEditModalOpen = true;
	}

	function confirmDelete(id: number, formEl: HTMLFormElement) {
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
	<title>إدارة الوثائق - لوحة التحكم</title>
</svelte:head>

<div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
	<div>
		<h1 class="text-3xl font-bold">الوثائق التعليمية</h1>
		<p class="text-muted-foreground mt-2 text-sm">إدارة الفروض، الاختبارات، والدروس</p>
	</div>
	<button
		onclick={() => (isCreateModalOpen = true)}
		class="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-bold text-white transition-all hover:scale-105 hover:bg-emerald-600"
	>
		<Plus size={20} />
		إضافة وثيقة
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
					<th class="px-6 py-4 font-medium tracking-wider uppercase">العنوان</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">السنة والمادة</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">النوع</th>
					<th class="px-6 py-4 font-medium tracking-wider uppercase">الملفات</th>
					<th class="px-6 py-4 text-center font-medium tracking-wider uppercase">إجراءات</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/10">
				{#each data.documents as doc}
					{@const itemData = data.yearSubjects.find((y: any) => y.id === doc.yearSubjectId)}
					<tr class="transition-colors hover:bg-white/5">
						<td class="px-6 py-4 font-medium whitespace-nowrap text-white/70" dir="ltr">{doc.id}</td
						>
						<td class="max-w-[200px] truncate px-6 py-4 font-bold" title={doc.titleAr || doc.title}
							>{doc.titleAr || doc.title}</td
						>
						<td class="shrink-0 px-6 py-4 text-xs whitespace-nowrap text-white/80">
							{getYearSubjectLabel(doc.yearSubjectId)}
						</td>
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="rounded-full border px-2 py-1 text-xs badge-{doc.type}">
								{typeLabels[doc.type] || doc.type}
							</span>
						</td>
						<td class="px-6 py-4 text-xs whitespace-nowrap">
							<div class="flex flex-col gap-1">
								{#if doc.pdfUrl}
									<a
										href={doc.pdfUrl}
										target="_blank"
										class="flex items-center gap-1 text-blue-400 hover:text-blue-300"
									>
										<FileText size={12} /> الموضوع
									</a>
								{:else}
									<span class="text-white/30">- خطأ: لا يوجد ملف</span>
								{/if}

								{#if doc.hasSolution && doc.solutionUrl}
									<a
										href={doc.solutionUrl}
										target="_blank"
										class="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
									>
										<CheckCircle size={12} /> الحل متوفر
									</a>
								{/if}
							</div>
						</td>
						<td class="flex justify-center gap-3 px-6 py-4 whitespace-nowrap">
							<button
								onclick={() => openEdit(doc)}
								class="text-blue-400 transition-colors hover:text-blue-300"
								title="تعديل"
							>
								<Edit size={18} />
							</button>
							{#if doc.slug && itemData}
								<a
									href={`/${itemData.levelSlug}/${itemData.yearSlug}/${itemData.subjectSlug}/${doc.slug}`}
									target="_blank"
									class="text-emerald-400 transition-colors hover:text-emerald-300"
									title="معاينة بالموقع"
								>
									<Eye size={18} />
								</a>
							{/if}
							<form
								action="?/delete"
								method="POST"
								onsubmit={(e) => {
									e.preventDefault();
									confirmDelete(doc.id, e.currentTarget);
								}}
							>
								<input type="hidden" name="id" value={doc.id} />
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

				{#if data.documents.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-white/50">
							لا توجد وثائق تعليمية بعد
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
			class="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold">إضافة وثيقة جديدة</h2>
				<button class="text-white/50 hover:text-white" onclick={() => (isCreateModalOpen = false)}>
					<X size={20} />
				</button>
			</div>

			<form action="?/create" method="POST" class="space-y-4">
				<div>
					<label for="title" class="mb-1 block text-sm font-medium">عنوان الوثيقة</label>
					<input
						type="text"
						id="title"
						name="title"
						required
						class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						placeholder="اختبار الفصل الأول في الرياضيات الجيل الثاني"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="slug" class="mb-1 block text-sm font-medium">الرابط (Slug - إنجليزي)</label>
						<input
							type="text"
							id="slug"
							name="slug"
							required
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="math-exam-t1-2024"
						/>
					</div>
					<div>
						<label for="type" class="mb-1 block text-sm font-medium">نوع الوثيقة</label>
						<select
							id="type"
							name="type"
							required
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each Object.entries(typeLabels) as [key, label]}
								<option value={key}>{label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid flex-col gap-4 sm:grid-cols-2">
					<div>
						<label for="yearSubjectId" class="mb-1 block text-sm font-medium"
							>السنة الدراسية والمادة</label
						>
						<select
							id="yearSubjectId"
							name="yearSubjectId"
							required
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each data.yearSubjects as ys}
								<option value={ys.id}>{ys.yearAr} - {ys.subjectAr}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="trimesterId" class="mb-1 block text-sm font-medium">الفصل (اختياري)</label>
						<select
							id="trimesterId"
							name="trimesterId"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							<option value="">-- بدون فصل (درس عام) --</option>
							{#each data.trimesters as t}
								<option value={t.id}>{t.nameAr}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
					<div>
						<label for="pdfUrl" class="mb-1 block text-sm font-medium">رابط ملف الموضوع (PDF)</label
						>
						<input
							type="url"
							id="pdfUrl"
							name="pdfUrl"
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="/demo.pdf"
							value="/demo.pdf"
						/>
					</div>
					<div>
						<label for="solutionUrl" class="mb-1 block text-sm font-medium"
							>رابط ملف الحل (PDF - اختياري)</label
						>
						<input
							type="url"
							id="solutionUrl"
							name="solutionUrl"
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="/demo.pdf"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="academicYear" class="mb-1 block text-sm font-medium"
							>السنة الأكاديمية (اختياري)</label
						>
						<input
							type="text"
							id="academicYear"
							name="academicYear"
							dir="ltr"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="2024/2025"
						/>
					</div>
					<div>
						<label for="source" class="mb-1 block text-sm font-medium"
							>المصدر/المؤسسة (اختياري)</label
						>
						<input
							type="text"
							id="source"
							name="source"
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="متوسطة الأمير عبد القادر"
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
						class="flex-1 rounded-xl bg-emerald-500 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-emerald-600"
					>
						حفظ الوثيقة
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if isEditModalOpen && editingItem}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget) isEditModalOpen = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') isEditModalOpen = false;
		}}
		role="button"
		tabindex="0"
	>
		<div
			class="glass-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-emerald-500/20 p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold text-emerald-400">تعديل وثيقة</h2>
				<button class="text-white/50 hover:text-white" onclick={() => (isEditModalOpen = false)}>
					<X size={20} />
				</button>
			</div>

			<form action="?/update" method="POST" class="space-y-4">
				<input type="hidden" name="id" value={editingItem.id} />

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="edit_title" class="mb-1 block text-sm font-medium">العنوان كامل</label>
						<input
							type="text"
							id="edit_title"
							name="title"
							required
							bind:value={editingItem.title}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
							placeholder="اختبار الثلاثي الأول في الرياضيات"
						/>
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
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit_type" class="mb-1 block text-sm font-medium">نوع الوثيقة</label>
						<select
							id="edit_type"
							name="type"
							required
							bind:value={editingItem.type}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each Object.entries(typeLabels) as [key, label]}
								<option value={key}>{label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid flex-col gap-4 sm:grid-cols-2">
					<div>
						<label for="edit_yearSubjectId" class="mb-1 block text-sm font-medium"
							>السنة الدراسية والمادة</label
						>
						<select
							id="edit_yearSubjectId"
							name="yearSubjectId"
							required
							bind:value={editingItem.yearSubjectId}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							{#each data.yearSubjects as ys}
								<option value={ys.id}>{ys.yearAr} - {ys.subjectAr}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="edit_trimesterId" class="mb-1 block text-sm font-medium"
							>الفصل (اختياري)</label
						>
						<select
							id="edit_trimesterId"
							name="trimesterId"
							bind:value={editingItem.trimesterId}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none [&>option]:bg-[#0a0f1c]"
						>
							<option value="">-- بدون فصل (درس عام) --</option>
							{#each data.trimesters as t}
								<option value={t.id}>{t.nameAr}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
					<div>
						<label for="edit_pdfUrl" class="mb-1 block text-sm font-medium"
							>رابط ملف الموضوع (PDF)</label
						>
						<input
							type="url"
							id="edit_pdfUrl"
							name="pdfUrl"
							dir="ltr"
							bind:value={editingItem.pdfUrl}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit_solutionUrl" class="mb-1 block text-sm font-medium"
							>رابط ملف الحل (PDF - اختياري)</label
						>
						<input
							type="url"
							id="edit_solutionUrl"
							name="solutionUrl"
							dir="ltr"
							bind:value={editingItem.solutionUrl}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="edit_academicYear" class="mb-1 block text-sm font-medium"
							>السنة الأكاديمية (اختياري)</label
						>
						<input
							type="text"
							id="edit_academicYear"
							name="academicYear"
							dir="ltr"
							bind:value={editingItem.year}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
					<div>
						<label for="edit_source" class="mb-1 block text-sm font-medium"
							>المصدر/المؤسسة (اختياري)</label
						>
						<input
							type="text"
							id="edit_source"
							name="source"
							bind:value={editingItem.source}
							class="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
						/>
					</div>
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
						class="flex-1 rounded-xl bg-emerald-500 py-2.5 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-emerald-600"
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
	message="هل أنت متأكد من رغبتك في حذف هذه الوثيقة؟ لا يمكن استرجاع الوثيقة بعد الحذف."
/>
