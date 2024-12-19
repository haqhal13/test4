const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("Server is up! Use /automate to trigger automation.");
});

app.get('/automate', async (req, res) => {
  console.log("✅ Automation request received...");

  const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
  const privacyAcceptSelector = 'button#shopify-pc__banner__btn-accept';
  const buyNowSelector = 'button.shopify-payment-button__button--unbranded';

  let checkoutURL = "";

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      dumpio: true,
    });

    const page = await browser.newPage();
    console.log("🌍 Navigating to product page...");

    await page.goto(productURL, { waitUntil: 'networkidle2', timeout: 90000 });

    if (await page.$(privacyAcceptSelector)) {
      console.log("✅ Accepting privacy popup...");
      await page.click(privacyAcceptSelector);
      await page.waitForTimeout(1000);
    }

    console.log("🖱 Clicking 'Buy it now'...");
    await page.waitForSelector(buyNowSelector, { timeout: 15000 });
    await page.click(buyNowSelector);

    console.log("⏳ Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 90000 });
    checkoutURL = page.url();
    console.log("✅ Checkout URL:", checkoutURL);

    await browser.close();

    // Respond with the checkout URL
    res.json({ success: true, checkoutURL });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
