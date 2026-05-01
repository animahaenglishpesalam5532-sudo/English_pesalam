const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/blogs/create');
  // wait for editor
  await page.waitForSelector('.jodit-wysiwyg');
  // click video button in toolbar
  await page.click('button[class*="jodit-toolbar-button__video"]');
  // wait for popup
  await page.waitForSelector('.jodit-ui-popup');
  // type url
  await page.fill('.jodit-ui-popup input[type="text"], .jodit-ui-popup input[placeholder*="URL"]', 'https://youtu.be/rxdlKVLlGNc?si=d1vO3q9H98biCsWM');
  // click insert
  await page.click('.jodit-ui-popup button:has-text("Insert")');
  // print html
  const html = await page.innerHTML('.jodit-wysiwyg');
  console.log("HTML:", html);
  await browser.close();
})();
