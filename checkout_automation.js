app.get('/automate', async (req, res) => {
  const retries = 3;
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
      await page.goto(PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 60000 }); // 60 seconds

      const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
      console.log("Looking for 'Buy it now' button...");
      await page.waitForSelector(buyNowSelector, { visible: true });
      await page.click(buyNowSelector);

      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      const checkoutURL = page.url();
      console.log("Checkout page URL:", checkoutURL);

      await browser.close();
      res.json({ success: true, checkoutURL });
      return;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        res.status(500).json({ success: false, error: "Failed after multiple attempts." });
      }
    }
  }
});
