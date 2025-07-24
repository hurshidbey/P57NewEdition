#!/bin/bash

echo "=== Click.uz Integration Monitor ==="
echo "Watching for Click.uz payment attempts..."
echo ""

# Monitor Click.uz activity
ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 \
  'docker logs -f protokol57-protokol57-1 2>&1 | grep --line-buffered -E "(CLICK|Payment URL generated|Transaction created|Successfully completed payment)" | while read line; do 
    echo "[$(date +"%H:%M:%S")] $line"
    if [[ $line == *"Payment URL generated"* ]]; then
      echo "✅ CLICK.UZ IS WORKING! Payment URL created successfully!"
    fi
    if [[ $line == *"Successfully completed payment"* ]]; then
      echo "🎉 PAYMENT COMPLETED! User upgraded to premium!"
    fi
  done'