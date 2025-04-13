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

const processTitle = (title) => {
    let processed = title;
    
    // Step 1: First remove obvious measurements (more precise patterns)
    processed = processed
        // Remove dimensions with units (4ft 2" x 2ft 2")
        .replace(/\d+(\.\d+)?\s*(ft|in|cm|m|mm|"|'|Litre?|L|mL|kg|g|oz|lb)(\s*(x|by)\s*\d+(\.\d+)?\s*(ft|in|cm|m|mm|"|'|Litre?|L|mL|kg|g|oz|lb))?/gi, ' ')
        // Remove measurements in parentheses (1.27 x 0.67m)
        .replace(/\([^)]*\)/g, ' ')
        // Remove standalone measurements (600 Litre)
        .replace(/(^|\s)\d+\s*(ft|in|cm|m|mm|"|'|Litre?|L|mL|kg|g|oz|lb)\b/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return processed.length > 80 
        ? processed.substring(0, 80).trim() 
        : processed;
};

// Function to format features and description properly
const formatDescription = (description, features, specifications) => {
    const formatSpecifications = (specs) => {
        return specs.map(spec => `<tr><td>${spec.name}</td><td>${spec.value}</td></tr>`).join("");
    };

    // Clean features HTML and convert to bullet points without DOM
    const formatFeatures = (html) => {
        // If already in <ul><li> format, return as-is (with minor cleanup)
        if (html.includes('<ul>') && html.includes('<li>')) {
            return html.replace(/&nbsp;/g, ' ').trim();
        }
    
        // Process <p> tags or plain-text bullet points
        let featuresText = html
            // Replace <p> tags with newlines (to split into items)
            .replace(/<\/?p>/g, '\n')
            // Replace <br> with newlines
            .replace(/<br\s?\/?>/g, '\n')
            // Remove other HTML tags but keep their text content
            .replace(/<[^>]+>/g, ' ')
            // Convert &nbsp; to normal spaces
            .replace(/&nbsp;/g, ' ')
            // Trim each line
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
    
        // Extract bullet points (lines starting with "-" or "•")
        const bulletPoints = featuresText
            .map(line => {
                // Keep existing bullets (e.g., "- Text" → "<li>Text</li>")
                if (line.startsWith('- ') || line.startsWith('• ')) {
                    return `<li>${line.substring(2).trim()}</li>`;
                }
                // Convert non-bullet lines into list items (if meaningful)
                else if (line.length > 3) {  // Skip very short lines
                    return `<li>${line}</li>`;
                }
                return null;
            })
            .filter(Boolean);  // Remove null entries
    
        return bulletPoints.length > 0 
            ? `<ul>${bulletPoints.join('')}</ul>` 
            : '';
    };

    return `
        <h3>Features</h3>
        ${formatFeatures(features)}
        
        <h3>Description</h3>
        <div>${description}</div>
        
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
        const title = response.data?.name || '';
        const description = response.data?.description || '';
        const p = response.data?.basePrice?.formattedValue || '';
        const features = response.data?.summary || '';
        const specifics = response.data?.classifications?.flatMap(classification => classification.features) || [];
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
        const priceStr = p.replace(/£|,/g, ''); // Removes "£" AND commas
        const price = 1.4 * parseFloat(priceStr);
        const roundedPrice = price.toFixed(2); // Rounds to 2 decimal places

        const formattedTitle = processTitle(title);
        let formattedDescription = formatDescription(description, features, specifications);
        if(formattedDescription.length > 3900) {
            formattedDescription = formattedDescription.substring(0, 3900).trim()
        }

        const aspects = {};
        specifications.forEach(spec => {
           aspects[spec.name] = [spec.value];
        });
        return { itemCode, categoryId, quantity, title: formattedTitle, roundedPrice, aspects, description: formattedDescription, images };
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
        console.log(`Processing SKU : ${item.itemCode}`)
        const details = await fetchProductDetails(item);
        results.push(details);
    }

    // Save results to item_details.json
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');
    console.log('Item details saved to item_details.json');
};

// Run the script
processItems();