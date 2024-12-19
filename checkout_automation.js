const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Render uses the PORT environment variable

// Root route to confirm the server is running
app.get('/', (req, res) => {
  res.send("Server is up and running! Use /automate to trigger the automation.");
});

// Automation route
app.get('/automate', async (req, res) => {
  console.log("Automation started...");
  res.json({ success: true, message: "Automation has started, please wait..." });

  const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";

  try {
    // Launch Puppeteer with optimized settings
    const browser = await puppeteer.launch({
      headless: true, // Headless mode for speed
      executablePath: '/usr/bin/google-chrome', // Render-compatible Chrome path
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
      ],
    }).catch(error => {
      console.error("Puppeteer failed to launch:", error);
      return res.json({ success: false, error: "Puppeteer failed to launch" });
    });

    const page = await browser.newPage();

    // Step 1: Navigate to the product page with increased timeout
    console.log("Navigating to product page...");
    await page.goto(productURL, {
      waitUntil: 'networkidle2',
      timeout: 60000, // Increased timeout to 60 seconds
    });

    // Step 2: Accept privacy popup if it exists
    const privacyAcceptSelector = 'button#shopify-pc__banner__btn-accept';
    if (await page.$(privacyAcceptSelector)) {
      console.log("Dismissing privacy popup...");
      await page.click(privacyAcceptSelector);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Short pause
    }

    // Step 3: Click "Buy it now" button
    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    console.log("Clicking 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { timeout: 10000 });
    await page.click(buyNowSelector);

    // Step 4: Wait for the checkout page to load
    console.log("Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // Step 5: Get the checkout URL
    const checkoutURL = page.url();
    console.log("Checkout URL:", checkoutURL);

    // Close browser
    await browser.close();

    // Send the checkout URL as a response
    return res.json({ success: true, checkoutURL });

  } catch (error) {
    console.error("Error during automation:", error);
    return res.json({ success: false, error: "An error occurred during automation." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Access it at http://localhost:${PORT}`);
});
