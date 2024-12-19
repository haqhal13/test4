const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("Server is up and running! Use /automate to trigger the automation.");
});

app.get('/automate', async (req, res) => {
  res.json({ success: true, message: "Automation started..." });
  console.log("Automation started...");

  const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";

  try {
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode for speed
      executablePath: '/usr/bin/google-chrome', // Adjust path for your environment
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions'
      ],
    });

    const page = await browser.newPage();
    console.log("Navigating to product page...");

    // Step 1: Navigate to the product page
    await page.goto(productURL, { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 // Increased timeout to 60 seconds
    });

    // Step 2: Accept privacy popup if it exists
    const privacyAcceptSelector = 'button#shopify-pc__banner__btn-accept';
    if (await page.$(privacyAcceptSelector)) {
      console.log("Dismissing privacy popup...");
      await page.click(privacyAcceptSelector);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to ensure interaction
    }

    // Step 3: Click "Buy it now" button
    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    console.log("Clicking 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { timeout: 10000 });
    await page.click(buyNowSelector);

    // Step 4: Wait for the checkout page to load
    console.log("Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });

    // Get the checkout page URL
    const checkoutURL = page.url();
    console.log("Checkout URL:", checkoutURL);

    await browser.close();

    // Send the checkout URL as a response
    res.json({ success: true, checkoutURL });
  } catch (error) {
    console.error("Error during automation:", error);
    res.json({ success: false, error: "An error occurred during automation." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Access it at http://localhost:${PORT}`);
});
