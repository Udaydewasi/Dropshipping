const EBAY_ACCOUNT_URL = "https://api.ebay.com/sell/account/v1";
const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;

async function getPolicies(policyType) {
    try {
        const response = await fetch(`${EBAY_ACCOUNT_URL}/${policyType}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`Fetched ${policyType}:`, data);
            return data.policies.map(policy => ({
                id: policy.fulfillmentPolicyId || policy.paymentPolicyId || policy.returnPolicyId,
                name: policy.name,
            }));
        } else {
            console.error(`Error fetching ${policyType}:`, data);
            return [];
        }
    } catch (error) {
        console.error(`Error:`, error.message);
        return [];
    }
}

(async () => {
    console.log("Fetching Fulfillment Policies...");
    const fulfillmentPolicies = await getPolicies("fulfillment_policy");

    console.log("Fetching Payment Policies...");
    const paymentPolicies = await getPolicies("payment_policy");

    console.log("Fetching Return Policies...");
    const returnPolicies = await getPolicies("return_policy");

    console.log({ fulfillmentPolicies, paymentPolicies, returnPolicies });
})();
