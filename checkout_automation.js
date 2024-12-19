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
  console.log("Automation process started...");
  res.json({ success: true, message: "Automation started..." });

  const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
  const privacyAcceptSelector = 'button#shopify-pc__banner__btn-accept';
  const buyNowSelector = 'button.shopify-payment-button__button--unbranded';

  try {
    // Launch Puppeteer with optimized settings
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode for Render
      executablePath: '/usr/bin/google-chrome', // Render-compatible Chrome path
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
      ],
    });

    console.log("Opening a new page...");
    const page = await browser.newPage();

    // Step 1: Navigate to the product page
    console.log("Navigating to product page...");
    await page.goto(productURL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Step 2: Accept privacy popup if it appears
    console.log("Checking for privacy popup...");
    if (await page.$(privacyAcceptSelector)) {
      console.log("Privacy popup found. Accepting...");
      await page.click(privacyAcceptSelector);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Short delay
    } else {
      console.log("No privacy popup found.");
    }

    // Step 3: Click the 'Buy it now' button
    console.log("Waiting for 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { timeout: 15000 });
    console.log("Clicking 'Buy it now' button...");
    await page.click(buyNowSelector);

    // Step 4: Wait for the checkout page to load
    console.log("Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // Step 5: Get the checkout URL
    const checkoutURL = page.url();
    console.log("Checkout URL:", checkoutURL);

    // Close Puppeteer browser
    await browser.close();
    console.log("Automation completed successfully.");

    // Send the checkout URL as the response
    res.json({ success: true, checkoutURL });

  } catch (error) {
    console.error("Error during automation:", error);

    // Graceful error response
    res.status(500).json({ success: false, error: error.message || "An error occurred during automation." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. Access it at http://localhost:${PORT}`);
});
