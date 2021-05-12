const puppeteer = require('puppeteer');
const PuppeteerVideoRecorder = require('puppeteer-video-recorder');

export function Record(pageURL) {
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const recorder = new PuppeteerVideoRecorder();
        await recorder.init(page, videosPath);
        await recorder.start();
        await recorder.stop();
    })();
}
