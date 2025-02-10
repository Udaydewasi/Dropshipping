const fs = require('fs');
const path = require('path');
const axios = require('axios');

// File paths
const inputFilePath = path.join(__dirname, 'itemcode.txt');
const outputFilePath = path.join(__dirname, 'item_details.json');

// Function to read item codes and category IDs from the file
const readItemCodes = async () => {
    try {
        const data = fs.readFileSync(inputFilePath, 'utf8');
        return data.split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
            const [itemCode, categoryId] = line.split(',').map(part => part.trim());
            return { itemCode, categoryId };
        });
    } catch (error) {
        console.error('Error reading itemcode.txt:', error);
        return [];
    }
};

// Function to format features and description properly
// Function to format features and description properly
const formatDescription = (description, features, specifications) => {
    const formatSpecifications = (specs) => {
        return specs.map(spec => `<tr><td>${spec.name}</td><td>${spec.value}</td></tr>`).join("");
    };

    // Convert features into bullet points using HTML <ul> list
    const featureList = features
        .split(/[\.\-•]/) // Split by common separators
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .map(f => `<li>${f}</li>`)
        .join("");

    return `
        <h3>Features</h3>
        <ul>${featureList}</ul>
        
        <h3>Description</h3>
        <p>${description}</p>
        
        <h3>Specifications</h3>
        <table border="1">${formatSpecifications(specifications)}</table>
    `;
};



// Function to fetch product details from the API
const fetchProductDetails = async ({ itemCode, categoryId }) => {
    const url = `https://www.costco.co.uk/rest/v2/uk/products/${itemCode}/?fields=FULL&lang=en_GB&curr=GBP`;

    try {
        const response = await axios.get(url, { responseType: 'json' });

        // Extract details safely
        const title = response.data?.englishName || 'Title not found';
        const description = response.data?.description || 'Description not found';
        const p = response.data?.basePrice?.formattedValue || 'Price not available';
        const features = response.data?.summary || 'Features not found';
        const specifics = response.data?.classifications?.[0]?.features || [];
        const quantity = response.data?.stock.stockLevel || 0;
        const imagess = response.data?.images || [];
        const specifications = [];
        const images = [];

        // Extract specifications
        if (Array.isArray(specifics)) {
            specifics.forEach(feature => {
                if (feature?.name && feature?.featureValues?.[0]?.value) {
                    specifications.push({
                        name: feature.name,
                        value: feature.featureValues[0].value
                    });
                }
            });
        }

        // Extract images
        if (Array.isArray(imagess)) {
            imagess.forEach(image => {
                if (image?.format === 'superZoom-webp') {
                    images.push(`https://www.costco.co.uk${image.url}`);
                }
            });
        }

        // Convert price and apply markup
        const price = 1.4 * (p.replace("£", ""));
        const roundedPrice = parseFloat(price).toFixed(2);

        // Format description properly
        const formattedDescription = formatDescription(description, features, specifications);

        return { itemCode, categoryId, quantity, title, roundedPrice, description: formattedDescription, images };
    } catch (error) {
        console.error(`Error fetching details for item code ${itemCode}:`, error.message);
        return { itemCode, categoryId, error: 'Failed to fetch details' };
    }
};

// Main function to process all item codes
const processItems = async () => {
    const items = await readItemCodes();
    
    if (items.length === 0) {
        console.log('No item codes found in itemcode.txt');
        return;
    }

    console.log(`Fetching details for ${items.length} items...`);
    const results = [];

    for (const item of items) {
        const details = await fetchProductDetails(item);
        results.push(details);
    }

    // Save results to item_details.json
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');
    console.log('Item details saved to item_details.json');
};

// Run the script
processItems();
