const querystring = require("querystring");
require('dotenv').config();

const EBAY_ACCESS_TOKEN_URL = process.env.EBAY_ACCESS_TOKEN_URL;

const EBAY_CLIENT_ID = process.env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = process.env.EBAY_CLIENT_SECRET;
const EBAY_REFRESH_TOKEN = process.env.EBAY_REFRESH_TOKEN;

async function generateAccessToken() {
    try {
        // Encoding client ID and secret for Basic Auth
        const encodedCredentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");

        // Setting up the request payload
        const body = querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: EBAY_REFRESH_TOKEN,
            scope: "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.finances"
        });        

        // Sending the request to eBay's API
        const response = await fetch(EBAY_ACCESS_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${encodedCredentials}`
            },
            body: body
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Error generating access token:", error);
            return null;
        }

        const data = await response.json();
        console.log("Access Token Generated Successfully!");
        // console.log("Access Token:", data.access_token);
        console.log("Expires in:", data.expires_in, "seconds");
        return data.access_token;
    } catch (error) {
        console.error("Error generating access token:", error.message);
        return null;
    }
}

// Call the function
// generateAccessToken();

module.exports = generateAccessToken;
