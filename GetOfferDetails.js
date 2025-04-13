const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '/home/uday/Dropshipping/.env' });

const generateAccessToken = require('./accessTokenGen');
let EBAY_ACCESS_TOKEN = null;

async function token() {
    try {
        EBAY_ACCESS_TOKEN = await generateAccessToken();
        console.log('Access token generated successfully');
    } catch (error) {
        console.error("Error while generating token:", error.message);
        throw error;
    }
}

async function fetchOfferDetails(offerId) {
    try {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const offerResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
        });

        if (!offerResponse.ok) {
            throw new Error(`HTTP error! status: ${offerResponse.status}`);
        }

        const offerData = await offerResponse.json();
        return offerData;

    } catch (err) {
        console.error(`Error processing Offer ${offerId}:`, err.message);
        return null;
    }
}

async function processOfferList(filePath) {
    try {
        console.log("Fetching offer details, please wait...");
        
        // Properly read and parse JSON file
        const offerFile = fs.readFileSync(filePath, 'utf-8');
        const offers = JSON.parse(offerFile);
        
        // Validate we have an array of offers
        if (!Array.isArray(offers)) {
            throw new Error("Input file must contain an array of offers");
        }

        const results = [];
        
        for (const offer of offers) {
            // Skip entries without offerId
            if (!offer.offerId) {
                console.log(`Skipping entry with missing offerId`);
                continue;
            }
            
            const result = await fetchOfferDetails(offer.offerId);
            results.push(result);
            console.log(`Processed offer ${offer.offerId}`);
        }

        const outputFilePath = path.join(__dirname, 'offerDetails_results.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
        console.log(`Successfully processed ${results.length} offers. Results saved to ${outputFilePath}`);
        
        return results;
    } catch (error) {
        console.error("Fatal error processing Offer list:", error.message);
        process.exit(1);
    }
}

(async () => {
    try {
        await token();
        await processOfferList("/home/uday/Dropshipping/offerId_results.json");
    } catch (error) {
        console.error("Application failed:", error.message);
        process.exit(1);
    }
})();