const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/automate', async (req, res) => {
    let browser = null;

    try {
        console.log("Starting Puppeteer...");
        browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/google-chrome-stable', // Ensure path is correct
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();
        const productURL = "https://5fbqad-qz.myshopify.com/products/gift-service";
        console.log(`Navigating to product page: ${productURL}`);

        await page.goto(productURL, {
            waitUntil: 'networkidle2',
            timeout: 120000, // Increased timeout
        });

        console.log("Checking for privacy popup...");
        const privacySelector = 'button#shopify-pc__banner__btn-accept';
        if (await page.$(privacySelector)) {
            console.log("Clicking privacy popup...");
            await page.click(privacySelector);
            await page.waitForTimeout(1000);
        }

        console.log("Looking for 'Buy it now' button...");
        const buyNowSelector = 'button.shopify-payment-button__button--unbranded';
        await page.waitForSelector(buyNowSelector, { visible: true, timeout: 60000 });
        console.log("Clicking 'Buy it now' button...");
        await page.click(buyNowSelector);

        console.log("Waiting for checkout page...");
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 120000, // Ensure longer timeout
        });

        const checkoutURL = page.url();
        console.log(`Checkout URL fetched: ${checkoutURL}`);
        res.json({ success: true, checkoutURL });
    } catch (error) {
        console.error("Error:", error.message);
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
