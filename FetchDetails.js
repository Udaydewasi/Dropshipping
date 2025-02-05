const fs = require('fs');
const path = require('path');
const axios = require('axios');

// File paths
const inputFilePath = path.join(__dirname, 'itemcode.txt');
const outputFilePath = path.join(__dirname, 'item_details.json');

// Function to read item codes from the file
const readItemCodes = async () => {
    try {
        const data = fs.readFileSync(inputFilePath, 'utf8');
        return data.split(/\r?\n/).filter(line => line.trim() !== '');
    } catch (error) {
        console.error('Error reading itemcode.txt:', error);
        return [];
    }
};

// Function to fetch product details from the API
const fetchProductDetails = async (itemCode) => {
    const url = `https://www.costco.co.uk/rest/v2/uk/products/${itemCode}/?fields=FULL&lang=en_GB&curr=GBP`;

    try {
        const response = await axios.get(url, { responseType: 'json' });

        // Extract details safely
        const title = response.data?.englishName || 'Title not found';
        const description = response.data?.description || 'Description not found';
        const price = response.data?.price?.formattedValue || 'Price not available';
        const features = response.data?.summary || 'Features not found';
        const specifics = response.data?.classifications?.[0]?.features || [];
        const imagess = response.data?.images || "Image not found";
        const specifications = [];
        const images = [];

        if (Array.isArray(specifics)) {
            specifics.forEach(feature => {
                    specifications.push({
                        name: feature?.name,
                        value: feature?.featureValues?.[0]?.value
                    });
            });
        }
        // console.log(imagess);
        if (Array.isArray(imagess)) {
            imagess.forEach(image => {
                if(image?.format == 'superZoom-webp'){
                    console.log(image?.url);
                    images.push(
                        `https://www.costco.co.uk${image?.url}`
                    )
                }
            });
        }

        return { itemCode, title, price, features, description, specifications, images };
    } catch (error) {
        console.error(`Error fetching details for item code ${itemCode}:`, error.message);
        return { itemCode, error: 'Failed to fetch details' };
    }
};

// Main function to process all item codes
const processItems = async () => {
    const itemCodes = await readItemCodes();
    
    if (itemCodes.length === 0) {
        console.log('No item codes found in itemcode.txt');
        return;
    }

    console.log(`Fetching details for ${itemCodes.length} items...`);
    const results = [];

    for (const itemCode of itemCodes) {
        const details = await fetchProductDetails(itemCode);
        results.push(details);
    }

    // Save results to item_details.json
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');
    console.log('Item details saved to item_details.json');
};

// Run the script
processItems();
