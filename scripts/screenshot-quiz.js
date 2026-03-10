// scripts/screenshot-quiz.js
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

    console.log('Taking quiz catalog screenshot...');
    await page.goto('http://localhost:5173/quizzes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '08-quiz-catalog.png') });

    console.log('Taking quiz player screenshot...');
    await page.goto('http://localhost:5173/quizzes/math-quiz-t1-5ap');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '09-quiz-player.png') });

    console.log('Logging into admin...');
    await page.goto('http://localhost:5173/admin/login');
    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin1234');
    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);

    console.log('Taking admin quizzes list screenshot...');
    await page.goto('http://localhost:5173/admin/quizzes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '10-admin-quizzes.png') });

    console.log('Taking admin question builder screenshot...');
    await page.goto('http://localhost:5173/admin/quizzes/1/builder');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '11-admin-quiz-builder.png') });

    await browser.close();
    console.log('Done!');
})();
