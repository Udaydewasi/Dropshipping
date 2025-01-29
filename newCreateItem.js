require("dotenv").config();

const EBAY_INVENTORY_URL = "https://api.ebay.com/sell/inventory/v1/inventory_item";
const EBAY_OFFER_URL = "https://api.ebay.com/sell/inventory/v1/offer";
const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;

// Create inventory item
async function createInventoryItem(sku, title, description, price, quantity, imageUrl, categoryID, condition) {
    const requestBody = {
        "sku": sku,
        "locale": "en_GB",
        "product": {
            "title": title,
            "description": description,
            "aspects": {
                "Brand": ["Generic"],
                "Country/Region of Manufacture": ["China"]
            },
            "imageUrls": [imageUrl],
        },
        "availability": {
            "shipToLocationAvailability": {
                "quantity": quantity,
                "shipToLocationCountry": "GB",
            },
        },
        "condition": condition,
        "category": categoryID,
        "merchantLocationKey": "GB_LONDON"
    };    

    try {
        const response = await fetch(`${EBAY_INVENTORY_URL}/${sku}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            console.log(`Successfully created inventory item with SKU: ${sku}`);
            return { success: true };
        } else {
            const responseText = await response.text();
            console.error(`Error creating inventory item for SKU: ${sku}`, responseText);
            return { success: false, error: responseText };
        }
    } catch (error) {
        console.error(`Error creating inventory item:`, error.message);
        return { success: false, error: error.message };
    }
}

// Create an offer for the item
async function createOffer(sku, marketplaceID, price) {
    const requestBody = {
        "sku": sku,
        "marketplaceId": marketplaceID,
        "format": "FIXED_PRICE",
        "availableQuantity": 1,
        "listingPolicies": {
            "paymentPolicyId": process.env.PAYMENT_POLICY_ID,
            "returnPolicyId": process.env.RETURN_POLICY_ID,
            "fulfillmentPolicyId": process.env.FULFILLMENT_POLICY_ID,
        },
        "pricingSummary": {
            "price": {
                "value": price,
                "currency": "GBP",
            },
        },
        "categoryId": "261699",
        "merchantLocationKey": "GB_LONDON",
        "quantityLimitPerBuyer": 1,
        "includeCatalogProductDetails": true,
    };

    try {
        const response = await fetch(`${EBAY_OFFER_URL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB",
            },
            body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();
        if (response.ok) {
            console.log(`Offer created successfully for SKU: ${sku}`);
            return { success: true, offerId: responseData.offerId };
        } else {
            console.error(`Error creating offer for SKU: ${sku}`, responseData);
            return { success: false, error: responseData };
        }
    } catch (error) {
        console.error(`Error creating offer:`, error.message);
        return { success: false, error: error.message };
    }
}

// Publish the offer
async function publishOffer(offerId) {
    try {
        const response = await fetch(`${EBAY_OFFER_URL}/${offerId}/publish`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Accept-Language": "en-GB",
                "Content-Language": "en-GB"
            },
        });

        if (response.ok) {
            console.log(`Offer with ID: ${offerId} has been successfully published.`);
            return { success: true };
        } else {
            const responseText = await response.text();
            console.error(`Error publishing offer:`, responseText);
            return { success: false, error: responseText };
        }
    } catch (error) {
        console.error(`Error publishing offer:`, error.message);
        return { success: false, error: error.message };
    }
}

// Main function to create and publish item
async function createAndPublishItem({
    sku,
    title,
    description,
    price,
    quantity,
    imageUrl,
    categoryID,
    condition,
    marketplaceID = "EBAY_GB",
}) {
    console.log("Starting the process to create and publish an item...");

    // Step 1: Create Inventory Item
    const inventoryResult = await createInventoryItem(sku, title, description, price, quantity, imageUrl, categoryID, condition);
    if (!inventoryResult.success) {
        console.error("Failed to create inventory item. Exiting...");
        return;
    }

    // Step 2: Create Offer
    const offerResult = await createOffer(sku, marketplaceID, price);
    if (!offerResult.success) {
        console.error("Failed to create offer. Exiting...");
        return;
    }

    // Step 3: Publish Offer
    console.log(offerResult.offerId);
    const publishResult = await publishOffer(offerResult.offerId);
    if (!publishResult.success) {
        console.error("Failed to publish offer. Exiting...");
        return;
    }

    console.log("Item successfully created and published on eBay!");
}

// Example Usage
const itemData = {
    sku: "testsku6",
    title: "TEST Product for eBay",
    description: "This is a sample product created via eBay API.",
    price: 19.99,
    quantity: 1,
    imageUrl: "https://www.shutterstock.com/image-vector/household-appliances-on-white-background-vector-2474228997",
    categoryID: "261699",
    condition: "NEW",
};

createAndPublishItem(itemData);