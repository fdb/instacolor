const puppeteer = require('puppeteer');
const HEADER_HEIGHT = 650;
const PAGE_WIDTH = 1024;
const PAGE_HEIGHT = 2700;

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT});
  await page.goto('https://www.instagram.com/AndrewOsadchuk/');
  const closeButton = await page.$('[aria-label="Close"]');
  if (closeButton) {
    closeButton.click();
  }
  await page.screenshot({path: 'example.png', clip: { x: 0, y: HEADER_HEIGHT, width: PAGE_WIDTH, height: PAGE_HEIGHT - HEADER_HEIGHT }});
  await browser.close();
}

main().then(() => {

  console.log('Done.');
});
