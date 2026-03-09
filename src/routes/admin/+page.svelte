<script lang="ts">
	import { GraduationCap, CalendarDays, BookOpen, FileText } from 'lucide-svelte';

	let { data } = $props();

	let stats = $derived([
		{
			name: 'المراحل التعليمية',
			value: data.stats.levels,
			icon: GraduationCap,
			color: 'text-primary'
		},
		{
			name: 'السنوات الدراسية',
			value: data.stats.years,
			icon: CalendarDays,
			color: 'text-blue-500'
		},
		{
			name: 'المواد الدراسية',
			value: data.stats.subjects,
			icon: BookOpen,
			color: 'text-purple-500'
		},
		{
			name: 'إجمالي الوثائق',
			value: data.stats.documents,
			icon: FileText,
			color: 'text-emerald-500'
		}
	]);
</script>

<svelte:head>
	<title>الرئيسية - لوحة التحكم</title>
</svelte:head>

<div class="mb-8">
	<h1 class="text-3xl font-bold">لوحة التحكم</h1>
	<p class="text-muted-foreground mt-2">مرحباً بك في لوحة تحكم منصة SujetStore</p>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
	{#each stats as stat}
		<div class="glass-card rounded-2xl border border-white/10 p-6 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-muted-foreground text-sm font-medium">{stat.name}</p>
					<p class="mt-2 text-3xl font-bold">{stat.value}</p>
				</div>
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 {stat.color}">
					<stat.icon size={24} />
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- Quick Actions -->
<div class="mt-12">
	<h2 class="mb-6 text-xl font-bold">إجراءات سريعة</h2>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<a
			href="/admin/documents"
			class="group glass-card flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:bg-white/5"
		>
			<div class="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
				<FileText size={20} />
			</div>
			<div>
				<h3 class="group-hover:text-primary font-bold transition-colors">إدارة الوثائق</h3>
				<p class="text-muted-foreground text-xs">إضافة أو تعديل الفروض والاختبارات</p>
			</div>
		</a>
		<a
			href="/admin/subjects"
			class="group glass-card flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:bg-white/5"
		>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-500"
			>
				<BookOpen size={20} />
			</div>
			<div>
				<h3 class="font-bold transition-colors group-hover:text-purple-500">إدارة المواد</h3>
				<p class="text-muted-foreground text-xs">إضافة أو تعديل المواد الدراسية</p>
			</div>
		</a>
		<a
			href="/admin/years"
			class="group glass-card flex items-center gap-4 rounded-xl border border-white/10 p-4 transition-all hover:bg-white/5"
		>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-500"
			>
				<CalendarDays size={20} />
			</div>
			<div>
				<h3 class="font-bold transition-colors group-hover:text-blue-500">إدارة السنوات</h3>
				<p class="text-muted-foreground text-xs">تعديل الأطوار والسنوات المتاحة</p>
			</div>
		</a>
	</div>
</div>
