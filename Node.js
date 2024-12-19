const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/automate', async (req, res) => {
  try {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";

    console.log("Navigating to product page...");
    await page.goto(productURL, { waitUntil: 'networkidle2' });

    const privacySelector = 'button#shopify-pc__banner__btn-accept';
    if (await page.$(privacySelector)) {
      console.log("Clicking Privacy Popup...");
      await page.click(privacySelector);
    }

    console.log("Looking for 'Buy it now' button...");
    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    await page.waitForSelector(buyNowSelector, { visible: true });
    await page.click(buyNowSelector);

    console.log("Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }); // Increase timeout to 60s

    const checkoutURL = page.url();
    console.log(`Checkout URL fetched: ${checkoutURL}`);

    await browser.close();
    res.json({ success: true, checkoutURL });
  } catch (error) {
    console.error("Error in Puppeteer automation:", error);
    res.status(500).json({ success: false, error: "Failed to fetch checkout URL." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
