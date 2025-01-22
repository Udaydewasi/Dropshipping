const EBAY_API_URL = "https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item";
const EBAY_TOKEN = "v^1.1#i^1#r^0#p^3#I^3#f^0#t^H4sIAAAAAAAAAOVZX4wbxRm370/K5RKqKkBJlTZmEx7gWHv2n9deYYu9s33ncnd2vL78OSWyxruzd3u33vXtzJ7PVUmuVymoUCFoJR44hEIp4s8DbVUh8RBAKYgHCqh5iVSqqqoAqS9cKWpToKjqru9PfNc0odmgs1q/rGfmm5nv9/u+b2a+GbC4o+/O0yOn/747/JWuM4tgsSscZvpB347egRu7u77RGwJtAuEziwcXe5a6/3Q3hjWzLpUQrtsWRpGFmmlhqVWZolzHkmyIDSxZsIawRFRJkcdGJTYKpLpjE1u1TSqSz6QogVU5xCdZgQFMEnCMV2utj1m2U5SmMgLPxJEucqjKacBrx9hFeQsTaJEUxQJWoAFDs2wZ8BKflEA8yifYSSpyGDnYsC1PJAqodEtdqdXXadP1yqpCjJFDvEGodF7OKQU5n8mOl++OtY2VXuNBIZC4eHNpyNZQ5DA0XXTlaXBLWlJcVUUYU7H06gybB5XkdWWuQf0W1ZousojXEFShVgW8el2ozNlODZIr6+HXGBqtt0QlZBGDNK/GqMdGdQapZK007g2Rz0T8zyEXmoZuICdFZQflYxNKtkRFlGLRsecNDWk+UobjecAIQpxKE4Q9CpFTcTXY1FDDU3FtttUh17jeMt2QbWmGzxyOjNtkEHmqo60EcW0EeUIFq+DIOvHVapeLrxMpxid9y66a0iXTlm9cVPPYiLSKVzfDul9c8oTr5RmqlkxqQGf0KifoAqO3e4Yf69fqHWnfQHKxGPN1QVXYpGvQmUWkbkIV0apHr1tDjqFJ3rQsl9ARrcWTOs0ndZ2uClqcZnSEAELVqppM/N85CSGOUXUJ2nCUrQ0tpClKUe06KtqmoTaprSKt1WfNLRZwipompC7FYo1GI9rgorYzFWMBYGJHx0YVdRrVILUha1xdmDZaPqsirxc2JNKse9oseP7nTW5NUWnO0YrQIc1Bt+mVFWSa3mfdhzdpmN5a+x+gDpmGx0PZm6izkI7YmCAtEDQNzRsqqhjaNiLzY/0y6GgmEDLTnjKsMUSm7e3Edhlc/qqQzwTC5i2ikHQWKkbkRIERmXgyEDI45aDWqrN6COksjPLQULZYzgaznVyv52s1l8CqifId5po8Fxc47voYMLt24Nos5sf69mL0N+aKIpdGA8Gsu+62rpmXAWbXxMpcXLCdZjwQNP/EJBlQl4g9i6zO2/VK2Vwpq4xUyoV7s+OBkJaQ7iA8XfZxdlooyofknOz9xgqxSX18eGS+1BiAJANyMIdz5dhsxjHFUcHQEiXMuOKsVp8hLKmpcw6YH5kbGFeG8qpbZLmZnJxKBSJJQaqDrmmz8WP9yyOortYaE+awbhijpcN6STwC4VGnUI7V3BGkHFmQxXLTcEr1ydjsoWAElDszDJxV5620orTilQKBzE513HqW4AU9CaoCk+QBhDqvalXACQlN13WVYzgYeBfuMLwTa1kgvfFHGTzqpaYiUFWWg7QqcHFO4NSA+9aXY2Y/1rd/69o4fPjFzrJuUT42lh0vK2wFVPwMoCIPl7LZsUvXUNeGGPtZeGch9ftjbwBYN6L+WSKq2rWYDV0y7VdVWhpHvohQDHu5e1R3Td0wzdaV1RfvZVjzXgfPof6bmQzLh4WDJdR2zVANs8NsMjwYLN9EmuEglVRcx6DSXqyf7SRwExvXZ/SWNZTGcw1EZvTqQrBlxXOWTrxJKMqKcqRQCpaPZtB8p+2EYkKM6xByNMsKkOahxtBQ4Hm6muDFJJdIMpoYbPf/H7g92VLRdlv7b7f1sc1vZulQ68cshd8ES+E3usJhkAE0MwDu2NE90dO9i8IGQVEMLa1qL0S9RDCKjSkLEtdB0VnUrEPD6doT+vVc6K7FnSOxnz9wfGmgPNMM3dD2dHfmBLh14/Gur5vpb3vJA/sutfQyX/36blYADMsCnk+C+CQ4cKm1h7ml56bn73968RenHvzHwWcff+G+T76lmCO/SYHdG0LhcG+oZykcCv1o4oab33mf3HxTX/eev+U/f+u1C9FnH/8Vm3/q3PHv33OWfOfGnT9bfuu1O/b/8OTwqXtmXrzwPi+dn0trd65YvZPRR0Pn7PeePN41/O7ZfX985OSnPfv351LffPfsE7c/9fyFExM/ee/0Tz+c/aj5+tvnl3PLbxz+4JW75h75ww+qF//yYubV+1Y+eXDxwr7471InCysPP7lUeOmJYf3IwWeWP/tu163D/T2fv/57UXzsa5Mfn1r4pfbx3kefPvR25cDKLL5Y7n/ouW/fPvrP3zZ27aDPL58I/3XXqVdrn+7p2/vhwbHQy7ctv7RMnXuMU79Hho69gx7K7FSPl9/svx/2PHDLZ+GPnjnw56MXbwtN7L33xx+E6ZVVm/4LkuFvX1QdAAA="; // eBay Sandbox OAuth token


async function updateEbayItemQuantity(sku, quantity) {
    const requestBody = {
        sku,
        availability: {
            shipToLocationAvailability: {
                quantity,
            },
        },
    };

    try {
        const response = await fetch(`${EBAY_API_URL}/${sku}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${EBAY_TOKEN}`,
                "Content-Type": "application/json",
                "Content-Language": "en-GB",
                "Accept-Language": "en-GB"
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (!responseText) {
            console.error(`Empty response received for SKU ${sku}`);
            return;
        }
        
        const data = await response.json();

        if (!response.ok) {
            console.error(`Error updating SKU ${sku}:`, data);
        } else {
            console.log(`Successfully updated SKU ${sku} with quantity ${quantity}`);
        }
    } catch (error) {
        console.error(`Error making API request for SKU ${sku}:`, error.message);
    }
}

updateEbayItemQuantity("469831", 20);
