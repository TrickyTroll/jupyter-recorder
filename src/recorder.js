import puppeteer from 'puppeteer';
import fs from 'fs';
import PuppeteerMassScreenshots from 'puppeteer-mass-screenshots';

async function unselectAll(page) {
    await page.evaluate(() => {
        cells = document.getElementsByClassName('cell');
        for (let k = 0; k < cells.length; k++) {
            cells[k].classList.remove('selected');
        }
    });
}

async function selectCell(page, cell) {
    // `cell` is an element of `page`.
    // Unselects all cells and selects just one.
    await unselectAll(page);
    // Select cell at index `cell`.
    await page.evaluate((element) => element.classList.add('selected'), cell);
}

async function goToNext(page, cellIndex) {
    const allCodeCells = await page.$$('.code_cell');
    let todo = allCodeCells[cellIndex];
    await page.evaluate((element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }, todo);
    await selectCell(page, todo);
}

async function runCell(page, todo, screenshots) {
    // Todo is a cell element from the page.
    // Running a cell
    // Letting some time to run
    let delay = 3000;
    await page.waitForTimeout(delay);
    await screenshots.start();
    await page.evaluate(
        // This is a mess
        // Waiting for the text in the in [ ] part of the page becomes a number.
        (cell) => {
            let toggle = cell.children[0].children[0].children[0].childNodes[1].data.split('')[2]
            console.log(`State is: ${toggle}`)
            while (!(toggle !== ' ' || toggle !== '*')) {
                let toClick = document.querySelector('#run_int > button:nth-child(1)');
                toClick.click();
            }
        }, todo
    );
    await page.waitForTimeout(delay);

    await screenshots.stop();
}

function makeRequiredDirs(projectRoot, maxCodeCell) {
    if (projectRoot.slice(-1) !== '/') {
        projectRoot += '/';
    }
    for (let i = 0; i < maxCodeCell; i++) {
        fs.mkdir(projectRoot + `cell_${i}`, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
}

async function recordAllCode(pageURL, savePath, fileName) {
    (async () => {
        // Launching the web page
        const screenshots = new PuppeteerMassScreenshots();
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        // This first page needs to be loaded first for authentification.
        await page.goto(pageURL, { waitUntil: 'networkidle0' });
        const notebookURL = pageURL.split('/').slice(0, -1).join('/');
        console.log(`Loading ${notebookURL}/notebooks/${fileName}`);
        await page.goto(`${notebookURL}/notebooks/${fileName}`, {
            waitUntil: 'networkidle0',
        });

        const delay = 3000;
        // $$ means querySelectorAll
        const codeCells = await page.$$('.code_cell');
        const maxCell = codeCells.length;
        makeRequiredDirs(savePath, maxCell);

        // Going to first code cell
        await page.$eval('.code_cell', (element) => element.scrollIntoView());

        // Kernel needs to be restarted each run (and all output cleared)
        await page.evaluate(() => {
            let kernel = document.querySelector('#kernellink');
            kernel.click();
            let restart = document.querySelector(
                '#restart_clear_output > a:nth-child(1)'
            );
            restart.click();
        });
        await page.waitForTimeout(2000);
        await page.$eval(
            'body > div.modal.fade.in > div > div > div.modal-footer > button.btn.btn-default.btn-sm.btn-danger',
            (elem) => elem.click()
        );
        // TODO: I should wait for something better than a timeout.
        await page.waitForTimeout(5000); // Waiting for the kernel to restart
        // Fixing save path
        if (savePath.split(-1) !== '/') {
            savePath += '/';
        }
        // Defining code cells.
        const allCells = await page.$$('.code_cell');
        // For every code cell
        for (let i = 0; i < codeCells.length; i++) {
            let fullSavePath = savePath + `cell_${i}`;
            await goToNext(page, i);
            await page.waitForTimeout(1000)
            let todo = allCells[i];
            await screenshots.init(page, fullSavePath);
            // Start taking screenshots.
            await runCell(page, todo, screenshots);
        }
        await page.waitForTimeout(delay);
        // Not sure why this next line is needed.

        // Closing
        await browser.close();
    })();
}

export { recordAllCode }; // Not using `recordNotebook` for now.
