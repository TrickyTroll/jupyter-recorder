const puppeteer = require("puppeteer");
const PuppeteerMassScreenshots = require("puppeteer-mass-screenshots");

function isTextCell(cell) {
  // cell should be an element of the array returned by
  // GetAllCells
  var allClasses = cell.classList;
  if (allClasses.contains("text_cell")) {
    return true;
  } else {
    return false;
  }
}

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

async function getCodeCells(page) {
  const allCells = page.$$(".cell");
  return allCells;
}

async function selectCell(page, cell) {
  // `cell` is an element of `page`.
  // Unselects all cells and selects just one.
  await page.$$eval(".cells", (cell) => cell.classList.remove("selected"));
  // Select cell at index `cell`.
  await page.evaluate((cell) => {
    cell.classList.add("selected");
  });
}

async function runCell(page, cellIndex) {
  // `cellIndex` should be an index in the list that contains
  // every cell.
  let all = getCodeCells(page);
  let todo = all[cellIndex];
  console.log(`Using cell ${todo}`);
  // Selecting cell
  selectCell(page, todo);

  // Running a cell
  const [button] = await page.$x(
    // This is the `run` button.
    "/html/body/div[3]/div[3]/div[2]/div/div/div[5]/button[1]"
  );
  if (button) {
    console.log("Running cell");
    button.click();
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
    page.screenshot({ path: "example.png" });

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
