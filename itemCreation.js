require("dotenv").config();
const fs = require("fs");

const EBAY_ITEM_CREATION_URL = process.env.EBAY_ITEM_CREATION_URL;
const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;

async function createEbaySku(sku, quantity) {
    const requestBody = {
        "requests": [
            {
                "sku": sku,
                "locale": "en_GB",
                "availability": {
                        "shipToLocationAvailability": {
                            "quantity": quantity
                        }
                },
                "product": {
                    "title": "Boston Terriers Collector",
                    "aspects": {
                        "Country/Region of Manufacture": [
                            "England"
                        ]
                    },
                    "description": "All Ears by Dan Hatala. A limited edition from the collection entitled ",
                    "imageUrls": [
                        "https:......*....."
                    ]
                },
                "condition": "NEW",
                "conditionDescription": "Mint condition. Kept in styrofoam case. Never displayed."
            }
        ]
    };

    try {
        const response = await fetch(EBAY_ITEM_CREATION_URL, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`Error creating SKU ${sku}:`, error);
            return { sku, success: false, error };
        }

        console.log(`Successfully created SKU: ${sku}`);
        return { sku, success: true };
    } catch (error) {
        console.error(`Unexpected error creating SKU ${sku}:`, error.message);
        return { sku, success: false, error: error.message };
    }
}

createEbaySku("TEST_SKU_111", 0);

// async function processSkuResults(filePath) {
//     try {
//         const skuResults = JSON.parse(fs.readFileSync(filePath, "utf-8"));

//         const results = [];
//         for (const { sku, quantity } of skuResults) {
//             if (quantity === null || quantity < 0) {
//                 console.log(`Skipping SKU: ${sku} due to invalid quantity`);
//                 continue;
//             }

//             const result = await createEbaySku(sku, quantity);
//             results.push(result);
//         }

//         console.log("All SKUs processed:");

//         fs.writeFileSync("sandbox_sku_creation_results.json", JSON.stringify(results, null, 2));
//     } catch (error) {
//         console.error("Error processing SKU results file:", error.message);
//     }
// }

// //call to function with the input file
// processSkuResults("sku_results.json");