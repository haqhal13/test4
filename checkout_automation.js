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
      await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 60000 }); // Extended timeout

      // Step 1: Dismiss Privacy Policy Popup if present
      const privacySelector = 'button#shopify-pc__banner__btn-accept';
      if (await page.$(privacySelector)) {
        console.log("Dismissing Privacy Policy popup...");
        await page.click(privacySelector);
        await page.waitForTimeout(1000); // Short delay to ensure popup closes
      }

      // Step 2: Click "Buy it now" button
      const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
      console.log("Looking for 'Buy it now' button...");
      await page.waitForSelector(buyNowSelector, { visible: true });
      console.log("Clicking 'Buy it now' button...");
      await page.click(buyNowSelector);

      // Step 3: Wait for Checkout Page
      console.log("Waiting for checkout page to load...");
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

      // Fetch Checkout URL
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
