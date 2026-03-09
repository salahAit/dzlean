import re

with open('src/routes/[level]/[year]/[subject]/+page.svelte', 'r') as f:
    content = f.read()

script_target = """
// Modal State
let selectedDoc = $state<any>(null);
let activeTab = $state<'exam' | 'solution'>('exam');
let isFullscreen = $state(false);

// Track visited docs
let visitedDocs = $state<Set<string>>(new Set());
"""

script_replacement = """
// Modal State
let selectedDoc = $state<any>(null);
let activeTab = $state<'exam' | 'solution'>('exam');
let isFullscreen = $state(false);

let activeTrimesterTab = $state<string | 'general'>('general');

$effect(() => {
if (data) {
const hasCurrentTabDocs = activeTrimesterTab === 'general' 
? getGeneralDocs().length > 0 
: getDocsByTrimester(activeTrimesterTab).length > 0;

if (!hasCurrentTabDocs) {
const firstTrimWithDocs = data.trimesters.find((t: any) => getDocsByTrimester(t.id).length > 0);
if (firstTrimWithDocs) {
activeTrimesterTab = firstTrimWithDocs.id;
} else if (getGeneralDocs().length > 0) {
activeTrimesterTab = 'general';
}
}
}
});

// Track visited docs
let visitedDocs = $state<Set<string>>(new Set());
"""

content = content.replace(script_target.strip(), script_replacement.strip())

# We need to replace the Document Content section completely.
# Let's find the section from <!-- Documents Content --> to the start of <!-- Fullscreen Modal Viewer -->

start_idx = content.find("<!-- Documents Content -->")
end_idx = content.find("<!-- Fullscreen Modal Viewer -->")

html_replacement = """
<!-- Documents Content -->
<section class="py-10 lg:py-14">
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

{#if data.documents.length === 0}
<div class="text-muted-foreground flex flex-col items-center py-16 text-center">
<Inbox size={48} class="mb-4 opacity-50" />
<h3 class="mb-2 text-xl font-bold">لا توجد وثائق بعد</h3>
<p>سيتم إضافة فروض واختبارات قريباً لهذه المادة</p>
</div>
{:else}
<!-- Tabs Navigation -->
<div class="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
{#each data.trimesters as trimester}
{@const docsCount = getDocsByTrimester(trimester.id).length}
{#if docsCount > 0}
<button
onclick={() => activeTrimesterTab = trimester.id}
class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all {activeTrimesterTab === trimester.id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}"
>
{trimester.name_ar}
<span class="flex h-5 items-center justify-center rounded-full bg-black/20 px-2 text-[10px]">{docsCount}</span>
</button>
{/if}
{/each}

{@const generalDocsCount = getGeneralDocs().length}
{#if generalDocsCount > 0}
<button
onclick={() => activeTrimesterTab = 'general'}
class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all {activeTrimesterTab === 'general' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}"
>
دروس وملخصات
<span class="flex h-5 items-center justify-center rounded-full bg-black/20 px-2 text-[10px]">{generalDocsCount}</span>
</button>
{/if}
</div>

<!-- Active Tab Content -->
<div class="flex flex-col gap-3">
{#if activeTrimesterTab === 'general'}
{#each getGeneralDocs() as doc}
{@render docRow(doc, '#10b981')}
{/each}
{:else}
{#each getDocsByTrimester(activeTrimesterTab) as doc}
{@render docRow(doc, data.subject.color)}
{/each}
{/if}
</div>
{/if}

</div>
</section>

{#snippet docRow(doc: any, accentColor: string)}
<div class="glass-card group flex flex-col justify-between gap-4 border-r-4 p-4 transition-all duration-300 hover:bg-white/5 sm:flex-row sm:items-center" style="border-right-color: {accentColor}">
<div class="flex min-w-0 flex-1 items-center gap-4">
<div class="text-primary/70 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
{#if doc.type === 'exam'}
<FileText size={24} />
{:else if doc.type === 'test'}
<FileEdit size={24} />
{:else if doc.type === 'lesson'}
<BookOpen size={24} />
{:else if doc.type === 'summary'}
<Bookmark size={24} />
{:else if doc.type === 'exercise'}
<PenTool size={24} />
{:else if doc.type === 'solution'}
<CheckCircle size={24} />
{:else}
<FileText size={24} />
{/if}
</div>
<div class="min-w-0 flex-1">
<div class="mb-1.5 flex flex-wrap items-center gap-2">
<h3 class="truncate text-base font-bold sm:text-lg">
{doc.title_ar || doc.title}
</h3>
<span class="badge-{doc.type} shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium sm:text-xs">
{typeLabels[doc.type] || doc.type}
</span>
</div>

<div class="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
{#if doc.source}
<span class="flex items-center gap-1.5"><GraduationCap size={14} class="opacity-70" /> {doc.source}</span>
{/if}
{#if doc.academic_year}
<span class="flex items-center gap-1.5"><Calendar size={14} class="opacity-70" /> {doc.academic_year}</span>
{/if}
</div>
</div>
</div>

<div class="mx-auto flex w-full shrink-0 flex-col items-center gap-2 sm:ms-4 sm:w-auto sm:flex-row border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0">
<button
onclick={(e) => {
e.preventDefault();
openDoc(doc, 'exam');
}}
class="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 sm:w-auto sm:py-2"
>
<FileText size={16} /> الموضوع
</button>

{#if doc.has_solution}
<button
onclick={(e) => {
e.preventDefault();
openDoc(doc, 'solution');
}}
class="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 sm:w-auto sm:py-2"
>
<CheckCircle size={16} /> الحل
</button>
{/if}
</div>
</div>
{/snippet}

"""

new_content = content[:start_idx] + html_replacement + content[end_idx:]

with open('src/routes/[level]/[year]/[subject]/+page.svelte', 'w') as f:
    f.write(new_content)
