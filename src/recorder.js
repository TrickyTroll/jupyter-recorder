const puppeteer = require("puppeteer");
const PuppeteerMassScreenshots = require("puppeteer-mass-screenshots");

async function getAllCells(page) {
  // page is an object created by the browser.
  const cells = await page.evaluate(() => {
    return document.getElementsByClassName("cell");
  });
  return cells;
}

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
        for (let k=0; k<cells.length; k++) {
            cells[k].classList.remove("selected");
        }
    }
}

async function recordTransition(page, videoPath, firstCell, secondCell) {
  (async () => {
    await screenshots.init(page, videosPath);
    await screenshots.start();
    await scrollTo(page, secondCell);
    await screenshots.stop();
    await browser.close();
  })();
}

function recordCodeCell(page, videoPath, cell) {
  (async () => {
    await screenshots.init(page, videosPath);
    await screenshots.start();
    await scrollTo(page, secondCell);
    await screenshots.stop();
    await browser.close();
  })();
}

function recordTextCell(page, videoPath, cell) {
  // Take a screenshot
}

export async function RecordNotebook(pageURL, savePath) {
  // Loading page contents
  const browser = await puppeteer.launch({ headless: true });
  const page = (await browser.pages())[0];
  const screenshots = new PuppeteerMassScreenshots();
  page.goto(pageURL);
  var allCells = GetAllCells(page);
  allCells.forEach(recordCell);
}
