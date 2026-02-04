#!/usr/bin/env bash
set -e

# Load .env from project root if present
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

if [ -z "${MURAL_API_KEY:-}" ]; then
  echo "Error: MURAL_API_KEY is not set in .env"
  exit 1
fi

WEBHOOK_ID="c2f6e7fc-6a0f-4c22-9845-a32d872640bd"

echo "Updating webhook $WEBHOOK_ID URL..."

curl --request PATCH \
  --url "https://api-staging.muralpay.com/api/webhooks/$WEBHOOK_ID" \
  --header "accept: application/json" \
  --header "authorization: Bearer $MURAL_API_KEY" \
  --header "content-type: application/json" \
  --data '{
  "url": "https://mural-backend.vercel.app/webhooks/muralpay"
}'

echo ""
