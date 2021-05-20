import puppeteer from "puppeteer";
import fs from 'fs';
import PuppeteerMassScreenshots from "puppeteer-mass-screenshots";

async function unselectAll(page) {
    await page.evaluate(() => {
        cells = document.getElementsByClassName("cell");
        for (let k = 0; k < cells.length; k++) {
            cells[k].classList.remove("selected");
        }
    });
}

async function goToNext(page, cellIndex) {
    const allCodeCells = await page.$$(".code_cell");
    let todo = allCodeCells[cellIndex];
    await page.evaluate((element) => {
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, todo);
}

async function selectCell(page, cell) {
    // `cell` is an element of `page`.
    // Unselects all cells and selects just one.
    unselectAll(page);
    // Select cell at index `cell`.
    await page.evaluate((element) => element.classList.add("selected"), cell);
}

async function runCell(page, cellIndex) {
    // `cellIndex` should be an index in the list that contains
    // every cell.
    const allCells = await page.$$(".code_cell");
    let todo = allCells[cellIndex];
    // Selecting cell
    selectCell(page, todo);

    // Running a cell
    const [button] = await page.$x(
        // This is the `run` button.
        "/html/body/div[3]/div[3]/div[2]/div/div/div[5]/button[1]"
    );
    if (button) {
        button.click(); // TODO: wait for cell completion.
    }
    // console.log(todo)
    await page.waitForFunction( // This is a mess
        (cell) => cell.children[0].children[0].children[0].childNodes[1].data.split("")[2] !== " ",
        {},
        todo
    );
}

function makeRequiredDirs(projectRoot, maxCodeCell) {
    if (projectRoot.slice(-1) !== "/") {
        projectRoot += "/";
    }
    for (var i = 0; i < maxCodeCell; i++) {
        fs.mkdir(projectRoot + `cell_${i}`, { recursive: true }, (err) => {
            if (err) throw err;
        });
    }
}

async function recordNotebook(pageURL, savePath) {
    (async () => {
        const screenshots = new PuppeteerMassScreenshots();
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(pageURL, { waitUntil: "networkidle0" });
        await page.goto("http://localhost:8888/notebooks/python_by_example.ipynb", {
            waitUntil: "networkidle0",
        });

        const delay = 3000;
        // $$ means querySelectorAll
        const cells = await page.$$(".cell");
        const maxCell = cells.length;

        // Going to first cell
        await page.$eval(".cell", (e) => {
            e.scrollIntoView();
        });

        // Start taking screenshots.
        let count = 0;
        await screenshots.init(page, savePath);
        await screenshots.start();
        do {
            await page.$eval(".cell:last-child", (e) => {
                e.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
            });
            count++;
        } while (maxCell > count);
        await page.waitForTimeout(delay);

        // Closing
        await screenshots.stop();
        await browser.close();
    })();
}

async function recordAllCode(pageURL, savePath) {
    (async () => {
        const screenshots = new PuppeteerMassScreenshots();
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(pageURL, { waitUntil: "networkidle0" });
        await page.goto("http://localhost:8888/notebooks/python_by_example.ipynb", {
            waitUntil: "networkidle0",
        });

        const delay = 3000;
        // $$ means querySelectorAll
        const codeCells = await page.$$(".code_cell");
        const maxCell = codeCells.length;
        makeRequiredDirs(savePath, maxCell);

        // Going to first code cell
        await page.$eval(".code_cell", (element) => element.scrollIntoView());

        // Kernel needs to be restarted each run (and all output cleared)
        // Python program will probably spawn a new kernel each time.
        debugger;
        await page.evaluate(() => {
            let kernel = document.querySelector("#kernellink");
            kernel.click();
            let restart = document.querySelector("#restart_clear_output > a:nth-child(1)")
            restart.click();
        });
        await page.waitForTimeout(2000);
        await page.$eval('body > div.modal.fade.in > div > div > div.modal-footer > button.btn.btn-default.btn-sm.btn-danger', elem => elem.click());
        // TODO: I should wait for something better than a timeout.
        await page.waitForTimeout(5000); // Waiting for the kernel to restart
        // Fixing save path
        if (savePath.split(-1) !== "/") {
            savePath += "/";
        }
        // For every code cell
        for (var i = 0; i < codeCells.length; i++) {
            let fullSavePath = savePath + `cell_${i}`;
            goToNext(page, i);
            await screenshots.init(page, fullSavePath);
            // Start taking screenshots.
            await screenshots.start();
            runCell(page, i);
            await page.waitForTimeout(delay);
            await screenshots.stop();
        }
        // Not sure why this next line is needed.
        await page.waitForTimeout(delay);

        // Closing
        await browser.close();
    })();
}

export { recordAllCode };