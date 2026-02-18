const { chromium } = require('playwright');

async function testLoanDetails() {
    let browser;
    try {
        console.log('Launching browser...');
        // Try to launch browser, handling potential environment issues
        try {
            browser = await chromium.launch();
        } catch (e) {
            console.log('Failed to launch chromium, trying with channel chrome');
            browser = await chromium.launch({ channel: 'chrome' });
        }

        const context = await browser.newContext();
        const page = await context.newPage();

        console.log('Navigating to login...');
        await page.goto('http://localhost:8080/staff-login');

        await page.fill('input[type="email"]', 'admin@mandt.placeholder');
        await page.fill('input[type="password"]', 'Admin@2026');
        await page.click('button[type="submit"]');

        console.log('Waiting for dashboard...');
        await page.waitForTimeout(2000); // Wait for navigation

        console.log('Navigating to applications...');
        await page.goto('http://localhost:8080/staff-dashboard/applications');
        await page.waitForSelector('table');

        console.log('Clicking first view button...');
        // Click the first "View" button (Eye icon)
        // We look for button with an SVG inside that looks like an eye, or just the first button in the actions column
        // The actions column is the last one.
        // Specific selector for the first eye button in the last column
        await page.locator('tbody tr:first-child td:last-child button:has(svg.lucide-eye)').click();

        console.log('Waiting for details page...');
        await page.waitForSelector('h1', { timeout: 5000 });

        const url = page.url();
        console.log(`Current URL: ${url}`);

        if (!url.includes('/staff-dashboard/applications/')) {
            throw new Error('Did not navigate to details page');
        }

        const title = await page.textContent('h1');
        console.log(`Page Title: ${title}`);

        // Check for specific details sections
        const hasApplicantInfo = await page.isVisible('text=Applicant Information');
        const hasFinancials = await page.isVisible('text=Employment & Financials');
        const hasLoanSummary = await page.isVisible('text=Loan Summary');

        console.log(`Has Applicant Info: ${hasApplicantInfo}`);
        console.log(`Has Financials: ${hasFinancials}`);
        console.log(`Has Loan Summary: ${hasLoanSummary}`);

        if (hasApplicantInfo && hasFinancials && hasLoanSummary) {
            console.log('TEST PASSED: Full-page view loaded correctly');
        } else {
            console.log('TEST FAILED: Missing sections');
            process.exit(1);
        }

    } catch (err) {
        console.error('TEST FAILED:', err);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
}

testLoanDetails();
