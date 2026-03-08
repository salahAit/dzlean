import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			// السماح بالوصول لملفات قاعدة البيانات
			allow: ['.']
		}
	},
	// إعدادات التبعيات
	optimizeDeps: {
		// منع Vite من محاولة معالجة bun:sqlite
		exclude: ['bun:sqlite']
	},
	build: {
		rollupOptions: {
			// إخبار Rollup بأن bun:sqlite خارجية
			external: ['bun:sqlite']
		}
	}
});
