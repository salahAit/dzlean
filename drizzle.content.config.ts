import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema-content.ts',
	out: './drizzle/migrations-content',
	dbCredentials: {
		url: './data/content.db'
	}
});
