const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/automate', async (req, res) => {
  try {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome', // Google Chrome for Puppeteer
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Step 1: Go to the product page
    const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
    console.log("Navigating to product page...");
    await page.goto(productURL, { waitUntil: 'networkidle2' });

    // Step 2: Dismiss the privacy policy popup if it exists
    const privacySelector = 'button#shopify-pc__banner__btn-accept';
    if (await page.$(privacySelector)) {
      console.log("Dismissing Privacy Policy popup...");
      await page.click(privacySelector);
    }

    // Step 3: Click "Buy it now" button
    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    console.log("Clicking 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { visible: true });
    await page.click(buyNowSelector);

    // Step 4: Wait for the checkout page to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const checkoutURL = page.url();
    console.log("Checkout page loaded:", checkoutURL);

    // Close the browser
    await browser.close();

    // Respond with the checkout URL
    res.json({ success: true, checkoutURL });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
