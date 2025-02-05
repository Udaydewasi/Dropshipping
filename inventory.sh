#!/bin/bash
export PATH=/home/uday/.nvm/versions/node/v22.4.0/bin:$PATH
export NODE_PATH=/home/uday/.nvm/versions/node/v22.4.0/lib/node_modules

echo "script is started"
node /home/uday/Dropshipping/quantityFetch.js

echo "Updating quantity..."
node /home/uday/Dropshipping/updateQuantities.js

echo "Script completed at: $(date +"%Y-%m-%d %H:%M:%S")"
echo "---------------------------------------"