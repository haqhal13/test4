const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/automate', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome', // Use Render's default Chrome path
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Step 1: Go to the product page
    const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
    await page.goto(productURL, { waitUntil: 'networkidle2' });

    // Step 2: Handle Privacy Popup
    const privacySelector = 'button#shopify-pc__banner__btn-accept';
    if (await page.$(privacySelector)) {
      console.log("Dismissing Privacy Popup...");
      await page.click(privacySelector);
    }

    // Step 3: Click "Buy it now"
    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    await page.waitForSelector(buyNowSelector, { visible: true });
    await page.click(buyNowSelector);

    // Step 4: Wait for Checkout Page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const checkoutURL = page.url();

    // Close Browser
    await browser.close();

    // Respond with Checkout URL
    res.json({ message: 'Success!', checkoutURL });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
