const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating...');
  await page.goto('https://informedeobra4-max.github.io/UTU-constructora/');
  await page.waitForTimeout(3000);
  
  console.log('Clicking logo...');
  const logo = page.locator('img').first();
  if (await logo.count() > 0) {
    await logo.click();
    await page.waitForTimeout(2000);
  }
  
  console.log('Adding new obra...');
  const addBtn = page.getByText('Agregar Nueva Obra');
  if (await addBtn.count() > 0) {
    await addBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('Setting name...');
    await page.locator('input[placeholder="Nombre de la obra"]').fill('Test E2E Playwright');
    
    console.log('Clicking Guardar...');
    await page.getByText('Guardar').click();
    await page.waitForTimeout(3000);
    
    const pageText = await page.content();
    console.log('Has Test E2E Playwright?', pageText.includes('Test E2E Playwright'));
  } else {
    console.log('Add button not found');
  }
  
  await browser.close();
})();
