require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const EBAY_INVENTORY_URL = "https://api.ebay.com/sell/inventory/v1/inventory_item";
const EBAY_OFFER_URL = "https://api.ebay.com/sell/inventory/v1/offer";
// const generateAccessToken = require("./accessTokenGen");

// Generate eBay Access Token
const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;

// File path for item details
const itemDetailsPath = path.join(__dirname, "item_details.json");

// Function to read item details
const readItemDetails = () => {
    try {
        const data = fs.readFileSync(itemDetailsPath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading item_details.json:", error);
        return [];
    }
};

// Create inventory item
async function createInventoryItem(item) {
    const { itemCode, title, description, roundedPrice, images, categoryId, quantity} = item;

    if (!itemCode || !title || !description || !roundedPrice || !images.length || !categoryId) {
        console.log(itemCode, title, description, price, images, categoryId);
        console.error(`Missing required fields for item: ${itemCode}`);
        return { success: false };
    }

    const requestBody = {
        "sku": itemCode,
        "locale": "en_GB",
        "product": {
            "title":title,
            "description": description,
            "aspects": {
                "Brand": ["Generic"],
            },
            "imageUrls": images,
        },
        "availability": {
            "shipToLocationAvailability": {
               "quantity": quantity,
                "shipToLocationCountry": "GB",
            },
        },
        "condition": "NEW",
        "category": categoryId,
        "merchantLocationKey": "GB_LONDON",
    };

    try {
        const response = await fetch(`${EBAY_INVENTORY_URL}/${itemCode}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB",
            },
            body: JSON.stringify(requestBody),
        });

        console.log(`Inventory item created successfully: ${itemCode}`);
        return { success: true };
    } catch (error) {
        console.error(`Error creating inventory item for SKU: ${itemCode}`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Create an offer for the item
async function createOffer(item) {
    const { itemCode, roundedPrice, categoryId, quantity } = item;
    let stockQuantity = quantity - 10;
    if(stockQuantity <= 10){
        stockQuantity = 0;
    }else{
        stockQuantity -= 10;
    }

    const requestBody = {
        "sku": itemCode,
        "marketplaceId": "EBAY_GB",
        "format": "FIXED_PRICE",
        "availableQuantity": stockQuantity,
        "listingPolicies": {
            "paymentPolicyId": process.env.PAYMENT_POLICY_ID,
            "returnPolicyId": process.env.RETURN_POLICY_ID,
            "fulfillmentPolicyId": process.env.FULFILLMENT_POLICY_ID,
        },
        "pricingSummary": {
            "price": {
                "value": roundedPrice,
                "currency": "GBP",
            },
        },
        "categoryId": categoryId,
        "merchantLocationKey": "GB_LONDON",
        "quantityLimitPerBuyer": 1,
        "includeCatalogProductDetails": true,
    };

    try {
        const response = await axios.post(`${EBAY_OFFER_URL}`, requestBody, {
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB",
            },
        });

        console.log(`Offer created successfully for SKU: ${itemCode}`);
        return { success: true, offerId: response.data.offerId };
    } catch (error) {
        console.error(`Error creating offer for SKU: ${itemCode}`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Publish the offer
async function publishOffer(offerId, itemCode) {
    try {
        const response = await axios.post(`${EBAY_OFFER_URL}/${offerId}/publish`, {}, {
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB",
            },
        });

        console.log(`Offer for SKU: ${itemCode} published successfully.`);
        return { success: true };
    } catch (error) {
        console.error(`Error publishing offer for SKU: ${itemCode}`, error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Process items from JSON and list on eBay
async function processAndPublishItems() {
    console.log("Starting eBay item upload process...");
    
    const items = readItemDetails();
    if (items.length === 0) {
        console.log("No items found in item_details.json");
        return;
    }

    for (const item of items) {
        console.log(`Processing SKU: ${item.itemCode}`);

        // Step 1: Create Inventory Item
        const inventoryResult = await createInventoryItem(item);
        if (!inventoryResult.success) {
            console.error(`Skipping SKU: ${item.itemCode} due to inventory item creation failure.`);
            continue;
        }

        // Step 2: Create Offer
        const offerResult = await createOffer(item);
        if (!offerResult.success) {
            console.error(`Skipping SKU: ${item.itemCode} due to offer creation failure.`);
            continue;
        }

        // Step 3: Publish Offer
        // const publishResult = await publishOffer(645450805016, item.itemCode);
        // if (!publishResult.success) {
        //     console.error(`Skipping SKU: ${item.itemCode} due to offer publication failure.`);
        //     continue;
        // }

        console.log(`Item ${item.itemCode} successfully listed on eBay!`);
    }
}

// Run the script
processAndPublishItems();
