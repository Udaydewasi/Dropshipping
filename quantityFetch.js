const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/uday/Dropshipping/.env' });
const QUANTITY_FETCH_URL = process.env.QUANTITY_FETCH_URL;

const generateAccessToken = require('./accessTokenGen');
let EBAY_ACCESS_TOKEN = null;
async function token() {
    try{
        EBAY_ACCESS_TOKEN = await generateAccessToken();
        // console.log(`Access Token is : ${EBAY_ACCESS_TOKEN}`);
    }catch{
        console.log("Error while token genrating");
    }
}

async function fetchProductQuantity(sku) {
    const url = `${QUANTITY_FETCH_URL}/${sku}/?fields=stock`;
    let offerId = null; // Initialize offerId to null

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const offerResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer?sku=${sku}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
        });

        if (offerResponse.ok) {
            const offerData = await offerResponse.json();
            // Check if offers array exists and has at least one element
            if (offerData.offers && offerData.offers.length > 0) {
                offerId = offerData.offers[0].offerId;
            } else {
                console.error(`No offers found for SKU: ${sku}`);
            }
        } else {
            console.error(`Error fetching offers for SKU: ${sku} - Status: ${offerResponse.status}`);
        }
        console.log(offerId)
        if (data.stock && data.stock.stockLevel !== undefined) {
            return { offerId, sku, quantity: data.stock.stockLevel };
        } else {
            console.error(`Stock information unavailable for SKU: ${sku}`);
            return { offerId, sku, quantity: null };
        }
    } catch (error) {
        console.error(`Error processing SKU: ${sku}`, error.message);
        return { offerId, sku, quantity: null }; // offerId is always defined
    }
}

async function processSkuList(filePath) {
    try {
        console.log("fetching quantity please wait......")
        const skus = fs.readFileSync(filePath, 'utf-8').split('\n').map(sku => sku.trim()).filter(Boolean);

        const results = [];
        for (const sku of skus) {
            const result = await fetchProductQuantity(sku);
            results.push(result);
        }

        const outputFilePath = path.join(__dirname, 'sku_results.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
        console.log(`Results written to ${outputFilePath}`);
    } catch (error) {
        console.error("Error processing SKU list:", error.message);
    }
}


const skuFilePath = path.join(__dirname, 'skus.txt');
// processSkuList(skuFilePath);

(async () => {
    await token(); // Wait for token generation
    await processSkuList("/home/uday/Dropshipping/skus.txt"); // Process after token is ready
  })();