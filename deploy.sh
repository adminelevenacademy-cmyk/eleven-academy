#!/bin/bash
SITE_ID="spontaneous-haupia-45174f"
INDEX_FILE="index.html"

# Get file hash
FILE_HASH=$(cat "$INDEX_FILE" | openssl dgst -sha256 -hex | awk '{print $2}')

echo "Uploading with curl to Netlify..."
curl -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/files" \
  -H "Content-Type: application/json" \
  -d "{
    \"files\": {
      \"/$INDEX_FILE\": \"$(base64 "$INDEX_FILE")\"
    }
  }" 2>&1 | head -20

echo -e "\n\nAlternatively, attempting unauthenticated publish..."
