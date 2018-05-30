#!/bin/bash

FILE='owner.json'
  
if [ -f $FILE ]; then
   echo "File $FILE exists. Refusing to overwrite account set..."
   echo "Delete existing accounts before trying again..."

   TIMESTAMP=$(date +%s)
   `tar zcvf wallet-backup-$TIMESTAMP.tgz *.json`

   echo "created backup of your wallets: wallet-backup-$TIMESTAMP.tgz"

else

   echo "File $FILE does not exist."

   echo 'creating owner wallet'
   `node mkwallets.js | head -1 > owner.json`

   echo 'creating validator wallets'
   `node mkwallets.js | head -1 > w1.json`
   `node mkwallets.js | head -1 > w2.json`
   `node mkwallets.js | head -1 > w3.json`

   echo 'creating alice wallet'
   `node mkwallets.js | head -1 > alice.json`

fi


