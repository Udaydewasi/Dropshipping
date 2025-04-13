const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/uday/Dropshipping/.env' });

const generateAccessToken = require('./accessTokenGen');
let EBAY_ACCESS_TOKEN = null;

// Improved token handling with error propagation
async function token() {
    try {
        EBAY_ACCESS_TOKEN = await generateAccessToken();
        console.log('Access token generated successfully');
    } catch (error) {
        console.error("Error while generating token:", error.message);
        throw error; // Re-throw to stop execution if token fails
    }
}

async function fetchOfferId(sku) {
    let offerId = null;
    let error = null;

    try {
        // Add delay to prevent rate limiting (200ms between requests)
        // await new Promise(resolve => setTimeout(resolve, 200));
        
        const offerResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer?sku=${sku}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
        });

        if (!offerResponse.ok) {
            error = `HTTP error! status: ${offerResponse.status}`;
            throw new Error(error);
        }

        const offerData = await offerResponse.json();
        
        if (offerData.offers?.length > 0) {
            offerId = offerData.offers[0].offerId;
        } else {
            error = `No offers found for SKU: ${sku}`;
        }
    } catch (err) {
        error = err.message;
        console.error(`Error processing SKU ${sku}:`, error);
    }

    // Always return consistent structure
    return { 
        sku, 
        offerId, 
    };
}

async function processSkuList(filePath) {
    try {
        console.log("Fetching offerIds, please wait...");
        
        const skus = fs.readFileSync(filePath, 'utf-8')
            .split('\n')
            .map(sku => sku.trim())
            .filter(Boolean);

        const results = [];
        
        for (const sku of skus) {
            const result = await fetchOfferId(sku);
            results.push(result);
            console.log(`Processed ${sku}: ${result.offerId || 'No offer found'}`);
        }

        const outputFilePath = path.join(__dirname, 'offerId_results.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
        console.log(`Successfully processed ${results.length} SKUs. Results saved to ${outputFilePath}`);
        
        return results;
    } catch (error) {
        console.error("Fatal error processing SKU list:", error.message);
        process.exit(1); // Exit with error code
    }
}

(async () => {
    try {
        await token();
        await processSkuList("/home/uday/Dropshipping/skus.txt");
    } catch (error) {
        console.error("Application failed:", error.message);
        process.exit(1);
    }
})();