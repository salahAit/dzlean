// scripts/screenshot.js
import { firefox } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = path.join(process.cwd(), 'book', 'images');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

(async () => {
    const browser = await firefox.launch();
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: 'light',
    });
    const page = await context.newPage();

    console.log('Taking homepage screenshot...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, '01-homepage.png') });

    console.log('Logging into admin...');
    await page.goto('http://localhost:5173/admin/login');
    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin1234');
    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);

    console.log('Taking admin dashboard screenshot...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '02-admin-dashboard.png') });

    console.log('Taking admin documents screenshot...');
    await page.goto('http://localhost:5173/admin/documents');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '03-admin-documents.png') });

    // Open a modal
    try {
        const addBtn = page.getByRole('button', { name: /إضافة/i }).first();
        if (await addBtn.isVisible()) {
            await addBtn.click();
            await page.waitForTimeout(1000); // wait for animation
            await page.screenshot({ path: path.join(outDir, '04-admin-modal.png') });
        }
    } catch (e) {
        console.log('Could not open modal', e);
    }

    // Go to subject page
    console.log('Taking subject page screenshot...');
    await page.goto('http://localhost:5173/moyen/1am/math'); // Typical subject
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, '05-subject.png') });

    // Go to document viewer (via modal)
    console.log('Taking document viewer screenshot...');
    // Click the first 'الموضوع' button on the page
    const docBtn = page.getByRole('button', { name: /الموضوع/ }).first();
    await docBtn.click();
    await page.waitForTimeout(3000); // Let modal and PDF load
    await page.screenshot({ path: path.join(outDir, '06-document-viewer.png') });

    // Back to admin
    console.log('Taking levels management screenshot...');
    await page.goto('http://localhost:5173/admin/levels');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(outDir, '07-admin-levels.png') });

    await browser.close();
    console.log('Done!');
})();
