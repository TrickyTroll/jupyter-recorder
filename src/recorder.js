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

function recordCodeCell(page, videoPath, cell) {
    // Cell shoud be an indice in the array of all cells.
  (async () => {
    await screenshots.init(page, videosPath);
    await screenshots.start();
    await unselectAll(page); // Making sure that no cell is selected.
    await page.evaluate(() => {
        var allCells = document.getElementByClassName("cell");
        var toRecord = allCells[cell];
        toRecord.classList.add("selected") // Selecting the cell before running.
        document.getElementById("run_int").children[0].click() // Pressing run.

        function addClassNameListener(elem) {
            var lastClassName = elem.className;
            window.setInterval( function() {   
               var className = elem.className;
                if (className !== lastClassName) {
                    return 1
                    lastClassName = className;
                }
            },10);
        }

        addClassNameListener(toRecord); // Should wait until cell is
        // done running.
    });
    await screenshots.stop();
  })();
}

function recordTextCell(page, videoPath, cell) {
  // Take a screenshot
  return 1
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
