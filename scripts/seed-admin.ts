import { usersDatabase, userSchema } from '../src/lib/server/db/index';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
    console.log('🛡️  Creating admin user...');

    const username = 'admin';
    const email = 'admin@sujetstore.com';
    const passwordStr = 'admin1234';

    // Check if admin already exists
    const existingAdmin = await usersDatabase
        .select()
        .from(userSchema.users)
        .where(eq(userSchema.users.username, username))
        .get();

    if (existingAdmin) {
        console.log('⚠️ Admin user already exists. Skipping.');
        return;
    }

    const passwordHash = await bcrypt.hash(passwordStr, 10);

    await usersDatabase.insert(userSchema.users).values({
        username,
        email,
        passwordHash,
        name: 'المدير العام',
        role: 'admin',
        isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log(`Username: ${username}`);
    console.log(`Password: ${passwordStr}`);
    console.log('-----------------------------------');
}

seedAdmin().catch((err) => {
    console.error('❌ Failed to create admin user:', err);
    process.exit(1);
});
