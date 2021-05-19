const puppeteer = require("puppeteer");
const fs = require('fs');
const PuppeteerMassScreenshots = require("puppeteer-mass-screenshots");

async function scrollTo(page, secondCell) {
  await page.evaluate(() => {
    secondCell.scrollIntoView();
  });
}

async function unselectAll(page) {
  await page.evaluate(() => {
    cells = document.getElementsByClassName("cell");
    for (let k = 0; k < cells.length; k++) {
      cells[k].classList.remove("selected");
    }
  });
}

async function recordTransition(page, videoPath, firstCell, secondCell) {
  (async () => {
    await screenshots.init(page, videosPath);
    await screenshots.start();
    await scrollTo(page, secondCell); // I think this is how it works..
    await screenshots.stop();
    await browser.close();
  })();
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function getCount(page) {
  return await page.$$eval(".cell", (a) => a.length);
}

async function scrollDown(page) {
  // Scrolls down to the last cell.
  await page.$eval(".cell:last-child", (e) => {
    e.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
  });
}

async function selectCell(page, cell) {
  // `cell` is an element of `page`.
  // Unselects all cells and selects just one.
  unselectAll(page);
  // Select cell at index `cell`.
  await page.evaluate((element) => element.classList.add("selected"), cell);
}

async function goToNext(page, cellIndex) {
  const allCells = await page.$$(".code_cell");
  let todo = allCells[cellIndex];
  await page.evaluate((element) => {
    element.scrollIntoView();
  }, todo);
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
    await Promise.all([
      button.click(), // TODO: wait for cell completion.
      // page.waitForFunction( // This does not work for now
      //   (cell) => { // Cell is an element in the document.
      //     let inVal = cell.children[0].children[0].children[0].childNodes[1].data;
      //     inVal.split("")[2] !== " "; // This is true when cell is done running.
      //   }, todo)
    ]);
  }
}

function makeRequiredDirs(projectRoot, maxCodeCell) {
  if (projectRoot.slice(-1) !== "/") {
    projectRoot += "/";
  }
  for(var i=0; i<maxCodeCell; i++) {
    fs.mkdir(projectRoot + `cell_${i}`, {recursive: true}, (err) => {
      if (err) throw err;
    });
  }
}

export async function recordNotebook(pageURL, savePath) {
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

    // Clearing all output
    // The Kernel is restarted using Python, not this program.
    await page.$$eval(".output", (e) => {
      for (var i = 0; i < e.length; i++) {
        e[i].parentNode.removeChild(e[i]);
      }
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

export async function recordAllCode(pageURL, savePath) {
  (async () => {
    const screenshots = new PuppeteerMassScreenshots();
    const browser = await puppeteer.launch( {headless: false} );
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

    // Clearing all output
    // The Kernel is restarted using Python, not this program.
    await page.$$eval(".output", (e) => {
      for (var i = 0; i < e.length; i++) {
        e[i].parentNode.removeChild(e[i]);
      }
    });

    // Fixing save path
    if (savePath.split(-1) !== "/") {
      savePath += "/";
    }
    // Start taking screenshots.
    for (var i=0; i<codeCells.length; i++) {
      let fullSavePath = savePath + `cell_${i}`;
      goToNext(page, i);
      await screenshots.init(page, fullSavePath);
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
