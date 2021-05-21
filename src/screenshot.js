const puppeteer = require('puppeteer');
const pageURL = '';

export function Screenshot(pageURL) {
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(pageURL);
        await page.screenshot({ path: 'example.png' });

        await browser.close();
    })();
}
