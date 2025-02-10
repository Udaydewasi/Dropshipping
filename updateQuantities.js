const fs = require("fs");
require("dotenv").config({ path: '/home/uday/Dropshipping/.env' });

const EBAY_BULK_UPDATE_URL = "https://api.ebay.com/sell/inventory/v1/bulk_update_price_quantity";
// const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;
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

//accesstoken generation
// (async () => {
//     await token();
// })();

async function updateEbayItemQuantity(offerId, sku, quantity) {
    
    const requestBody = {
            "requests": [
                {
                "offers": [
                    {
                    "availableQuantity": quantity,
                    "offerId": offerId
                    }
                  ],
                "shipToLocationAvailability":
                    {
                    "quantity": quantity
                    },
                "sku": sku
                }
             ]
    };

    try {
        const response = await fetch(EBAY_BULK_UPDATE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();
        // console.log(responseData);

        if (response.ok) {
            console.log(`Successfully updated SKU ${sku} with quantity ${quantity}`);
        } else {
            console.error(`Error while updating SKU: ${sku}`, responseData);
        }
    } catch (error) {
        console.error(`Error making API request for SKU: ${sku}:`, error.message);
    }
}

async function processSkuResults(filePath) {
    try {
        const skuResults = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const results = [];
        for (const { offerId, sku, quantity} of skuResults) {
            let newq = quantity - 10;
            if (newq === null || newq < 0) {
                console.log(`Changed the quantity for SKU: ${sku} due to invalid value`);
                newq = 0;
            }

            await updateEbayItemQuantity(offerId, sku, newq);
            results.push({ sku, newq});
        }

        console.log("All SKUs processed successfully.");
        fs.writeFileSync("quantity_update_results.json", JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Error processing SKU results file:", error.message);
    }
}

// Run the function with the SKU file
const filePath = "/home/uday/Dropshipping/sku_results.json";

// processSkuResults(filePath);

(async () => {
    await token(); // Wait for token generation
    await processSkuResults("/home/uday/Dropshipping/sku_results.json"); // Process after token is ready
  })();