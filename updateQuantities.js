const fs = require("fs");
require('dotenv').config();

const EBAY_QUANTITY_UPDATE_URL = process.env.EBAY_QUANTITY_UPDATE_URL;
const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;


async function updateEbayItemQuantity(sku, quantity) {
    const requestBody = {
        sku,
        availability: {
            shipToLocationAvailability: {
                quantity,
            },
        },
    };

    try {
        const response = await fetch(`${EBAY_QUANTITY_UPDATE_URL}/${sku}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Content-Language": "en-GB",
                "Accept-Language": "en-GB"
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!responseText) {
            console.error(`Empty response received for SKU ${sku}`);
            return;
        }
        
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error updating SKU ${sku}:`, data);
        } else {
            console.log(`Successfully updated SKU ${sku} with quantity ${quantity}`);
        }
    } catch (error) {
        console.error(`Error making API request for SKU ${sku}:`, error.message);
    }
}

async function processSkuResults(filePath) {
    try {
        const skuResults = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const results = [];
        for (const { sku, quantity } of skuResults) {
            if (quantity === null || quantity < 0) {
                console.log(`Skipping SKU: ${sku} due to invalid quantity`);
                continue;
            }

            const result = await updateEbayItemQuantity(sku, quantity);
            results.push(result);
        }

        console.log("All SKUs processed:");

        fs.writeFileSync("sandbox_sku_creation_results.json", JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error processing SKU results file:", error.message);
    }
}

processSkuResults("sku_results.json");
