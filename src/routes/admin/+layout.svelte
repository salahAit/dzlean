<script lang="ts">
	import { page } from '$app/stores';
	import {
		LayoutDashboard,
		GraduationCap,
		CalendarDays,
		BookOpen,
		FileText,
		Brain,
		Database,
		LogOut,
		Menu,
		X
	} from 'lucide-svelte';

	let { data, children } = $props();

	let isMobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'الرئيسية', href: '/admin', icon: LayoutDashboard },
		{ name: 'المراحل التعليمية', href: '/admin/levels', icon: GraduationCap },
		{ name: 'السنوات الدراسية', href: '/admin/years', icon: CalendarDays },
		{ name: 'المواد الدراسية', href: '/admin/subjects', icon: BookOpen },
		{ name: 'التمارين التفاعلية', href: '/admin/quizzes', icon: Brain },
		{ name: 'بنك الأسئلة', href: '/admin/question-bank', icon: Database },
		{ name: 'الوثائق', href: '/admin/documents', icon: FileText }
	];
</script>

{#if $page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<div class="font-cairo flex min-h-screen bg-[#0a0f1c] text-white" dir="rtl">
		<!-- Mobile sidebar backdrop -->
		{#if isMobileMenuOpen}
			<div
				class="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
				onclick={() => (isMobileMenuOpen = false)}
				role="presentation"
			></div>
		{/if}

		<!-- Sidebar -->
		<aside
			class="fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-white/10 bg-[#0f172a] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 {isMobileMenuOpen
				? 'translate-x-0'
				: 'translate-x-full'}"
		>
			<!-- Sidebar Header -->
			<div class="flex h-16 items-center justify-between border-b border-white/10 px-6">
				<a href="/admin" class="text-primary flex items-center gap-2 text-xl font-bold">
					<img src="/logo.webp" alt="Logo" class="h-8 w-8" />
					SujetStore Admin
				</a>
				<button
					class="text-white/70 hover:text-white lg:hidden"
					onclick={() => (isMobileMenuOpen = false)}
				>
					<X size={24} />
				</button>
			</div>

			<!-- Navigation -->
			<nav class="flex-1 space-y-1 overflow-y-auto px-4 py-6">
				{#each navigation as item}
					{@const isActive =
						$page.url.pathname === item.href ||
						($page.url.pathname.startsWith(item.href) && item.href !== '/admin')}
					<a
						href={item.href}
						class="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all {isActive
							? 'bg-primary/10 text-primary border-primary/20 border'
							: 'border border-transparent text-white/70 hover:bg-white/5 hover:text-white'}"
					>
						<item.icon
							size={20}
							class={isActive ? 'text-primary' : 'text-white/50 group-hover:text-white'}
						/>
						{item.name}
					</a>
				{/each}
			</nav>

			<!-- User Menu & Logout -->
			<div class="border-t border-white/10 p-4">
				{#if data.user}
					<div class="mb-4 flex items-center gap-3 px-2">
						<div
							class="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full font-bold"
						>
							{data.user.name.charAt(0)}
						</div>
						<div class="overflow-hidden text-sm">
							<p class="truncate font-bold text-white">{data.user.name}</p>
							<p class="truncate text-white/50">{data.user.email}</p>
						</div>
					</div>
				{/if}
				<form action="/admin/logout" method="POST">
					<button
						type="submit"
						class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
					>
						<LogOut size={18} />
						تسجيل الخروج
					</button>
				</form>
			</div>
		</aside>

		<!-- Main Content -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Top header (Mobile only) -->
			<header class="flex h-16 items-center border-b border-white/10 bg-[#0f172a] px-4 lg:hidden">
				<button class="text-white/70 hover:text-white" onclick={() => (isMobileMenuOpen = true)}>
					<Menu size={24} />
				</button>
				<div class="text-primary flex-1 text-center font-bold">SujetStore Admin</div>
			</header>

			<!-- Main area -->
			<main class="flex-1 overflow-x-hidden overflow-y-auto bg-[#0a0f1c] p-4 sm:p-6 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
