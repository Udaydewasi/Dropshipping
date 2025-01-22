const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fetchProductQuantity(sku) {
    const QUANTITY_FETCH_URL = process.env.QUANTITY_FETCH_URL;
    const url = `${QUANTITY_FETCH_URL}/${sku}/?fields=stock`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.stock && data.stock.stockLevel !== undefined) {
            return { sku, quantity: data.stock.stockLevel };
        } else {
            console.error(`Stock information is not available for SKU: ${sku}`);
            return { sku, quantity: null };
        }
    } catch (error) {
        console.error(`Error fetching product quantity for SKU: ${sku}`, error.message);
        return {sku, quantity: null};
    }
}

async function processSkuList(filePath) {
    try {
        console.log("fetching quantity please wait......")
        const skus = fs.readFileSync(filePath, 'utf-8').split('\n').map(sku => sku.trim()).filter(Boolean);

        const results = [];
        for (const sku of skus) {
            const result = await fetchProductQuantity(sku);
            results.push(result);
        }

        const outputFilePath = path.join(__dirname, 'sku_results.json');
        fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
        console.log(`Results written to ${outputFilePath}`);
    } catch (error) {
        console.error("Error processing SKU list:", error.message);
    }
}


const skuFilePath = path.join(__dirname, 'skus.txt');
processSkuList(skuFilePath);