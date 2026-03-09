<script lang="ts">
	import { User } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>تسجيل الدخول - لوحة التحكم</title>
</svelte:head>

<div class="font-cairo flex min-h-screen items-center justify-center bg-[#0a0f1c] px-4 text-white">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<div
				class="bg-primary/10 text-primary border-primary/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border"
			>
				<User size={32} />
			</div>
			<h1 class="text-3xl font-bold">لوحة التحكم</h1>
			<p class="text-muted-foreground mt-2 text-sm">أدخل بيانات الاعتماد للمتابعة</p>
		</div>

		<div class="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl">
			<form method="POST" class="space-y-5">
				<div>
					<label for="username" class="mb-2 block text-sm font-medium">اسم المستخدم</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						dir="ltr"
						class="focus:border-primary focus:ring-primary w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white transition-colors focus:ring-1 focus:outline-none"
						placeholder="admin"
					/>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium">كلمة المرور</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						dir="ltr"
						class="focus:border-primary focus:ring-primary w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white transition-colors focus:ring-1 focus:outline-none"
						placeholder="••••••••"
					/>
				</div>

				{#if form?.error}
					<div
						class="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500"
					>
						{form.message}
					</div>
				{/if}

				<button
					type="submit"
					class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-xl py-3 font-bold shadow-lg transition-all hover:scale-[1.02]"
				>
					تسجيل الدخول
				</button>
			</form>
		</div>

		<div class="mt-8 text-center text-sm text-white/40">
			&copy; {new Date().getFullYear()} SujetStore. جميع الحقوق محفوظة.
		</div>
	</div>
</div>
