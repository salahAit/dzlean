<script lang="ts">
	import { Save, ExternalLink } from 'lucide-svelte';
	import MCQForm from './forms/MCQForm.svelte';
	import TrueFalseForm from './forms/TrueFalseForm.svelte';
	import OrderingForm from './forms/OrderingForm.svelte';
	import DragDropForm from './forms/DragDropForm.svelte';
	import MatchingForm from './forms/MatchingForm.svelte';
	import FillBlankForm from './forms/FillBlankForm.svelte';
	import ShortAnswerForm from './forms/ShortAnswerForm.svelte';
	import ClozeForm from './forms/ClozeForm.svelte';
	import CalculatedForm from './forms/CalculatedForm.svelte';
	import SentenceReorderForm from './forms/SentenceReorderForm.svelte';
	import HotspotForm from './forms/HotspotForm.svelte';
	import DragToImageForm from './forms/DragToImageForm.svelte';
	import MatrixForm from './forms/MatrixForm.svelte';
	import EssayForm from './forms/EssayForm.svelte';

	let { question = $bindable(), onSave, onCancel } = $props();

	function handleSave() {
		// Basic validation could go here
		onSave(question);
	}
</script>

<div class="space-y-6">
	<!-- Common Fields (Text, Points, Explanation) -->
	<div class="grid gap-6 md:grid-cols-2">
		<div class="space-y-2">
			<label class="text-sm font-semibold text-foreground/80">نص السؤال (عربي) *</label>
			<textarea
				bind:value={question.questionTextAr}
				rows="3"
				placeholder="مثال: اختر الإجابة الصحيحة..."
				class="w-full rounded-xl border border-border bg-background p-3 text-right text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			></textarea>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-semibold text-foreground/80">Question Text (EN/FR) - اختياري</label>
			<textarea
				bind:value={question.questionText}
				rows="3"
				dir="ltr"
				class="w-full rounded-xl border border-border bg-background p-3 text-left text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			></textarea>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<div class="space-y-2">
			<label class="text-sm font-semibold text-foreground/80">النقاط (Points)</label>
			<input
				type="number"
				bind:value={question.points}
				min="1"
				class="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			/>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-semibold text-foreground/80">شرح الإجابة (يظهر بعد الحل)</label>
			<textarea
				bind:value={question.explanation}
				rows="1"
				placeholder="شرح إضافي لتوضيح سبب الإجابة..."
				class="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
			></textarea>
		</div>
	</div>

	<hr class="border-border" />

	<!-- Dynamic Form Area specific to Question Type -->
	<div class="rounded-xl border border-border bg-background p-4">
		<h3 class="mb-4 text-sm font-bold text-blue-400">بيانات السؤال ({question.type})</h3>

		{#if question.type === 'mcq'}
			<MCQForm bind:data={question.questionData} />
		{:else if question.type === 'true_false'}
			<TrueFalseForm bind:data={question.questionData} />
		{:else if question.type === 'ordering'}
			<OrderingForm bind:data={question.questionData} />
		{:else if question.type === 'drag_drop'}
			<DragDropForm bind:data={question.questionData} />
		{:else if question.type === 'matching'}
			<MatchingForm bind:data={question.questionData} />
		{:else if question.type === 'fill_blank'}
			<FillBlankForm bind:data={question.questionData} />
		{:else if question.type === 'short_answer'}
			<ShortAnswerForm bind:data={question.questionData} />
		{:else if question.type === 'cloze'}
			<ClozeForm bind:data={question.questionData} />
		{:else if question.type === 'calculated'}
			<CalculatedForm bind:data={question.questionData} />
		{:else if question.type === 'sentence_reorder'}
			<SentenceReorderForm bind:data={question.questionData} />
		{:else if question.type === 'hotspot'}
			<HotspotForm bind:data={question.questionData} />
		{:else if question.type === 'drag_to_image'}
			<DragToImageForm bind:data={question.questionData} />
		{:else if question.type === 'matrix'}
			<MatrixForm bind:data={question.questionData} />
		{:else if question.type === 'essay'}
			<EssayForm bind:data={question.questionData} />
		{:else}
			<p class="text-sm text-muted-foreground">نوع غير مدعوم ({question.type})</p>
		{/if}
	</div>

	<!-- Actions -->
	<div class="flex justify-end gap-4 pt-4">
		<button
			onclick={onCancel}
			class="rounded-xl px-6 py-2 text-sm font-bold text-foreground/80 transition-colors hover:bg-muted hover:text-white"
		>
			إلغاء
		</button>
		<button
			onclick={handleSave}
			disabled={!question.questionTextAr}
			class="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2 text-sm font-bold text-foreground shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-50"
		>
			<Save size={18} /> حفظ السؤال
		</button>
	</div>
</div>
