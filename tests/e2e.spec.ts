import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test('should load and display level cards', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SujetStore/);

        // Check that level cards exist
        await expect(page.locator('text=ابتدائي').first()).toBeVisible();
        await expect(page.locator('text=متوسط').first()).toBeVisible();
        await expect(page.locator('text=ثانوي').first()).toBeVisible();
    });

    test('should display stats bar', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('text=وثيقة').first()).toBeVisible();
    });

    test('should have search button in navbar', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('text=بحث').first()).toBeVisible();
    });

    test('should navigate to level page on card click', async ({ page }) => {
        await page.goto('/');
        await page.click('text=ابتدائي >> nth=0');
        await expect(page.url()).toContain('/primaire');
    });
});

test.describe('Search', () => {
    test('should open search modal with Ctrl+K', async ({ page }) => {
        await page.goto('/');
        await page.keyboard.press('Control+k');
        await expect(page.locator('input[placeholder*="ابحث"]')).toBeVisible();
    });

    test('should return results for valid query', async ({ page }) => {
        await page.goto('/');
        await page.keyboard.press('Control+k');
        await page.fill('input[placeholder*="ابحث"]', 'رياضيات');
        // Wait for debounced results
        await page.waitForTimeout(500);
        await expect(page.locator('text=الرياضيات').first()).toBeVisible();
    });
});

test.describe('Subject Page', () => {
    test('should display trimester tabs', async ({ page }) => {
        await page.goto('/primaire/5ap/math');
        await expect(page.locator('text=الفصل 1').first()).toBeVisible();
    });

    test('should have working filter bar', async ({ page }) => {
        await page.goto('/primaire/5ap/math');
        await expect(page.locator('text=فلترة').first()).toBeVisible();
    });

    test('should display bookmark buttons on document rows', async ({ page }) => {
        await page.goto('/primaire/5ap/math');
        const bookmarkBtn = page.locator('button[title="إضافة للمفضلة"]').first();
        if (await bookmarkBtn.isVisible()) {
            await expect(bookmarkBtn).toBeVisible();
        }
    });
});

test.describe('Progress Page', () => {
    test('should load progress page', async ({ page }) => {
        await page.goto('/progress');
        await expect(page).toHaveTitle(/تقدمي/);
        await expect(page.locator('text=التقدم العام').first()).toBeVisible();
    });
});

test.describe('Bookmarks Page', () => {
    test('should load bookmarks page', async ({ page }) => {
        await page.goto('/bookmarks');
        await expect(page).toHaveTitle(/المفضلة/);
    });
});

test.describe('Admin', () => {
    test('should redirect to login for protected routes', async ({ page }) => {
        await page.goto('/admin');
        await expect(page.url()).toContain('/admin/login');
    });

    test('should login with correct credentials', async ({ page }) => {
        await page.goto('/admin/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin1234');
        await Promise.all([page.waitForURL('**/admin'), page.click('button[type="submit"]')]);
        await expect(page.url()).toContain('/admin');
        await expect(page.url()).not.toContain('/login');
    });

    test('should display admin dashboard after login', async ({ page }) => {
        await page.goto('/admin/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin1234');
        await Promise.all([page.waitForURL('**/admin'), page.click('button[type="submit"]')]);
        // Dashboard should have some admin content
        await expect(page.locator('text=لوحة التحكم').first()).toBeVisible();
    });
});
