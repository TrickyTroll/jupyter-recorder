const puppeteer = require('puppeteer');
const PuppeteerMassScreenshots = require('puppeteer-mass-screenshots');

export function RecordCodeCell(pageURL, videosPath, cell) {
    // Cell is an int for which code cell to execute
    (async () => {
        const browser = await puppeteer.launch({ headless: true });
        const page = (await browser.pages())[0];
        const screenshots = new PuppeteerMassScreenshots();
        await screenshots.init(page, videosPath);
        await page.goto(pageURL);
        await screenshots.start();
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded'});
        const input = await page.$('input[name=q]');
        await input.type('puppetter-mass-screenshots', { delay: 250 });
        await input.press('Enter');
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await screenshots.stop();
        await browser.close();
    })();
}

async function getAllCells(page) {
        // page is an object created by the browser.
        const cells = await page.evaluate(() => {
                return document.getElementsByClassName("cell")
        });
        return cells
}

function isTextCell(cell) {
        // cell should be an element of the array returned by
        // GetAllCells
        var allClasses = cell.classList();
        if ("text_cell" in allClasses) {
                return true
        } else {
                return false
        }
}

async function scrollTo(page, firstCell, secondCell) {


}

function recordTransition(page, videoPath, firstCell, secondCell) {
        // Use scroll function
        // Scroll to the right place
        // Record the scrolling @60 fps
        // Stop recording
}

function recordCodeCell(page, videoPath, cell) {
        // Start recording @60 fps
        // Run code cell
        // Stop recording
}

function recordTextCell(page, videoPath, cell) {
        // Take a screenshot
}

export async function RecordNotebook(pageURL, savePath){

        // Loading page contents
        const browser = await puppeteer.launch({ headless: true});
        const page = (await browser.pages())[0];
        page.goto(pageURL);
        var allCells = GetAllCells(page);
        allCells.forEach(recordCell);
}
