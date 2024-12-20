const express = require('express'); // Import Express
const puppeteer = require('puppeteer-core'); // Import Puppeteer

const app = express(); // Initialize Express app
const PORT = process.env.PORT || 3000; // Port for the server
const CHROME_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome';
const PRODUCT_URL = process.env.PRODUCT_URL || "https://5fbqad-qz.myshopify.com/products/gift-service";

// Route to handle automation
app.get('/automate', async (req, res) => {
  const retries = 3; // Retry logic
  for (let i = 0; i < retries; i++) {
    try {
      console.log("Starting Puppeteer...");
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: CHROME_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      console.log(`Attempt ${i + 1}: Navigating to product page: ${PRODUCT_URL}`);
      await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 60000 });

      // Step 1: Dismiss Privacy Policy Popup
      const privacySelector = 'button#shopify-pc__banner__btn-accept';
      if (await page.$(privacySelector)) {
        console.log("Dismissing Privacy Policy popup...");
        await page.click(privacySelector);
        await page.waitForTimeout(1000);
      }

      // Step 2: Click "Buy it now"
      const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
      console.log("Looking for 'Buy it now' button...");
      await page.waitForSelector(buyNowSelector, { visible: true });
      console.log("Clicking 'Buy it now' button...");
      await page.click(buyNowSelector);

      // Step 3: Wait for Checkout Page
      console.log("Waiting for checkout page...");
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

      const checkoutURL = page.url();
      console.log("Checkout page URL fetched:", checkoutURL);

      await browser.close();
      res.json({ success: true, checkoutURL });
      return; // Exit on success

    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        res.status(500).json({ success: false, error: "Failed after multiple attempts." });
      }
    }
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send("Welcome to the Shopify Checkout Automation Service!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
