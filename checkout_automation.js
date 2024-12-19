const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/automate', async (req, res) => {
    let browser = null;

    try {
        console.log("Launching Puppeteer...");
        browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Step 1: Go to the product page
        const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
        console.log(`Navigating to: ${productURL}`);

        await page.goto(productURL, {
            waitUntil: 'networkidle2',
            timeout: 60000, // Increased timeout
        });

        // Step 2: Handle Privacy Popup
        const privacySelector = 'button#shopify-pc__banner__btn-accept';
        if (await page.$(privacySelector)) {
            console.log("Dismissing Privacy Popup...");
            await page.click(privacySelector);
            await page.waitForTimeout(1000); // Small delay
        }

        // Step 3: Click "Buy it now"
        const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
        console.log("Clicking 'Buy it now' button...");
        await page.waitForSelector(buyNowSelector, { visible: true, timeout: 60000 });
        await page.click(buyNowSelector);

        // Step 4: Wait for the Checkout Page
        console.log("Waiting for checkout page...");
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

        const checkoutURL = page.url();
        console.log(`Checkout URL fetched: ${checkoutURL}`);

        // Respond with the Checkout URL
        res.json({ success: true, checkoutURL });

    } catch (error) {
        console.error("Error during automation:", error.message);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
