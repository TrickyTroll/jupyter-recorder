const puppeteer = require("puppeteer");
const PuppeteerMassScreenshots = require("puppeteer-mass-screenshots");

async function getAllCells(page) {
  // page is an object created by the browser.
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

function recordCodeCell(page, videoPath, cell) {
  // Cell shoud be an indice in the array of all cells.
  (async () => {
    await screenshots.init(page, videosPath);
    await screenshots.start();
    await unselectAll(page); // Making sure that no cell is selected.
    await page.evaluate(() => {
      var allCells = document.getElementByClassName("cell");
      var toRecord = allCells[cell];
      toRecord.classList.add("selected"); // Selecting the cell before running.
      document.getElementById("run_int").children[0].click(); // Pressing run.

      function addClassNameListener(elem) {
        var lastClassName = elem.className;
        window.setInterval(function () {
          var className = elem.className;
          if (className !== lastClassName) {
            return 1;
            lastClassName = className;
          }
        }, 10);
      }

      addClassNameListener(toRecord); // Should wait until cell is
      // done running.
    });
    await screenshots.stop();
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
  await page.$eval(".cell:last-child", (e) => {
    e.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
  });
}

export async function RecordNotebook(pageURL, savePath) {
  (async () => {
    const screenshots = new PuppeteerMassScreenshots();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      pageURL,
      { waitUntil: "networkidle0" }
    );
    await page.goto("http://localhost:8888/notebooks/python_by_example.ipynb", {
      waitUntil: "networkidle0",
    });

    const delay = 3000;
    // $$ means querySelectorAll
    const cells = await page.$$(".cell");
    const maxCell = cells.length;
    page.screenshot( {path: "example.png"} )

    // Going to first cell
    console.log(cells);
    await page.$eval(".cell", (e) => {
      e.scrollIntoView();
    });

    // Restarting notebook and clearing output
    const [button] = await page.$x(
      "//li[@id='restart_clear_output']/button[contains(., 'Restart & Clear Output')]"
    );
    if (button) {
      await button.click();
    }

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
