const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;
const CHROME_EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome';
const PRODUCT_URL = process.env.PRODUCT_URL || "https://5fbqad-qz.myshopify.com/products/gift-service";

// Root route for testing
app.get('/', (req, res) => {
  res.send("Welcome to the Shopify Checkout Automation Service!");
});

// Automate route
app.get('/automate', async (req, res) => {
  try {
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log(`Navigating to product page: ${PRODUCT_URL}`);
    await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2' });

    const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
    console.log("Looking for 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { visible: true });
    await page.click(buyNowSelector);

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const checkoutURL = page.url();
    console.log("Checkout page URL:", checkoutURL);

    await browser.close();
    res.json({ success: true, checkoutURL });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
