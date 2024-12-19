const puppeteer = require('puppeteer-core');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Root endpoint to confirm server is running
app.get('/', (req, res) => {
  res.send("Server is up and running! Use /automate to trigger the automation.");
});

// Automation endpoint
app.get('/automate', async (req, res) => {
  console.log("✅ Automation request received...");
  res.json({ success: true, message: "Automation started..." });

  const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
  const privacyAcceptSelector = 'button#shopify-pc__banner__btn-accept';
  const buyNowSelector = 'button.shopify-payment-button__button--unbranded';

  try {
    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    console.log("🌍 Navigating to product page...");

    await page.goto(productURL, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log("🔎 Checking for privacy banner...");
    if (await page.$(privacyAcceptSelector)) {
      console.log("✅ Privacy popup found. Accepting...");
      await page.click(privacyAcceptSelector);
      await page.waitForTimeout(1000);
    } else {
      console.log("⏭ No privacy popup found.");
    }

    console.log("🛒 Waiting for 'Buy it now' button...");
    await page.waitForSelector(buyNowSelector, { timeout: 15000 });
    console.log("🖱 Clicking 'Buy it now' button...");
    await page.click(buyNowSelector);

    console.log("⏳ Waiting for checkout page...");
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    const checkoutURL = page.url();
    console.log("✅ Checkout URL:", checkoutURL);

    await browser.close();
    console.log("🎉 Automation completed successfully!");

    // Log result to Render Logs for debugging
    console.log("🔗 Checkout URL sent:", checkoutURL);
  } catch (error) {
    console.error("❌ Error during automation:", error.message || error);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
