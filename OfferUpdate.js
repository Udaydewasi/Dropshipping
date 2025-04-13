const fs = require('fs');
const axios = require("axios");
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

async function updateOffer(offer) {
    try {
        await new Promise(resolve => setTimeout(resolve, 200));

        const requestBody = {
            "sku": offer.sku,
            "marketplaceId": "EBAY_GB",
            "format": "FIXED_PRICE",
            "availableQuantity": offer.availableQuantity,
            // "listingDescription": offer.description,
            "listingPolicies": {
                "paymentPolicyId": process.env.PAYMENT_POLICY_ID,
                "returnPolicyId": process.env.RETURN_POLICY_ID,
                "fulfillmentPolicyId": process.env.FULFILLMENT_POLICY_ID,
            },
            "pricingSummary": {
                "price": {
                    "value": offer.pricingSummary.price.value,
                    "currency": "GBP",
                },
            },
            "categoryId": offer.categoryId,
            "merchantLocationKey": "GB_LONDON",
            "quantityLimitPerBuyer": "0"
        };
        
        try {
            const response = await axios.put(`https://api.ebay.com/sell/inventory/v1/offer/${offer.offerId}`, requestBody, {
                headers: {
                    Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                    "Accept-Language": "en-GB",
                    "Content-Language": "en-GB",
                },
            });
            
            console.log(`Offer updated successfully : ${offer.offerId}`);
            return { success: true, offerId: offer.offerId };
        } catch (error) {
            console.error(`Error creating offer for SKU: ${offer.offerId}`, error.response?.data || error.message);
            return { success: false, error: error.message };
        }

    } catch (err) {
        console.error(`Failed to update offer ${offer.offerId}:`, err.message);
        return null;
    }
}

async function processOfferUpdateList(filePath) {
    try {
        console.log("Updating offer details, please wait...");
        
        // Properly read and parse JSON file
        const offerFile = fs.readFileSync(filePath, 'utf-8');
        const offers = JSON.parse(offerFile);
        
        // Validate we have an array of offers
        if (!Array.isArray(offers)) {
            throw new Error("Input file must contain an array of offers");
        }
        
        for (const offer of offers) {
            // Skip entries without offerId
            if (!offer.offerId) {
                console.log(`Skipping entry with missing offerId`);
                continue;
            }
            

            const result = await updateOffer(offer);
            console.log(`Processed offer ${offer.offerId}`);
        }
        
        return null;
    } catch (error) {
        console.error("Fatal error processing Offer list:", error.message);
        process.exit(1);
    }
}

(async () => {
    try {
        await token();
        await processOfferUpdateList("/home/uday/Dropshipping/offerDetails_results.json");
    } catch (error) {
        console.error("Application failed:", error.message);
        process.exit(1);
    }
})();